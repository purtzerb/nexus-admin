'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

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
  const [editingDoc, setEditingDoc] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  
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
  
  // Mutation to update document link
  const updateDocumentLink = useMutation({
    mutationFn: async ({ type, url }: { type: string; url: string }) => {
      const response = await fetch(`/api/admin/clients/${clientId}/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, url })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update document link');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the client and document data
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-documents', clientId] });
      setEditingDoc(null);
      setUrlInput('');
    },
    onError: (error) => {
      console.error('Error updating document link:', error);
    }
  });
  
  // Function to handle starting edit mode
  const handleStartEdit = (doc: DocumentLink) => {
    setEditingDoc(doc.type);
    setUrlInput(doc.url);
  };
  
  // Function to handle saving the edited URL
  const handleSaveUrl = (type: string) => {
    updateDocumentLink.mutate({ type, url: urlInput });
  };
  
  // Function to handle canceling edit mode
  const handleCancelEdit = () => {
    setEditingDoc(null);
    setUrlInput('');
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
        {updateDocumentLink.isPending && (
          <div className="mb-4 p-2 bg-darkerBackground rounded text-textSecondary text-sm">
            Updating document link...
          </div>
        )}
        <ul className="space-y-4">
          {documents.map((doc: DocumentLink) => (
            <li key={doc._id} className="border-b border-buttonBorder pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-1">
                <div className="text-sm font-medium text-textSecondary">{doc.title}</div>
                {(isAdmin || doc.type === editingDoc) && (
                  <div>
                    {editingDoc === doc.type ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSaveUrl(doc.type)}
                          disabled={updateDocumentLink.isPending}
                          className="text-xs bg-success text-textLight px-2 py-1 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          disabled={updateDocumentLink.isPending}
                          className="text-xs bg-error text-textLight px-2 py-1 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleStartEdit(doc)}
                        className="text-xs bg-buttonPrimary text-textLight px-2 py-1 rounded hover:opacity-90 transition-opacity"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {editingDoc === doc.type ? (
                <div className="mt-1">
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full p-2 border border-buttonBorder rounded text-sm"
                    placeholder="Enter document URL"
                  />
                </div>
              ) : (
                <div>
                  {doc.url ? (
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-buttonPrimary hover:underline break-all"
                    >
                      {doc.url}
                    </a>
                  ) : (
                    <span className="text-sm text-textSecondary italic">No URL provided</span>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DocumentLinks;
