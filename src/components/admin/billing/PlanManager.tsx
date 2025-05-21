'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/lib/toast/toastUtils';
import ClientPlanList from './ClientPlanList';
import AssignSubscriptionModal from '../subscriptions/AssignSubscriptionModal';

// Define types based on the models
interface ClientSubscription {
  _id: string;
  clientId: string;
  subscriptionPlanId: string;
  startDate: string;
  endDate?: string;
  baseFeeOverride?: number;
  creditsRemainingThisPeriod?: number;
  renewsOn?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING_RENEWAL';
  clientName?: string; // Populated from client data
  planName?: string; // Populated from subscription plan data
}

interface Client {
  _id: string;
  companyName: string;
}

// Fetch client subscriptions
const fetchClientSubscriptions = async (): Promise<ClientSubscription[]> => {
  const response = await fetch('/api/admin/client-subscriptions');
  if (!response.ok) {
    throw new Error('Failed to fetch client subscriptions');
  }
  const data = await response.json();
  return data.subscriptions || []; // Return subscriptions array or empty array if undefined
};

// Fetch clients for dropdown
const fetchClients = async (): Promise<Client[]> => {
  const response = await fetch('/api/admin/clients');
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  const data = await response.json();
  // Map the client data to match the expected format with companyName
  return data.clients.map((client: any) => ({
    _id: client._id,
    companyName: client.companyName || client.name // Support both property names
  }));
};

const PlanManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isAssignPlanModalOpen, setIsAssignPlanModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fetch client subscriptions with React Query
  const {
    data: clientSubscriptions,
    isLoading: isLoadingSubscriptions,
    isError: isErrorSubscriptions,
    refetch: refetchSubscriptions
  } = useQuery({
    queryKey: ['clientSubscriptions'],
    queryFn: fetchClientSubscriptions,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Fetch clients for dropdown
  const {
    data: clients,
    isLoading: isLoadingClients
  } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    refetchOnMount: true
  });

  const handleAssignPlanSuccess = () => {
    refetchSubscriptions();
    setIsAssignPlanModalOpen(false);
    setSelectedClient(null);
  };

  const handleOpenAssignPlanModal = (client: Client | null = null) => {
    // Ensure client has the right property format
    setSelectedClient(client ? {
      _id: client._id,
      companyName: client.companyName || (client as any).name
    } : null);
    setIsAssignPlanModalOpen(true);
  };

  if (isLoadingSubscriptions || isLoadingClients) {
    return <div className="text-center py-8">Loading client subscription data...</div>;
  }

  if (isErrorSubscriptions) {
    return <div className="text-center py-8 text-error">Error loading client subscriptions. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Subscription Plans</h2>
        {isAdmin && (
          <button
            onClick={() => handleOpenAssignPlanModal()}
            className="bg-buttonPrimary text-textLight px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Assign Plan to Client
          </button>
        )}
      </div>

      <ClientPlanList
        clientSubscriptions={clientSubscriptions || []}
        onAssignPlan={handleOpenAssignPlanModal}
        onRefresh={refetchSubscriptions}
      />

      <AssignSubscriptionModal
        isOpen={isAssignPlanModalOpen}
        onClose={() => setIsAssignPlanModalOpen(false)}
        onSave={handleAssignPlanSuccess}
        client={selectedClient || undefined}
        existingSubscription={null}
        selectableClients={!selectedClient}
      />
    </div>
  );
};

export default PlanManager;
