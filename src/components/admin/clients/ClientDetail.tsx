'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import AssignedSupportEngineers from '@/components/admin/clients/detail/AssignedSupportEngineers';
import ClientUsers from '@/components/admin/clients/detail/ClientUsers';
import DocumentLinks from '@/components/admin/clients/detail/DocumentLinks';
import PipelineProgress from '@/components/admin/clients/detail/PipelineProgress';

interface ClientDetailProps {
  clientId: string;
}

const ClientDetail: React.FC<ClientDetailProps> = ({ clientId }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'workflows'>('overview');
  
  // Fetch client data
  const { data: client, isLoading, isError } = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }
      const data = await response.json();
      return data.client;
    }
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading client details...</div>;
  }

  if (isError || !client) {
    return (
      <div className="text-center py-8 text-error">
        <p className="mb-4">Error loading client details. The client may not exist or you may not have permission to view it.</p>
        <button 
          onClick={() => router.push('/admin/clients')}
          className="px-4 py-2 bg-buttonPrimary text-textLight rounded hover:opacity-90 transition-opacity"
        >
          Return to Clients List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Client Header with Back Button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-textPrimary">{client.companyName}</h1>
          <p className="text-textSecondary">{client.companyUrl}</p>
        </div>
        <button 
          onClick={() => router.push('/admin/clients')}
          className="px-4 py-2 border border-buttonBorder rounded hover:bg-background transition-colors"
        >
          Back to Clients
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-buttonBorder">
        <div className="flex space-x-6">
          <button
            className={`py-3 px-1 font-medium text-sm ${
              activeTab === 'overview'
                ? 'text-textPrimary border-b-2 border-buttonPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-3 px-1 font-medium text-sm ${
              activeTab === 'workflows'
                ? 'text-textPrimary border-b-2 border-buttonPrimary'
                : 'text-textSecondary hover:text-textPrimary'
            }`}
            onClick={() => setActiveTab('workflows')}
          >
            Client Workflows
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <>
          {/* Assigned Support Engineers Section */}
          <AssignedSupportEngineers clientId={clientId} />

          {/* Two Column Layout for Users and Documents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClientUsers clientId={clientId} />
            <DocumentLinks clientId={clientId} />
          </div>

          {/* Pipeline Progress Section */}
          <PipelineProgress clientId={clientId} />
        </>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Client Workflows</h3>
          <p className="text-textSecondary">Client workflow management coming soon.</p>
        </div>
      )}
    </div>
  );
};

export default ClientDetail;
