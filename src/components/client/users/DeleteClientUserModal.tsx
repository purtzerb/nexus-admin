'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';

interface ClientUser {
  _id: string;
  name: string;
  email: string;
}

interface DeleteClientUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: ClientUser | null;
}

const DeleteClientUserModal: React.FC<DeleteClientUserModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  user 
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  const queryClient = useQueryClient();

  if (!user) {
    return null; // Don't render if there's no user to delete
  }

  const handleDelete = async () => {
    if (!user?._id) {
      setError('User ID is missing');
      return;
    }
    
    setIsDeleting(true);
    setError('');
    
    try {
      const response = await fetch(`/api/client/users/${user._id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }
      
      // Update React Query cache
      queryClient.invalidateQueries({ queryKey: ['clientUsers'] });
      
      showToast('User deleted successfully', 'success');
      onSuccess();
    } catch (error) {
      handleApiError(error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
      maxWidth="sm"
    >
      <div className="p-1">
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-error text-sm rounded-md">
            {error}
          </div>
        )}
        
        <p className="text-textPrimary mb-4">
          Are you sure you want to delete <span className="font-medium">{user.name}</span>?
        </p>
        <p className="text-textSecondary text-sm mb-6">
          This action cannot be undone. This user will no longer have access to your client dashboard.
        </p>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-buttonBorder rounded text-textPrimary hover:bg-gray-50"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 bg-error text-white rounded hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteClientUserModal;
