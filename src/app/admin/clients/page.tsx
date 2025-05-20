import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import ClientsList from '@/components/admin/clients/ClientsList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Manager | Nexus Admin',
  description: 'Manage client accounts in the Nexus platform.'
};

export default function ClientsPage() {
  return (
    <div className="h-full bg-darkerBackground">
      <PageHeader pageTitle="Client Manager" />
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Manage Clients</h2>
        <ClientsList />
      </div>
    </div>
  );
}
