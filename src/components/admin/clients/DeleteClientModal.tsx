'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
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
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!client || !client._id) return;
    
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/clients/${client._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete client');
      }

      // Update cache
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-cardBackground rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 bg-darkerBackground border-b border-buttonBorder">
          <h3 className="text-lg font-semibold text-textPrimary">Delete Client</h3>
        </div>
        
        <div className="px-6 py-4">
          <p className="text-textPrimary mb-4">
            Are you sure you want to delete the client <span className="font-semibold">{client.companyName}</span>?
          </p>
          <p className="text-textSecondary text-sm mb-6">
            This action cannot be undone. All data associated with this client will be permanently removed.
          </p>
          
          {error && (
            <div className="text-error text-sm mb-4">{error}</div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-buttonBorder rounded-md text-textPrimary hover:bg-darkerBackground transition-colors duration-200"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-error text-white rounded-md hover:bg-opacity-90 transition-opacity duration-200 flex items-center"
              disabled={isDeleting || !isAdmin}
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Deleting...
                </>
              ) : (
                'Delete Client'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteClientModal;
