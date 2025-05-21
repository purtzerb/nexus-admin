'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';

interface ClientUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isPrimaryContact?: boolean;
  hasBillingAccess?: boolean;
  isClientAdmin?: boolean;
  role?: string;
}

interface ClientUsersProps {
  clientId: string;
}

const ClientUsers: React.FC<ClientUsersProps> = ({ clientId }) => {
  // Fetch client users
  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['client-users', clientId],
    queryFn: async () => {
      // Fetch users directly from the users API with a filter for this client
      const response = await fetch(`/api/admin/users?clientId=${clientId}&role=CLIENT_USER`);
      if (!response.ok) {
        throw new Error('Failed to fetch client users');
      }
      const data = await response.json();
      
      // Map the user data to the format expected by this component
      return (data.users || []).map((user: any) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPrimaryContact: user.isPrimaryContact,
        hasBillingAccess: user.hasBillingAccess,
        isClientAdmin: user.isClientAdmin,
        role: user.role
      }));
    },
    // Refetch when the component mounts or when the client ID changes
    refetchOnMount: true
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Client Users</h3>
        <div className="text-textSecondary">Loading users...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Client Users</h3>
        <div className="text-error">Error loading users</div>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Client Users</h3>
        <div className="text-textSecondary">No users found for this client</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="p-4 border-b border-buttonBorder">
        <h3 className="text-lg font-medium">Client Users</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-buttonBorder">
          <thead className="bg-darkerBackground">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Billing
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Admin
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-buttonBorder">
            {users.map((user: ClientUser) => (
              <tr key={user._id}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm font-medium text-textPrimary">{user.name}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-textPrimary">{user.email}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-textPrimary">{user.phone || '-'}</div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {user.hasBillingAccess ? (
                    <svg className="h-5 w-5 text-success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-textSecondary">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {user.isClientAdmin ? (
                    <svg className="h-5 w-5 text-success" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span className="text-textSecondary">-</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="text-sm text-textPrimary">
                    {user.isPrimaryContact ? 'Primary contact' : user.role === 'technical_lead' ? 'Technical lead' : '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientUsers;
