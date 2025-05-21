'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';

interface Workflow {
  _id: string;
  name: string;
}

interface DeleteWorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workflow: Workflow | null;
  clientId: string;
}

const DeleteWorkflowModal: React.FC<DeleteWorkflowModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  workflow,
  clientId
}) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!workflow || !workflow._id) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/clients/${clientId}/workflows?workflowId=${workflow._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete workflow');
      }

      // Get the response data
      const data = await response.json();
      console.log('Workflow deleted successfully:', data);

      // Directly update the React Query cache to remove the deleted workflow
      queryClient.setQueryData(['client-workflows', clientId], (oldData: any) => {
        if (!oldData) {
          return oldData;
        }

        // If oldData is an array (direct workflows array)
        if (Array.isArray(oldData)) {
          return oldData.filter((w: any) => w._id !== workflow._id);
        }

        // If oldData is an object with a workflows property (wrapped in an object)
        if (oldData && typeof oldData === 'object' && Array.isArray(oldData.workflows)) {
          return {
            ...oldData,
            workflows: oldData.workflows.filter((w: any) => w._id !== workflow._id)
          };
        }

        return oldData;
      });

      // Also invalidate the queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['client-workflows', clientId] });

      showToast('Workflow deleted successfully', 'success');
      onSuccess();
    } catch (err) {
      console.error('Error deleting workflow:', err);
      handleApiError(err, 'Failed to delete workflow');
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !workflow) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-cardBackground rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 py-4 bg-darkerBackground border-b border-buttonBorder">
          <h3 className="text-lg font-semibold text-textPrimary">Delete Workflow</h3>
        </div>

        <div className="px-6 py-4">
          <p className="text-textPrimary mb-4">
            Are you sure you want to delete the workflow <span className="font-semibold">{workflow.name}</span>?
          </p>
          <div className="bg-darkerBackground p-3 rounded-md mb-4">
            <h4 className="font-medium text-sm mb-2">This will:</h4>
            <ul className="list-disc pl-5 text-sm text-textSecondary space-y-1">
              <li>Delete all workflow data permanently</li>
              <li>Remove all associated execution metrics</li>
              <li>Remove all time and money saved metrics</li>
            </ul>
          </div>
          <p className="text-error text-sm mb-6 font-medium">
            This action cannot be undone. All data associated with this workflow will be permanently removed.
          </p>

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
              disabled={isDeleting}
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
                'Delete Workflow'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteWorkflowModal;
