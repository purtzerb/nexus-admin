'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { TextInput } from '@/components/shared/inputs';
import { showToast } from '@/lib/toast/toastUtils';

interface DocumentLink {
  _id: string;
  title: string;
  url: string;
  type: string;
}

interface DocumentLinksProps {
  clientId: string;
}

const DocumentLinks: React.FC<DocumentLinksProps> = ({ clientId }) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [documentLinks, setDocumentLinks] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [originalLinks, setOriginalLinks] = useState<Record<string, string>>({});
  
  // Fetch document links
  const { data: documents, isLoading, isError } = useQuery({
    queryKey: ['client-documents', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/clients/${clientId}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch document links');
      }
      const data = await response.json();
      return data.documents || [];
    }
  });
  
  // Initialize document links state when data is loaded
  useEffect(() => {
    if (documents && documents.length > 0) {
      const links: Record<string, string> = {};
      documents.forEach((doc: DocumentLink) => {
        links[doc.type] = doc.url || '';
      });
      setDocumentLinks(links);
      setOriginalLinks(links);
    }
  }, [documents]);
  
  // Mutation to update document links
  const updateDocumentLinks = useMutation({
    mutationFn: async (links: Record<string, string>) => {
      // Create an array of promises for each document link update
      const updatePromises = Object.entries(links).map(([type, url]) => {
        return fetch(`/api/admin/clients/${clientId}/documents`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ type, url })
        }).then(response => {
          if (!response.ok) {
            throw new Error(`Failed to update ${type} document link`);
          }
          return response.json();
        });
      });
      
      // Wait for all updates to complete
      return Promise.all(updatePromises);
    },
    onSuccess: () => {
      // Invalidate and refetch the client and document data
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-documents', clientId] });
      setIsEditing(false);
      setOriginalLinks({...documentLinks});
      showToast('Document links updated successfully', 'success');
    },
    onError: (error) => {
      console.error('Error updating document links:', error);
      showToast('Failed to update document links', 'error');
    }
  });
  
  // Function to handle input changes
  const handleInputChange = (type: string, value: string) => {
    setDocumentLinks(prev => ({
      ...prev,
      [type]: value
    }));
  };
  
  // Function to handle saving all document links
  const handleSaveAll = () => {
    updateDocumentLinks.mutate(documentLinks);
  };
  
  // Function to handle canceling all edits
  const handleCancelAll = () => {
    setDocumentLinks({...originalLinks});
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Document Links</h3>
        <div className="text-textSecondary">Loading documents...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Document Links</h3>
        <div className="text-error">Error loading documents</div>
      </div>
    );
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Document Links</h3>
        <div className="text-textSecondary">No documents found for this client</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-buttonBorder">
        <h3 className="text-lg font-medium">Document Links</h3>
      </div>
      <div className="p-4">
        {updateDocumentLinks.isPending && (
          <div className="mb-4 p-2 bg-darkerBackground rounded text-textSecondary text-sm">
            Updating document links...
          </div>
        )}
        
        {documents && documents.length > 0 ? (
          <div className="space-y-4">
            {documents.map((doc: DocumentLink) => (
              <div key={doc._id} className="border-b border-buttonBorder pb-4 last:border-0 last:pb-0">
                <TextInput
                  id={`doc-${doc.type}`}
                  label={doc.title}
                  value={documentLinks[doc.type] || ''}
                  onChange={(e) => {
                    handleInputChange(doc.type, e.target.value);
                    if (!isEditing) setIsEditing(true);
                  }}
                  placeholder="Enter document URL"
                  type="url"
                  className="mb-2"
                />
              </div>
            ))}
            
            {isEditing && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelAll}
                  disabled={updateDocumentLinks.isPending}
                  className="px-4 py-2 border border-buttonBorder rounded hover:bg-background transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={updateDocumentLinks.isPending}
                  className="px-4 py-2 bg-buttonPrimary text-textLight rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-textSecondary">No documents found for this client</div>
        )}
      </div>
    </div>
  );
};

export default DocumentLinks;
