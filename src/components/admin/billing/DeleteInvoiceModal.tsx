'use client';

import React from 'react';
import Modal from '@/components/ui/Modal';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';

interface Invoice {
  _id: string;
  clientId: string;
  clientSubscriptionId: string;
  invoiceDate: string;
  dueDate: string;
  paymentMethodInfo?: string;
  amountBilled: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';
  notes?: string;
  clientName?: string;
}

interface DeleteInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice: Invoice | null;
}

const DeleteInvoiceModal: React.FC<DeleteInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const queryClient = useQueryClient();

  if (!invoice) return null;

  const handleDelete = async () => {
    if (!invoice) return;

    setIsDeleting(true);

    // Show loading toast
    const loadingToastId = showToast(
      'Deleting invoice...',
      'loading'
    );

    try {
      const response = await fetch(`/api/admin/invoices/${invoice._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }

      // Dismiss loading toast and show success toast
      toast.dismiss(loadingToastId);
      showToast('Invoice deleted successfully', 'success');

      // Update React Query cache to remove the deleted invoice
      queryClient.setQueryData(['invoices'], (oldData: any) => {
        if (!oldData) return oldData;

        // If oldData is an array (direct invoices array)
        if (Array.isArray(oldData)) {
          return oldData.filter((inv: any) => inv._id !== invoice._id);
        }

        // If oldData is an object with an invoices property
        if (oldData && typeof oldData === 'object' && Array.isArray(oldData.invoices)) {
          return {
            ...oldData,
            invoices: oldData.invoices.filter((inv: any) => inv._id !== invoice._id)
          };
        }

        return oldData;
      });

      // Also invalidate the query to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['invoices'] });

      // Success - call the onSuccess callback
      onSuccess();
    } catch (error) {
      // Dismiss loading toast and show error toast
      toast.dismiss(loadingToastId);
      handleApiError(error, 'Failed to delete invoice');

      console.error('Error deleting invoice:', error);
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  if (!isOpen || !invoice) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Invoice" maxWidth="sm">
      <div className="space-y-4">
        <div className="bg-error bg-opacity-10 border border-error rounded-lg p-4 text-error">
          <div className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium">Warning: This action cannot be undone</h4>
              <p className="text-sm mt-1">
                This will mark the invoice as VOID in the system
              </p>
            </div>
          </div>
        </div>

        <p className="text-textPrimary">
          Are you sure you want to delete the invoice for <span className="font-semibold">{invoice.clientName}</span>?
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
            {isDeleting ? 'Deleting...' : 'Delete Invoice'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteInvoiceModal;
