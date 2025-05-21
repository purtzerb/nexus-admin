'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/lib/toast/toastUtils';
import AddSubscriptionModal from '@/components/admin/subscriptions/AddSubscriptionModal';
import DeleteSubscriptionModal from '@/components/admin/subscriptions/DeleteSubscriptionModal';

interface Subscription {
  _id: string;
  name: string;
  pricingModel: 'Fixed' | 'Tiered' | 'Usage';
  contractLength: number; // in months
  billingCadence: 'Monthly' | 'Quarterly' | 'Annually';
  setupFee: number;
  prepaymentPercentage: number;
  cap: number;
  overageCost: number;
  clientCount: number;
}

const fetchSubscriptions = async (): Promise<Subscription[]> => {
  const response = await fetch('/api/admin/subscriptions');
  if (!response.ok) {
    throw new Error('Failed to fetch subscriptions');
  }
  const data = await response.json();
  return data.subscriptions;
};

const SubscriptionsList: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isAddSubscriptionModalOpen, setIsAddSubscriptionModalOpen] = useState(false);
  const [isDeleteSubscriptionModalOpen, setIsDeleteSubscriptionModalOpen] = useState(false);
  const [isEditSubscriptionModalOpen, setIsEditSubscriptionModalOpen] = useState(false);
  const [subscriptionToDelete, setSubscriptionToDelete] = useState<Subscription | null>(null);
  const [subscriptionToEdit, setSubscriptionToEdit] = useState<Subscription | null>(null);

  // Fetch subscriptions with React Query
  const { data: subscriptions, isLoading, isError, refetch } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: fetchSubscriptions,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const handleAddSubscriptionSuccess = () => {
    refetch();
    setIsAddSubscriptionModalOpen(false);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setSubscriptionToEdit(subscription);
    setIsEditSubscriptionModalOpen(true);
  };

  const handleEditSubscriptionSuccess = () => {
    refetch();
    setIsEditSubscriptionModalOpen(false);
    setSubscriptionToEdit(null);
  };

  const handleDeleteSubscription = (subscription: Subscription) => {
    setSubscriptionToDelete(subscription);
    setIsDeleteSubscriptionModalOpen(true);
  };

  const handleDeleteSubscriptionSuccess = () => {
    refetch();
    setIsDeleteSubscriptionModalOpen(false);
    setSubscriptionToDelete(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading subscription plans...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-error">Error loading subscription plans. Please try again.</div>;
  }

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4 mx-4">
        <div className="text-sm text-textSecondary">
          {subscriptions?.length || 0} subscription plans found
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddSubscriptionModalOpen(true)}
            className="bg-buttonPrimary text-textLight px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Plan
          </button>
        )}
      </div>

      <div className="bg-cardBackground shadow rounded-lg overflow-hidden mx-4">
        <table className="min-w-full divide-y divide-buttonBorder">
          <thead className="bg-darkerBackground">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                Pricing Model
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                Contract Length
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                Billing Cadence
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                Setup Fee
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                Prepayment %
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                $ Cap
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                Overage Cost
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                # Clients
              </th>
              <th scope="col" className="relative px-6 py-3 text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-buttonBorder">
            {subscriptions && subscriptions.length > 0 ? (
              subscriptions.map((subscription) => (
                <tr key={subscription._id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-textPrimary">{subscription.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{subscription.pricingModel}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{subscription.contractLength} months</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{subscription.billingCadence}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{formatCurrency(subscription.setupFee)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{subscription.prepaymentPercentage}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{formatCurrency(subscription.cap)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">${subscription.overageCost}/hr</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{subscription.clientCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditSubscription(subscription)}
                      className="text-textPrimary hover:text-textSecondary mr-3 transition-opacity duration-200"
                      aria-label="Edit subscription"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteSubscription(subscription)}
                      className="text-error hover:text-opacity-75 transition-opacity duration-200"
                      aria-label="Delete subscription"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-6 py-4 text-center text-sm text-textSecondary">
                  No subscription plans found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddSubscriptionModal
        isOpen={isAddSubscriptionModalOpen}
        onClose={() => setIsAddSubscriptionModalOpen(false)}
        onSuccess={handleAddSubscriptionSuccess}
        mode="create"
      />

      <AddSubscriptionModal
        isOpen={isEditSubscriptionModalOpen}
        onClose={() => {
          setIsEditSubscriptionModalOpen(false);
          setSubscriptionToEdit(null);
        }}
        onSuccess={handleEditSubscriptionSuccess}
        subscription={subscriptionToEdit}
        mode="update"
      />

      <DeleteSubscriptionModal
        isOpen={isDeleteSubscriptionModalOpen}
        onClose={() => {
          setIsDeleteSubscriptionModalOpen(false);
          setSubscriptionToDelete(null);
        }}
        onSuccess={handleDeleteSubscriptionSuccess}
        subscription={subscriptionToDelete}
      />
    </div>
  );
};

export default SubscriptionsList;
