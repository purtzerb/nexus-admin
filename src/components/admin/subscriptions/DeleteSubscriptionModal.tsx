'use client';

import React, { useState } from 'react';
import { showToast } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';
import { Subscription } from '@/types/subscription';

// Using the shared Subscription interface from @/types/subscription

interface DeleteSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription: Subscription | null;
}

const DeleteSubscriptionModal: React.FC<DeleteSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subscription
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!subscription) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/subscriptions/${subscription._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete subscription plan');
      }

      showToast('Subscription plan deleted successfully!', 'success');
      onSuccess();
    } catch (error) {
      console.error('Error deleting subscription plan:', error);
      showToast(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Subscription Plan"
      maxWidth="2xl"
    >
      <div className="space-y-4">
        <p className="text-sm text-textSecondary">
          Are you sure you want to delete the subscription plan <span className="font-medium">{subscription?.name}</span>?
          {subscription?.clientCount && subscription.clientCount > 0 && (
            <span className="block mt-2 text-error">
              Warning: This plan is currently assigned to {subscription.clientCount} client{subscription.clientCount !== 1 ? 's' : ''}.
            </span>
          )}
        </p>

        <div className="flex justify-end space-x-3 pt-4 border-t border-buttonBorder">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-buttonBorder rounded hover:bg-darkerBackground transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 bg-error text-white rounded hover:bg-opacity-90 transition-colors duration-200"
          >
            {isDeleting ? 'Deleting...' : 'Delete Plan'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteSubscriptionModal;
