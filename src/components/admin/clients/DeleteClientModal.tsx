'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Client {
  _id: string;
  companyName: string;
}

interface DeleteClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client: Client | null;
}

const DeleteClientModal: React.FC<DeleteClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  client
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const queryClient = useQueryClient();
  
  if (!client) return null;

  const handleDelete = async () => {
    if (!client) return;
    
    setIsDeleting(true);
    
    // Show loading toast
    const loadingToastId = showToast(
      'Deleting client...',
      'loading'
    );
    
    try {
      const response = await fetch(`/api/admin/clients/${client._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete client');
      }
      
      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToastId);
      showToast('Client deleted successfully', 'success');
      
      // Update React Query cache to remove the deleted client
      queryClient.setQueryData(['clients'], (oldData: any) => {
        if (!oldData) return oldData;
        
        // If oldData is an array (direct clients array)
        if (Array.isArray(oldData)) {
          return oldData.filter((c: any) => c._id !== client._id);
        }
        
        // If oldData is an object with a clients property (wrapped in an object)
        if (oldData && typeof oldData === 'object' && Array.isArray(oldData.clients)) {
          return {
            ...oldData,
            clients: oldData.clients.filter((c: any) => c._id !== client._id)
          };
        }
        
        return oldData;
      });
      
      // Also invalidate the queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      
      // Success - call the onSuccess callback
      onSuccess();
    } catch (error) {
      // Dismiss loading toast and show error toast
      toast.dismiss(loadingToastId);
      handleApiError(error, 'Failed to delete client');
      
      console.error('Error deleting client:', error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Client" maxWidth="sm">
      <div className="space-y-4">
        <div className="bg-error bg-opacity-10 border border-error rounded-lg p-4 text-error">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium">Warning: This action cannot be undone</h4>
              <p className="text-sm mt-1">
                This will permanently delete the client and all associated data.
              </p>
            </div>
          </div>
        </div>

        <p className="text-textPrimary">
          Are you sure you want to delete <span className="font-semibold">{client.companyName}</span>?
        </p>
        
        <div className="bg-darkerBackground p-3 rounded-md">
          <h4 className="font-medium text-sm mb-2">This will:</h4>
          <ul className="list-disc pl-5 text-sm text-textSecondary space-y-1">
            <li>Delete all client users associated with this client</li>
            <li>Remove this client from all solution engineers' assignments</li>
            <li>Delete all client data permanently</li>
          </ul>
        </div>

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
            {isDeleting ? 'Deleting...' : 'Delete Client'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteClientModal;
