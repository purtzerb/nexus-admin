'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';

interface ClientUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CLIENT_USER';
  clientId: string;
  isClientAdmin?: boolean;
  hasBillingAccess?: boolean;
  notifyByEmailForExceptions?: boolean;
  notifyBySmsForExceptions?: boolean;
  clientUserNotes?: string;
}

interface AddClientUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: ClientUser | null;
  mode?: 'create' | 'update';
}

const AddClientUserModal: React.FC<AddClientUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  user = null, 
  mode = 'create' 
}) => {
  const isEditMode = mode === 'update' && user !== null;
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    password?: string;
    phone: string;
    isClientAdmin: boolean;
    hasBillingAccess: boolean;
    notifyByEmailForExceptions: boolean;
    notifyBySmsForExceptions: boolean;
    clientUserNotes: string;
  }>({
    name: '',
    email: '',
    password: '',
    phone: '',
    isClientAdmin: false,
    hasBillingAccess: false,
    notifyByEmailForExceptions: false,
    notifyBySmsForExceptions: false,
    clientUserNotes: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Initialize form data when modal opens or user (for edit) changes
  useEffect(() => {
    if (isOpen) {
      if (isEditMode && user) {
        // In edit mode, populate form with user data
        setFormData({
          name: user.name || '',
          email: user.email || '',
          password: '', // Don't populate password for security reasons
          phone: user.phone || '',
          isClientAdmin: user.isClientAdmin || false,
          hasBillingAccess: user.hasBillingAccess || false,
          notifyByEmailForExceptions: user.notifyByEmailForExceptions || false,
          notifyBySmsForExceptions: user.notifyBySmsForExceptions || false,
          clientUserNotes: user.clientUserNotes || '',
        });
      } else {
        // In create mode, reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          phone: '',
          isClientAdmin: false,
          hasBillingAccess: false,
          notifyByEmailForExceptions: false,
          notifyBySmsForExceptions: false,
          clientUserNotes: '',
        });
      }
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen, user, isEditMode]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle checkboxes
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

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

    // Password is optional, but if provided must be at least 8 characters
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
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
    
    try {
      // Prepare the data for API request
      const userData = {
        ...formData,
        role: 'CLIENT_USER' as const,
      };
      
      // Remove password if it's empty in edit mode
      const finalUserData = { ...userData };
      if (isEditMode && !finalUserData.password) {
        delete finalUserData.password;
      }
      
      // Make the appropriate API call based on mode
      const url = isEditMode 
        ? `/api/client/users/${user?._id}` 
        : '/api/client/users';
        
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalUserData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred');
      }
      
      // Update React Query cache and show success toast
      queryClient.invalidateQueries({ queryKey: ['clientUsers'] });
      
      showToast(
        isEditMode ? 'User updated successfully' : 'User created successfully', 
        'success'
      );
      
      onSuccess();
    } catch (error) {
      handleApiError(error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit User' : 'Add New User'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} autoComplete="off">
        {submitError && (
          <div className="mb-4 p-3 bg-red-50 text-error text-sm rounded-md">
            {submitError}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-textPrimary mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.name ? 'border-error' : 'border-buttonBorder'}`}
              placeholder="Enter user's name"
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
              autoComplete="new-email" // Non-standard value to prevent auto-fill
            />
            {errors.email && <p className="mt-1 text-sm text-error">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-textPrimary mb-1">
              Password (Optional)
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-2 border rounded ${errors.password ? 'border-error' : 'border-buttonBorder'}`}
              placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
              autoComplete="new-password" // Prevents browser auto-fill
            />
            {errors.password && <p className="mt-1 text-sm text-error">{errors.password}</p>}
            <p className="mt-1 text-xs text-textSecondary">
              {isEditMode 
                ? "Only provide a new password if you want to change it." 
                : "Leave blank for users authenticating through Braintrust only. Password must be at least 8 characters if provided."}
            </p>
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

          <div className="mt-6">
            <h3 className="text-sm font-medium text-textPrimary mb-3">Permissions</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isClientAdmin"
                  name="isClientAdmin"
                  checked={formData.isClientAdmin}
                  onChange={handleChange}
                  className="h-4 w-4 text-buttonPrimary border-gray-300 rounded"
                />
                <label htmlFor="isClientAdmin" className="ml-2 block text-sm text-textPrimary">
                  Client Admin (can manage users and settings)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasBillingAccess"
                  name="hasBillingAccess"
                  checked={formData.hasBillingAccess}
                  onChange={handleChange}
                  className="h-4 w-4 text-buttonPrimary border-gray-300 rounded"
                />
                <label htmlFor="hasBillingAccess" className="ml-2 block text-sm text-textPrimary">
                  Billing Access (can view and manage billing)
                </label>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-medium text-textPrimary mb-3">Notifications</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyByEmailForExceptions"
                  name="notifyByEmailForExceptions"
                  checked={formData.notifyByEmailForExceptions}
                  onChange={handleChange}
                  className="h-4 w-4 text-buttonPrimary border-gray-300 rounded"
                />
                <label htmlFor="notifyByEmailForExceptions" className="ml-2 block text-sm text-textPrimary">
                  Email notifications for workflow exceptions
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyBySmsForExceptions"
                  name="notifyBySmsForExceptions"
                  checked={formData.notifyBySmsForExceptions}
                  onChange={handleChange}
                  className="h-4 w-4 text-buttonPrimary border-gray-300 rounded"
                />
                <label htmlFor="notifyBySmsForExceptions" className="ml-2 block text-sm text-textPrimary">
                  SMS notifications for workflow exceptions
                </label>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="clientUserNotes" className="block text-sm font-medium text-textPrimary mb-1">
              Notes
            </label>
            <textarea
              id="clientUserNotes"
              name="clientUserNotes"
              value={formData.clientUserNotes}
              onChange={handleChange}
              rows={3}
              className="w-full p-2 border border-buttonBorder rounded"
              placeholder="Additional notes about this user"
            />
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-buttonBorder rounded text-textPrimary hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-buttonPrimary text-textLight rounded hover:bg-primaryDarker"
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

export default AddClientUserModal;
