'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/lib/toast/toastUtils';
import AssignSubscriptionModal from '../subscriptions/AssignSubscriptionModal';
import Modal from '@/components/ui/Modal';

interface ClientSubscription {
  _id: string;
  clientId: string;
  subscriptionPlanId: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING_RENEWAL';
  clientName?: string;
  planName?: string;
}

interface Client {
  _id: string;
  companyName: string;
}

interface ClientPlanListProps {
  clientSubscriptions: ClientSubscription[];
  onAssignPlan: (client: Client) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const ClientPlanList: React.FC<ClientPlanListProps> = ({
  clientSubscriptions,
  onAssignPlan,
  onRefresh,
  isLoading
}) => {
  const { isAdmin } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<ClientSubscription | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEditSubscription = (subscription: ClientSubscription) => {
    // Create a client object from the subscription data
    const client: Client = {
      _id: subscription.clientId,
      companyName: subscription.clientName || ''
    };

    setSelectedClient(client);
    setSelectedSubscription(subscription);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    onRefresh();
    setIsEditModalOpen(false);
    setSelectedSubscription(null);
  };

  const handleDeleteSubscription = (subscription: ClientSubscription) => {
    setSelectedSubscription(subscription);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedSubscription) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/admin/client-subscriptions/${selectedSubscription._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete subscription');
      }

      showToast('Subscription deleted successfully', 'success');
      onRefresh();
      setIsDeleteModalOpen(false);
      setSelectedSubscription(null);
    } catch (error) {
      console.error('Error deleting subscription:', error);
      showToast(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800';
      case 'PENDING_RENEWAL':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Client
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Plan
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              End Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>

            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clientSubscriptions.length > 0 || isLoading ? (
            clientSubscriptions.map((subscription) => (
              <tr key={subscription._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{subscription.clientName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{subscription.planName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(subscription.startDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{formatDate(subscription.endDate)}</div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(subscription.status)}`}>
                    {subscription.status}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {isAdmin && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleEditSubscription(subscription)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3 transition-opacity duration-200"
                        aria-label="Edit subscription"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteSubscription(subscription)}
                        className="text-red-600 hover:text-red-900 transition-opacity duration-200"
                        aria-label="Delete subscription"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                No client subscription plans found. Click "Assign Plan to Client" to add one.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {selectedSubscription && selectedClient && (
        <AssignSubscriptionModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSuccess}
          client={selectedClient}
          existingSubscription={selectedSubscription}
          selectableClients={false}
        />
      )}

      {/* Delete Confirmation Modal */}
      {selectedSubscription && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Subscription"
          maxWidth="md"
        >
          <div className="p-1">
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete the subscription for <span className="font-bold">{selectedSubscription.clientName}</span>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors duration-200"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClientPlanList;
