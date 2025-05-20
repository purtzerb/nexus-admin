'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Client } from '@/types';
import toast from 'react-hot-toast';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const fetchClients = async (): Promise<Client[]> => {
  const response = await fetch('/api/clients');
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  const data = await response.json();
  return data.clients;
};

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [userType, setUserType] = useState<'ADMIN' | 'SE'>('ADMIN');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: userType === 'ADMIN' ? 'ADMIN' : 'SOLUTIONS_ENGINEER',
    costRate: '',
    billRate: '',
    assignedClientIds: [] as string[]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const { data: clients, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    enabled: userType === 'SE' && isOpen, // Only fetch clients when adding an SE
  });

  // Reset form when modal opens or userType changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        role: userType === 'ADMIN' ? 'ADMIN' : 'SOLUTIONS_ENGINEER',
        costRate: '',
        billRate: '',
        assignedClientIds: []
      });
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, userType]);

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

  const handleClientSelection = (clientId: string) => {
    setFormData(prev => {
      const assignedClientIds = [...prev.assignedClientIds];
      const index = assignedClientIds.indexOf(clientId);
      
      if (index === -1) {
        // Add client
        assignedClientIds.push(clientId);
      } else {
        // Remove client
        assignedClientIds.splice(index, 1);
      }
      
      return { ...prev, assignedClientIds };
    });
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
    
    // Show loading toast
    const loadingToastId = showToast(
      `Creating ${userType === 'ADMIN' ? 'admin' : 'solutions engineer'} user...`,
      'loading'
    );
    
    try {
      // Determine the API endpoint based on user type
      const endpoint = userType === 'ADMIN' ? '/api/admin/users' : '/api/admin/solutions-engineers';
      
      // Prepare the data to send
      const userData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      };
      
      // Only include password if it's provided
      if (formData.password) {
        userData.password = formData.password;
      }
      
      // Add SE-specific fields if creating an SE user
      if (userType === 'SE') {
        userData.costRate = Number(formData.costRate);
        userData.billRate = Number(formData.billRate);
        userData.assignedClientIds = formData.assignedClientIds;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }
      
      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToastId);
      showToast(
        `${userType === 'ADMIN' ? 'Admin' : 'Solutions engineer'} user created successfully!`,
        'success'
      );
      
      // Success - call the onSuccess callback
      onSuccess();
    } catch (error) {
      // Dismiss loading toast and show error toast
      toast.dismiss(loadingToastId);
      handleApiError(error, 'Failed to create user');
      
      console.error('Error creating user:', error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-cardBackground rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add New User</h2>
          
          {/* User Type Toggle */}
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
                  
                  <div>
                    <label className="block text-sm font-medium text-textPrimary mb-2">
                      Assigned Clients
                    </label>
                    {isLoadingClients ? (
                      <p className="text-sm text-textSecondary">Loading clients...</p>
                    ) : clients && clients.length > 0 ? (
                      <div className="max-h-40 overflow-y-auto border border-buttonBorder rounded p-2">
                        {clients.map((client: Client) => (
                          <div key={client._id} className="flex items-center mb-2 last:mb-0">
                            <input
                              type="checkbox"
                              id={`client-${client._id}`}
                              checked={formData.assignedClientIds.includes(client._id)}
                              onChange={() => handleClientSelection(client._id)}
                              className="mr-2"
                            />
                            <label htmlFor={`client-${client._id}`} className="text-sm text-textPrimary">
                              {client.name}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-textSecondary">No clients available</p>
                    )}
                  </div>
                </>
              )}
            </div>
            
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
                {isSubmitting ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
