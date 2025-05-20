import React from 'react';
import Header from '@/components/admin/Header';

export default function UsersPage() {
  return (
    <div className="h-full bg-darkerBackground">
      <Header pageTitle="User Manager" />
      <div className="p-6 space-y-4">
        <h2 className="text-xl font-semibold">Manage Users</h2>

        {/* Placeholder for user management content */}
        <div className="bg-cardBackground rounded-lg p-6 shadow-sm">
          <p className="text-textSecondary">User management interface will be implemented here.</p>
        </div>
      </div>
    </div>
  );
}
