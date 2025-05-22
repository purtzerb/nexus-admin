import React from 'react';
import { Metadata } from 'next';
import PageHeader from '@/components/shared/PageHeader';
import ClientDetail from '@/components/admin/clients/ClientDetail';

export const metadata: Metadata = {
  title: 'Client Details | Nexus Admin',
  description: 'View and manage client details in the Nexus platform.'
};

// Using the standard Next.js App Router pattern for page components
export default function ClientDetailPage({
  params,
}: any) {
  return (
    <div className="h-fit bg-darkerBackground">
      <PageHeader pageTitle="Client Manager" />
      <div className="p-6 space-y-6">
        <ClientDetail clientId={params.id} />
      </div>
    </div>
  );
}
