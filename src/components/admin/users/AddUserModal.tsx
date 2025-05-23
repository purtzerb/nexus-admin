'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Client } from '@/types';
import toast from 'react-hot-toast';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';
  costRate?: number;
  billRate?: number;
}

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: User | null; // If provided, we're in edit mode
  mode?: 'create' | 'update';
}

const fetchClients = async (): Promise<Client[]> => {
  const response = await fetch('/api/clients');
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  const data = await response.json();
  return data.clients;
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess, user = null, mode = 'create' }) => {
  const isEditMode = mode === 'update' && user !== null;
  const initialUserType = user?.role === 'ADMIN' ? 'ADMIN' : 'SE';
  const [userType, setUserType] = useState<'ADMIN' | 'SE'>(initialUserType || 'ADMIN');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: userType === 'ADMIN' ? 'ADMIN' : 'SOLUTIONS_ENGINEER',
    costRate: '',
    billRate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const queryClient = useQueryClient();

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    enabled: userType === 'SE' && isOpen, // Only fetch clients when adding an SE
  });

  // Initialize form data when modal opens, userType changes, or user (for edit) changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && user) {
        // In edit mode, populate form with user data
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '', // Don't populate password for security reasons
          phone: user.phone || '',
          role: user.role,
          costRate: user.costRate?.toString() || '',
          billRate: user.billRate?.toString() || '',
        });
        // Set user type based on role
        setUserType(user.role === 'ADMIN' ? 'ADMIN' : 'SE');
      } else {
        // In create mode, reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          role: userType === 'ADMIN' ? 'ADMIN' : 'SOLUTIONS_ENGINEER',
          costRate: '',
          billRate: '',
        });
      }
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, userType, user, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    // Password is optional, but if provided, must be at least 8 characters
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (userType === 'SE') {
      if (!formData.costRate) {
        newErrors.costRate = 'Cost rate is required';
      } else if (isNaN(Number(formData.costRate)) || Number(formData.costRate) <= 0) {
        newErrors.costRate = 'Cost rate must be a positive number';
      }

      if (!formData.billRate) {
        newErrors.billRate = 'Bill rate is required';
      } else if (isNaN(Number(formData.billRate)) || Number(formData.billRate) <= 0) {
        newErrors.billRate = 'Bill rate must be a positive number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    const isUpdate = isEditMode && user;
    const action = isUpdate ? 'Updating' : 'Creating';

    // Show loading toast
    const loadingToastId = showToast(
      `${action} ${userType === 'ADMIN' ? 'admin' : 'solutions engineer'} user...`,
      'loading'
    );

    try {
      // Determine the API endpoint based on user type and action
      let endpoint = userType === 'ADMIN' ? '/api/admin/users' : '/api/admin/solutions-engineers';
      if (isUpdate && user) {
        endpoint = `${endpoint}/${user._id}`;
      }

      // Prepare the data to send
      const userData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };

      // Only include password if it's provided (for both create and update)
      if (formData.password) {
        userData.password = formData.password;
      }

      // Add SE-specific fields if creating/updating an SE user
      if (userType === 'SE') {
        userData.costRate = Number(formData.costRate);
        userData.billRate = Number(formData.billRate);
      }

      const response = await fetch(endpoint, {
        method: isUpdate ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isUpdate ? 'update' : 'create'} user`);
      }

      const responseData = await response.json();

      // Update React Query cache for instant UI update
      if (isUpdate && user) {
        // For update, update the specific user in the cache
        const queryKey = userType === 'ADMIN' ? 'adminUsers' : 'seUsers';
        queryClient.setQueryData([queryKey], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.map((oldUser: any) =>
            oldUser._id === user._id ? { ...oldUser, ...responseData.user } : oldUser
          );
        });
      }

      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToastId);
      showToast(
        `${userType === 'ADMIN' ? 'Admin' : 'Solutions engineer'} user ${isUpdate ? 'updated' : 'created'} successfully!`,
        'success'
      );

      // Success - call the onSuccess callback
      onSuccess();
    } catch (error) {
      // Dismiss loading toast and show error toast
      toast.dismiss(loadingToastId);
      handleApiError(error, `Failed to ${isUpdate ? 'update' : 'create'} user`);

      console.error(`Error ${isUpdate ? 'updating' : 'creating'} user:`, error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit User' : 'Add New User'} maxWidth="md">
      {/* User Type Toggle - Only show in create mode */}
      {!isEditMode && (
        <div className="flex mb-6 border border-buttonBorder rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setUserType('ADMIN')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${userType === 'ADMIN' ? 'bg-buttonPrimary text-white' : 'bg-white text-textPrimary'}`}
          >
            Admin
          </button>
          <button
            type="button"
            onClick={() => setUserType('SE')}
            className={`flex-1 py-2 px-4 text-sm font-medium ${userType === 'SE' ? 'bg-buttonPrimary text-white' : 'bg-white text-textPrimary'}`}
          >
            Solutions Engineer
          </button>
        </div>
      )}

      {submitError && (
        <div className="mb-4 p-3 bg-error bg-opacity-10 border border-error rounded text-error text-sm">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.name ? 'border-error' : 'border-buttonBorder'}`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="mt-1 text-sm text-error">{errors.name}</p>}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-textPrimary mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.email ? 'border-error' : 'border-buttonBorder'}`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-1">
              Password <span className="text-textSecondary">(Optional)</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.password ? 'border-error' : 'border-buttonBorder'}`}
              placeholder="Enter password"
            />
            {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
            <p className="mt-1 text-xs text-textSecondary">Password allows authentication outside of the Braintrust ecosystem.</p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-textPrimary mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-buttonBorder rounded"
              placeholder="Enter phone number"
            />
          </div>

          {userType === 'SE' && (
            <>
              <div>
                <label htmlFor="costRate" className="block text-sm font-medium text-textPrimary mb-1">
                  Cost Rate ($/hr) *
                </label>
                <input
                  type="number"
                  id="costRate"
                  name="costRate"
                  value={formData.costRate}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.costRate ? 'border-error' : 'border-buttonBorder'}`}
                  placeholder="Enter cost rate"
                  min="0"
                  step="0.01"
                />
                {errors.costRate && <p className="mt-1 text-sm text-error">{errors.costRate}</p>}
              </div>

              <div>
                <label htmlFor="billRate" className="block text-sm font-medium text-textPrimary mb-1">
                  Bill Rate ($/hr) *
                </label>
                <input
                  type="number"
                  id="billRate"
                  name="billRate"
                  value={formData.billRate}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded ${errors.billRate ? 'border-error' : 'border-buttonBorder'}`}
                  placeholder="Enter bill rate"
                  min="0"
                  step="0.01"
                />
                {errors.billRate && <p className="mt-1 text-sm text-error">{errors.billRate}</p>}
              </div>
            </>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-buttonBorder rounded text-textPrimary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-buttonPrimary text-textLight rounded"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (isEditMode ? 'Updating...' : 'Creating...')
                : (isEditMode ? 'Update User' : 'Create User')}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddUserModal;
