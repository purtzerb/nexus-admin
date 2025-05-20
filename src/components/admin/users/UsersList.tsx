'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
// Import the AddUserModal component directly with a relative path
import AddUserModal from '@/components/admin/users/AddUserModal';

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';
  costRate?: number;
  billRate?: number;
  assignedClientIds?: string[];
}

const fetchAdminUsers = async (): Promise<User[]> => {
  const response = await fetch('/api/admin/users');
  if (!response.ok) {
    throw new Error('Failed to fetch admin users');
  }
  const data = await response.json();
  return data.users;
};

const fetchSolutionsEngineers = async (): Promise<User[]> => {
  const response = await fetch('/api/admin/solutions-engineers');
  if (!response.ok) {
    throw new Error('Failed to fetch solutions engineers');
  }
  const data = await response.json();
  return data.users;
};

const UsersList: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'ADMIN' | 'SE'>('ADMIN');

  const { data: adminUsers, isLoading: isLoadingAdmins, isError: isErrorAdmins, refetch: refetchAdmins } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: fetchAdminUsers,
    enabled: activeTab === 'ADMIN'
  });

  const { data: seUsers, isLoading: isLoadingSEs, isError: isErrorSEs, refetch: refetchSEs } = useQuery({
    queryKey: ['seUsers'],
    queryFn: fetchSolutionsEngineers,
    enabled: activeTab === 'SE'
  });

  const handleAddUserSuccess = () => {
    if (activeTab === 'ADMIN') {
      refetchAdmins();
    } else {
      refetchSEs();
    }
    setIsAddUserModalOpen(false);
  };

  // Get the appropriate users based on active tab
  const users = activeTab === 'ADMIN' ? adminUsers : seUsers;

  const isLoading = activeTab === 'ADMIN' ? isLoadingAdmins : isLoadingSEs;
  const isError = activeTab === 'ADMIN' ? isErrorAdmins : isErrorSEs;

  if (isLoading) {
    return <div className="text-center py-8">Loading {activeTab === 'ADMIN' ? 'admin' : 'solutions engineer'} users...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-error">Error loading users. Please try again.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === 'ADMIN'
                ? 'bg-buttonPrimary text-textLight'
                : 'bg-darkerBackground text-textPrimary'
            }`}
          >
            Admin Users
          </button>
          <button
            onClick={() => setActiveTab('SE')}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === 'SE'
                ? 'bg-buttonPrimary text-textLight'
                : 'bg-darkerBackground text-textPrimary'
            }`}
          >
            SE Users
          </button>
        </div>
        
        {/* Only show Add New User button for admins */}
        {isAdmin && (
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-buttonPrimary text-textLight px-4 py-2 rounded flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New User
          </button>
        )}
      </div>

      <div className="bg-cardBackground rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-darkerBackground">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Phone
              </th>
              {activeTab === 'SE' && (
                <>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Cost Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Bill Rate
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                    Assigned Clients
                  </th>
                </>
              )}
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-cardBackground divide-y divide-gray-200">
            {users && users.length > 0 ? (
              users.map((user: User) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        {user.name.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-textPrimary">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{user.phone || '-'}</div>
                  </td>
                  {activeTab === 'SE' && (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-textPrimary">${user.costRate}/hr</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-textPrimary">${user.billRate}/hr</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {user.assignedClientIds && user.assignedClientIds.length > 0 ? (
                            user.assignedClientIds.map((clientId: string, index: number) => (
                              <span key={clientId} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                Client {index + 1}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-textSecondary">No clients</span>
                          )}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-textPrimary hover:text-textSecondary mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button className="text-error hover:text-opacity-75">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={activeTab === 'SE' ? 7 : 4} className="px-6 py-4 text-center text-sm text-textSecondary">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddUserModalOpen && (
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onSuccess={handleAddUserSuccess}
        />
      )}
    </div>
  );
};

export default UsersList;
