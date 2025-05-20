'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: {
    _id: string;
    name: string;
    role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';
  } | null;
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const queryClient = useQueryClient();

  if (!user) return null;

  const handleDelete = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    
    // Show loading toast
    const loadingToastId = showToast(
      `Deleting ${user.role === 'ADMIN' ? 'admin' : 'solutions engineer'} user...`,
      'loading'
    );
    
    try {
      // Determine the API endpoint based on user role
      const endpoint = user.role === 'ADMIN' 
        ? `/api/admin/users/${user._id}` 
        : `/api/admin/solutions-engineers/${user._id}`;
      
      const response = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
      
      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToastId);
      showToast(
        `${user.role === 'ADMIN' ? 'Admin' : 'Solutions engineer'} user deleted successfully!`,
        'success'
      );
      
      // Update React Query cache to remove the deleted user
      if (user.role === 'ADMIN') {
        queryClient.setQueryData(['adminUsers'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((adminUser: any) => adminUser._id !== user._id);
        });
      } else if (user.role === 'SOLUTIONS_ENGINEER') {
        queryClient.setQueryData(['seUsers'], (oldData: any) => {
          if (!oldData) return oldData;
          return oldData.filter((seUser: any) => seUser._id !== user._id);
        });
      }
      
      // Success - call the onSuccess callback
      onSuccess();
    } catch (error) {
      // Dismiss loading toast and show error toast
      toast.dismiss(loadingToastId);
      handleApiError(error, 'Failed to delete user');
      
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete User" maxWidth="sm">
      <div className="space-y-4">
        <div className="bg-error bg-opacity-10 border border-error rounded-lg p-4 text-error">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium">Warning: This action cannot be undone</h4>
              <p className="text-sm mt-1">
                This will permanently delete the user and remove all associated data.
              </p>
            </div>
          </div>
        </div>

        <p className="text-textPrimary">
          Are you sure you want to delete <span className="font-semibold">{user.name}</span>?
        </p>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-buttonBorder rounded text-textPrimary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-error text-white rounded"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteUserModal;
