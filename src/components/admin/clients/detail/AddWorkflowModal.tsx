'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import SearchableSelect, { Option } from '@/components/shared/inputs/SearchableSelect';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';

interface Workflow {
  _id: string;
  name: string;
  departmentId?: string;
  department?: string; // Department name from populated departmentId
  status: 'ACTIVE' | 'INACTIVE';
  timeSavedPerExecution?: number;
  moneySavedPerExecution?: number;
}

interface AddWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  clientId: string;
  workflow?: Workflow | null;
}

const AddWorkflowModal: React.FC<AddWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  workflow
}) => {
  const queryClient = useQueryClient();
  const isEditMode = !!workflow;

  const [formData, setFormData] = useState({
    name: '',
    department: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
    timeSavedPerExecution: '',
    moneySavedPerExecution: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data with workflow values when in edit mode
  useEffect(() => {
    if (isOpen) {
      if (workflow) {
        setFormData({
          name: workflow.name,
          department: workflow.department || '',
          status: workflow.status,
          timeSavedPerExecution: workflow.timeSavedPerExecution !== undefined
            ? String(workflow.timeSavedPerExecution)
            : '',
          moneySavedPerExecution: workflow.moneySavedPerExecution !== undefined
            ? String(workflow.moneySavedPerExecution)
            : ''
        });
      } else {
        // Reset form when not in edit mode
        setFormData({
          name: '',
          department: '',
          status: 'ACTIVE',
          timeSavedPerExecution: '',
          moneySavedPerExecution: ''
        });
      }
      setErrors({});
    }
  }, [workflow, isOpen]);

  // Fetch initial departments for the dropdown
  const { data: initialDepartments } = useQuery({
    queryKey: ['departments', 'initial'],
    queryFn: async () => {
      const response = await fetch('/api/admin/departments?limit=10');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      return data.departments || [];
    },
    enabled: isOpen,
    staleTime: 60000, // 1 minute
  });

  // Search function for departments
  const searchDepartments = async (query: string): Promise<Option[]> => {
    try {
      // Use React Query to fetch and cache departments
      const result = await queryClient.fetchQuery({
        queryKey: ['departments', query],
        queryFn: async () => {
          // If query is empty and we have initial departments, use them
          if (!query.trim() && initialDepartments && initialDepartments.length > 0) {
            return { departments: initialDepartments };
          }

          const response = await fetch(`/api/admin/departments?q=${encodeURIComponent(query)}&limit=5`);
          if (!response.ok) {
            throw new Error('Failed to fetch departments');
          }
          return response.json();
        },
        staleTime: 30000, // 30 seconds
      });

      // Map API response to options format - use department ID as value
      return (result.departments || []).map((dept: any) => ({
        value: dept._id, // Use the department ID as the value
        label: dept.name
      }));
    } catch (error) {
      console.error('Error searching departments:', error);

      // Fallback to local filtering if API fails
      if (initialDepartments && initialDepartments.length > 0) {
        return initialDepartments
          .filter((dept: any) => dept.name.toLowerCase().includes(query.toLowerCase()))
          .map((dept: any) => ({
            value: dept._id,
            label: dept.name
          }));
      }

      return [];
    }
  };

  // Handle department selection
  const handleDepartmentChange = (department: string) => {
    setFormData(prev => ({
      ...prev,
      department
    }));

    // Clear error when field is edited
    if (errors.department) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.department;
        return newErrors;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: name === 'timeSavedPerExecution' || name === 'moneySavedPerExecution'
        ? value === '' ? '' : value
        : value
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Workflow name is required';
    }

    // Validate numeric fields if they're not empty
    if (formData.timeSavedPerExecution && isNaN(Number(formData.timeSavedPerExecution))) {
      newErrors.timeSavedPerExecution = 'Time saved must be a valid number';
    }

    if (formData.moneySavedPerExecution && isNaN(Number(formData.moneySavedPerExecution))) {
      newErrors.moneySavedPerExecution = 'Money saved must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create workflow mutation
  const createWorkflow = useMutation({
    mutationFn: async (data: typeof formData) => {
      setIsSubmitting(true);
      const processedData = {
        ...data,
        departmentId: data.department, // Convert department to departmentId for the API
        timeSavedPerExecution: data.timeSavedPerExecution !== ''
          ? parseFloat(data.timeSavedPerExecution)
          : undefined,
        moneySavedPerExecution: data.moneySavedPerExecution !== ''
          ? parseFloat(data.moneySavedPerExecution)
          : undefined
      };
      
      // Remove the department field as we're using departmentId for the API
      delete (processedData as any).department;

      const response = await fetch(`/api/admin/clients/${clientId}/workflows`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create workflow');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch workflows
      queryClient.invalidateQueries({ queryKey: ['client-workflows', clientId] });

      // Call the parent component's onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }

      showToast('Workflow created successfully', 'success');
      setIsSubmitting(false);
    },
    onError: (error) => {
      handleApiError(error, 'Failed to create workflow');
      setIsSubmitting(false);
    }
  });

  // Update workflow mutation
  const updateWorkflow = useMutation({
    mutationFn: async (data: typeof formData & { workflowId: string }) => {
      setIsSubmitting(true);
      const processedData = {
        ...data,
        departmentId: data.department, // Convert department to departmentId for the API
        timeSavedPerExecution: data.timeSavedPerExecution !== ''
          ? parseFloat(data.timeSavedPerExecution)
          : undefined,
        moneySavedPerExecution: data.moneySavedPerExecution !== ''
          ? parseFloat(data.moneySavedPerExecution)
          : undefined
      };
      
      // Remove the department field as we're using departmentId for the API
      delete (processedData as any).department;

      const response = await fetch(`/api/admin/clients/${clientId}/workflows`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(processedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update workflow');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch workflows
      queryClient.invalidateQueries({ queryKey: ['client-workflows', clientId] });

      // Call the parent component's onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }

      showToast('Workflow updated successfully', 'success');
      setIsSubmitting(false);
    },
    onError: (error) => {
      handleApiError(error, 'Failed to update workflow');
      setIsSubmitting(false);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      if (isEditMode && workflow) {
        updateWorkflow.mutate({
          ...formData,
          workflowId: workflow._id
        });
      } else {
        createWorkflow.mutate(formData);
      }
    }
  };

  const resetForm = () => {
    if (workflow) {
      setFormData({
        name: workflow.name,
        department: workflow.department || '',
        status: workflow.status,
        timeSavedPerExecution: workflow.timeSavedPerExecution !== undefined
          ? String(workflow.timeSavedPerExecution)
          : '',
        moneySavedPerExecution: workflow.moneySavedPerExecution !== undefined
          ? String(workflow.moneySavedPerExecution)
          : ''
      });
    } else {
      setFormData({
        name: '',
        department: '',
        status: 'ACTIVE',
        timeSavedPerExecution: '',
        moneySavedPerExecution: ''
      });
    }
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-buttonBorder flex justify-between items-center">
          <h3 className="text-lg font-medium">{isEditMode ? 'Edit Workflow' : 'Add New Workflow'}</h3>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-textSecondary hover:text-textPrimary"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1">
                Workflow Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-buttonBorder'} rounded-md focus:outline-none focus:ring-1 focus:ring-buttonPrimary`}
                placeholder="Enter workflow name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-textPrimary mb-1">
                Department
              </label>
              <SearchableSelect
                value={formData.department}
                onChange={handleDepartmentChange}
                onSearch={searchDepartments}
                placeholder="Search for a department"
                className={errors.department ? 'border-red-500' : ''}
                initialOptions={initialDepartments?.map((dept: { _id: string, name: string }) => ({
                  value: dept._id,
                  label: dept.name
                })) || []}
              />
              {errors.department && <p className="mt-1 text-sm text-red-500">{errors.department}</p>}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-textPrimary mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border ${errors.status ? 'border-red-500' : 'border-buttonBorder'} rounded-md focus:outline-none focus:ring-1 focus:ring-buttonPrimary`}
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-500">{errors.status}</p>}
            </div>

            <div>
              <label htmlFor="timeSavedPerExecution" className="block text-sm font-medium text-textPrimary mb-1">
                Time Saved Per Execution (minutes)
              </label>
              <input
                type="number"
                id="timeSavedPerExecution"
                name="timeSavedPerExecution"
                value={formData.timeSavedPerExecution}
                onChange={handleChange}
                min="0"
                step="1"
                className={`w-full px-3 py-2 border ${errors.timeSavedPerExecution ? 'border-red-500' : 'border-buttonBorder'} rounded-md focus:outline-none focus:ring-1 focus:ring-buttonPrimary`}
                placeholder="Enter time saved in minutes"
              />
              {errors.timeSavedPerExecution && <p className="mt-1 text-sm text-red-500">{errors.timeSavedPerExecution}</p>}
            </div>

            <div>
              <label htmlFor="moneySavedPerExecution" className="block text-sm font-medium text-textPrimary mb-1">
                Money Saved Per Execution (USD)
              </label>
              <input
                type="number"
                id="moneySavedPerExecution"
                name="moneySavedPerExecution"
                value={formData.moneySavedPerExecution}
                onChange={handleChange}
                min="0"
                step="1"
                className={`w-full px-3 py-2 border ${errors.moneySavedPerExecution ? 'border-red-500' : 'border-buttonBorder'} rounded-md focus:outline-none focus:ring-1 focus:ring-buttonPrimary`}
                placeholder="Enter money saved in USD"
              />
              {errors.moneySavedPerExecution && <p className="mt-1 text-sm text-red-500">{errors.moneySavedPerExecution}</p>}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-buttonBorder rounded-md text-textPrimary hover:bg-darkerBackground transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-buttonPrimary text-textLight rounded-md hover:opacity-90 transition-opacity flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditMode ? 'Update Workflow' : 'Create Workflow'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddWorkflowModal;
