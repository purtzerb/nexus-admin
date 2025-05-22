'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/shared/PageHeader';
import CredentialForm from '@/components/client/credentials/CredentialForm';
import { ICredential, CredentialData } from '@/models/Credential';
import { SUPPORTED_SERVICES, createEmptyCredentials, SupportedService } from '@/lib/utils/credentialValidation';

export default function ClientCredentialsPage() {
  const [credentials, setCredentials] = useState<ICredential[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCredentialId, setSelectedCredentialId] = useState<string | null>(null);
  const [newServiceType, setNewServiceType] = useState<SupportedService>('Slack');

  // Fetch all credentials on component mount
  useEffect(() => {
    fetchCredentials();
  }, []);

  // Select the first credential by default when credentials are loaded
  useEffect(() => {
    if (credentials.length > 0 && !selectedCredentialId) {
      setSelectedCredentialId(credentials[0]._id?.toString() || null);
    }
  }, [credentials, selectedCredentialId]);

  // Fetch credentials from the API
  const fetchCredentials = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/client/credentials');

      if (!response.ok) {
        throw new Error('Failed to fetch credentials');
      }

      const data = await response.json();
      setCredentials(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching credentials:', err);
      setError('Failed to load credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving a credential
  const handleSaveCredential = async (id: string, serviceName: string, credentialData: CredentialData) => {
    try {
      // If we're editing an existing credential
      if (id) {
        const response = await fetch(`/api/client/credentials/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credentials: credentialData
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update credential');
        }

        // Update the credential in the local state
        const updatedCredential = await response.json();
        setCredentials(credentials.map(cred =>
          cred._id?.toString() === id ? updatedCredential : cred
        ));
      }
      // If we're adding a new credential
      else {
        const response = await fetch('/api/client/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceName,
            credentials: credentialData
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to add credential');
        }

        // Add the new credential to the local state
        const newCredential = await response.json();
        setCredentials([...credentials, newCredential]);

        // Auto-select the newly created credential
        setSelectedCredentialId(newCredential._id?.toString() || null);
      }
    } catch (err) {
      console.error('Error saving credential:', err);
      setError('Failed to save credential. Please try again.');
    }
  };

  // Handle deleting a credential
  const handleDeleteCredential = async (id: string) => {
    if (!confirm('Are you sure you want to delete this credential?')) {
      return;
    }

    try {
      const response = await fetch(`/api/client/credentials/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete credential');
      }

      // Remove the credential from the local state
      setCredentials(credentials.filter(cred => cred._id?.toString() !== id));

      // If the deleted credential was selected, select another one
      if (selectedCredentialId === id && credentials.length > 1) {
        const remainingCredentials = credentials.filter(cred => cred._id?.toString() !== id);
        if (remainingCredentials.length > 0) {
          setSelectedCredentialId(remainingCredentials[0]._id?.toString() || null);
        } else {
          setSelectedCredentialId(null);
        }
      }
    } catch (err) {
      console.error('Error deleting credential:', err);
      setError('Failed to delete credential. Please try again.');
    }
  };

  // Get the selected credential
  const getSelectedCredential = () => {
    if (!selectedCredentialId) return null;
    return credentials.find(cred => cred._id?.toString() === selectedCredentialId) || null;
  };

  // Function to create a new credential directly
  const handleCreateNewCredential = async (serviceName: string) => {
    try {
      const emptyCredential = createEmptyCredentials(serviceName as SupportedService);
      await handleSaveCredential('', serviceName, emptyCredential);
    } catch (error) {
      console.error('Error creating credential:', error);
      setError('Failed to create credential');
    }
  };

  // Handle credential selection
  const handleSelectCredential = (id: string) => {
    setSelectedCredentialId(id);
  };

  // Render loading state
  if (loading && credentials.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header pageTitle="Credentials" />
        <div className="p-6 flex justify-center items-center">
          <p className="text-textSecondary">Loading credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Credentials" />

      <div className="p-6">
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Two-column layout */}
        <div className="flex rounded-lg overflow-hidden shadow">
          {/* Left column - Service list */}
          <div className="w-1/3 bg-white border-r shadow-sm">
            <div className="p-6">
              <h2 className="text-lg font-semibold mb-6">Third Party Services</h2>

              {/* Services list */}
              <div className="space-y-4">
                {credentials.map(credential => {
                  const isSelected = credential._id?.toString() === selectedCredentialId;
                  const iconMap: Record<string, React.ReactNode> = {
                    'Slack': <span className="inline-flex items-center justify-center w-6 h-6 mr-2">🔵</span>,
                    'GitHub': <span className="inline-flex items-center justify-center w-6 h-6 mr-2">⚫</span>,
                    'Jira': <span className="inline-flex items-center justify-center w-6 h-6 mr-2">🔷</span>,
                    'Salesforce': <span className="inline-flex items-center justify-center w-6 h-6 mr-2">☁️</span>,
                    'AWS': <span className="inline-flex items-center justify-center w-6 h-6 mr-2">📦</span>,
                  };

                  return (
                    <div
                      key={credential._id?.toString()}
                      className={`flex items-center p-3 rounded-md cursor-pointer ${isSelected ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => handleSelectCredential(credential._id?.toString() || '')}
                    >
                      {iconMap[credential.serviceName] || <span className="inline-flex items-center justify-center w-6 h-6 mr-2">🔗</span>}
                      <span>{credential.serviceName}</span>
                      {credential.status === 'CONNECTED' && (
                        <span className="ml-auto w-2 h-2 bg-green-500 rounded-full"></span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Add spacing between columns */}
          <div className="w-2"></div>

          {/* Right column - Credential form */}
          <div className="w-2/3 bg-white px-2">
            {selectedCredentialId && getSelectedCredential() ? (
              <CredentialForm
                credentialId={selectedCredentialId}
                serviceName={getSelectedCredential()!.serviceName}
                status={getSelectedCredential()!.status}
                currentCredentials={getSelectedCredential()!.credentials}
                onSave={handleSaveCredential}
              />
            ) : (
              <div className="p-6 flex flex-col items-center justify-center h-full">
                <p className="text-gray-500 mb-4">Select a credential to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
