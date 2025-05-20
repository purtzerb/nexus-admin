import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import UsersList from '@/components/admin/users/UsersList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Manager | Nexus Admin',
  description: 'Manage admin and solutions engineer users in the Nexus platform.'
};

export default function UsersPage() {
  return (
    <div className="h-full bg-darkerBackground">
      <PageHeader pageTitle="User Manager" />
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <UsersList />
      </div>
    </div>
  );
}
