'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import AddClientUserModal from '@/components/client/users/AddClientUserModal';
import DeleteClientUserModal from '@/components/client/users/DeleteClientUserModal';

interface ClientUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'CLIENT_USER';
  clientId: string;
  isClientAdmin?: boolean;
  hasBillingAccess?: boolean;
  notifyByEmailForExceptions?: boolean;
  notifyBySmsForExceptions?: boolean;
  clientUserNotes?: string;
  createdAt: string;
  updatedAt: string;
}

const fetchClientUsers = async (): Promise<ClientUser[]> => {
  const response = await fetch('/api/client/users');
  if (!response.ok) {
    throw new Error('Failed to fetch client users');
  }
  const data = await response.json();
  return data.users;
};

const ClientUsersList: React.FC = () => {
  const { user } = useAuth();
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isDeleteUserModalOpen, setIsDeleteUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<ClientUser | null>(null);
  const [userToEdit, setUserToEdit] = useState<ClientUser | null>(null);

  const { 
    data: users, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['clientUsers'],
    queryFn: fetchClientUsers
  });

  const handleAddUserSuccess = () => {
    refetch();
    setIsAddUserModalOpen(false);
  };
  
  const handleEditUser = (user: ClientUser) => {
    setUserToEdit(user);
    setIsEditUserModalOpen(true);
  };
  
  const handleEditUserSuccess = () => {
    refetch();
    setIsEditUserModalOpen(false);
    setUserToEdit(null);
  };
  
  const handleDeleteUser = (user: ClientUser) => {
    setUserToDelete(user);
    setIsDeleteUserModalOpen(true);
  };
  
  const handleDeleteUserSuccess = () => {
    refetch();
    setIsDeleteUserModalOpen(false);
    setUserToDelete(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading users...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-error">Error loading users. Please try again.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-textPrimary">Users in your organization</h3>
        <button
          onClick={() => setIsAddUserModalOpen(true)}
          className="px-4 py-2 bg-buttonPrimary text-textLight rounded-md text-sm font-medium hover:bg-primaryDarker transition-colors"
        >
          Add New User
        </button>
      </div>

      <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permissions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notifications
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {user.isClientAdmin && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Admin
                        </span>
                      )}
                      {user.hasBillingAccess && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Billing
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      {user.notifyByEmailForExceptions && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Email
                        </span>
                      )}
                      {user.notifyBySmsForExceptions && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          SMS
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="text-textPrimary hover:text-textSecondary mr-3 transition-opacity duration-200"
                      aria-label="Edit user"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteUser(user)}
                      className="text-error hover:text-opacity-75 transition-opacity duration-200"
                      aria-label="Delete user"
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
                <td colSpan={6} className="px-6 py-4 text-center text-sm text-textSecondary">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddClientUserModal
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        onSuccess={handleAddUserSuccess}
        mode="create"
      />
      
      <AddClientUserModal
        isOpen={isEditUserModalOpen}
        onClose={() => {
          setIsEditUserModalOpen(false);
          setUserToEdit(null);
        }}
        onSuccess={handleEditUserSuccess}
        user={userToEdit}
        mode="update"
      />
      
      <DeleteClientUserModal
        isOpen={isDeleteUserModalOpen}
        onClose={() => {
          setIsDeleteUserModalOpen(false);
          setUserToDelete(null);
        }}
        onSuccess={handleDeleteUserSuccess}
        user={userToDelete}
      />
    </div>
  );
};

export default ClientUsersList;
