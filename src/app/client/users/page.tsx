import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import ClientUsersList from '@/components/client/users/ClientUsersList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Manager | Nexus Client',
  description: 'Manage users within your organization in the Nexus platform.'
};

export default function ClientUsersPage() {
  return (
    <div className="h-full bg-background">
      <PageHeader pageTitle="User Manager" />
      <div className="p-6 space-y-6">
        <div className="bg-cardBackground p-6 rounded-lg shadow">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-textPrimary">Organization Users</h2>
            <p className="text-textSecondary mt-1">
              Manage users within your organization. Assign permissions and notification preferences.
            </p>
          </div>
          
          <ClientUsersList />
        </div>
      </div>
    </div>
  );
}
