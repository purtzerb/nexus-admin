'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
// These imports should work once the files are properly created
import AddClientModal from './AddClientModal';
import DeleteClientModal from './DeleteClientModal';

interface Client {
  _id: string;
  companyName: string;
  companyUrl?: string;
  email?: string;
  phone?: string;
  industry?: string;
  contactName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  assignedSolutionsEngineerIds?: string[];
  departments?: { name: string; _id?: string }[];
  users?: {
    name: string;
    email: string;
    phone?: string;
    department?: string;
    exceptions?: { email?: boolean; sms?: boolean };
    access?: { billing?: boolean; admin?: boolean };
  }[];
}

const fetchClients = async (): Promise<Client[]> => {
  const response = await fetch('/api/admin/clients');
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  const data = await response.json();
  return data.clients;
};

const ClientsList: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [isDeleteClientModalOpen, setIsDeleteClientModalOpen] = useState(false);
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const { data: clients, isLoading, isError, refetch } = useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients
  });

  const handleAddClientSuccess = () => {
    refetch();
    setIsAddClientModalOpen(false);
  };
  
  const handleEditClient = (client: Client) => {
    setClientToEdit(client);
    setIsEditClientModalOpen(true);
  };
  
  const handleEditClientSuccess = () => {
    // No need to refetch as we're using React Query cache updates
    setIsEditClientModalOpen(false);
    setClientToEdit(null);
  };
  
  const handleDeleteClient = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteClientModalOpen(true);
  };
  
  const handleDeleteClientSuccess = () => {
    // No need to refetch as we're using React Query cache updates
    setIsDeleteClientModalOpen(false);
    setClientToDelete(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading clients...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-error">Error loading clients. Please try again.</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-textSecondary">
          {clients?.length || 0} clients found
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsAddClientModalOpen(true)}
            className="bg-buttonPrimary text-textLight px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Client
          </button>
        )}
      </div>

      <div className="bg-cardBackground shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-buttonBorder">
          <thead className="bg-darkerBackground">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Client Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Contact Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Industry
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-textSecondary uppercase tracking-wider">
                Assigned SEs
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-cardBackground divide-y divide-buttonBorder">
            {clients && clients.length > 0 ? (
              clients.map((client) => (
                <tr key={client._id} className="hover:bg-darkerBackground transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-textPrimary">{client.companyName}</div>
                    {client.contactName && (
                      <div className="text-xs text-textSecondary">Contact: {client.contactName}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{client.users && client.users.length > 0 ? client.users[0].email : '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{client.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-textPrimary">{client.industry || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'ACTIVE' 
                        ? 'bg-success bg-opacity-10 text-success' 
                        : client.status === 'INACTIVE'
                        ? 'bg-error bg-opacity-10 text-error'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {client.assignedSolutionsEngineerIds && client.assignedSolutionsEngineerIds.length > 0 ? (
                        client.assignedSolutionsEngineerIds.map((seId: string, index: number) => (
                          <span key={seId} className="bg-gray-100 px-2 py-1 rounded text-xs">
                            SE {index + 1}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-textSecondary">No SEs assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => handleEditClient(client)}
                      className="text-textPrimary hover:text-textSecondary mr-3 transition-opacity duration-200"
                      aria-label="Edit client"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDeleteClient(client)}
                      className="text-error hover:text-opacity-75 transition-opacity duration-200"
                      aria-label="Delete client"
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
                <td colSpan={7} className="px-6 py-4 text-center text-sm text-textSecondary">
                  No clients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onSuccess={handleAddClientSuccess}
        mode="create"
      />
      
      <AddClientModal
        isOpen={isEditClientModalOpen}
        onClose={() => {
          setIsEditClientModalOpen(false);
          setClientToEdit(null);
        }}
        onSuccess={handleEditClientSuccess}
        client={clientToEdit}
        mode="update"
      />
      
      <DeleteClientModal
        isOpen={isDeleteClientModalOpen}
        onClose={() => {
          setIsDeleteClientModalOpen(false);
          setClientToDelete(null);
        }}
        onSuccess={handleDeleteClientSuccess}
        client={clientToDelete}
      />
    </div>
  );
};

export default ClientsList;
