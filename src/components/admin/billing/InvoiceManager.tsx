'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import InvoiceList from './InvoiceList';
import CreateInvoiceModal from './CreateInvoiceModal';
import DeleteInvoiceModal from './DeleteInvoiceModal';

// Define types based on the models
interface Invoice {
  _id: string;
  clientId: string;
  clientSubscriptionId: string;
  invoiceDate: string;
  dueDate: string;
  paymentMethodInfo?: string;
  amountBilled: number;
  status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE' | 'VOID';
  notes?: string;
  clientName?: string; // Populated from client data
}

// Fetch invoices
const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch('/api/admin/invoices');
  if (!response.ok) {
    throw new Error('Failed to fetch invoices');
  }
  const data = await response.json();
  return data.invoices;
};

const InvoiceManager: React.FC = () => {
  const { isAdmin } = useAuth();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get the query client instance
  const queryClient = useQueryClient();

  // Fetch invoices with React Query
  const {
    data: invoices,
    isLoading,
    isError,
    refetch
  } = useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });
  


  const handleInvoiceSuccess = () => {
    refetch();
    setIsInvoiceModalOpen(false);
    setSelectedInvoice(null);
    setIsEditMode(false);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    setIsInvoiceModalOpen(true);
  };
  
  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setIsEditMode(false);
    setIsInvoiceModalOpen(true);
  };

  const handleDeleteInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
  };
  
  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedInvoice(null);
    refetch();
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading invoices...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-error">Error loading invoices. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Client Invoices</h2>
        {isAdmin && (
          <button
            onClick={handleCreateInvoice}
            className="bg-buttonPrimary text-textLight px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity duration-300 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Create Invoice
          </button>
        )}
      </div>

      <InvoiceList
        invoices={invoices || []}
        onViewInvoice={handleEditInvoice}
        onRefresh={refetch}
        onDeleteInvoice={handleDeleteInvoice}
      />

      <CreateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoice(null);
          setIsEditMode(false);
        }}
        onSuccess={handleInvoiceSuccess}
        existingInvoice={selectedInvoice || undefined}
        isEdit={isEditMode}
      />
      
      <DeleteInvoiceModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={handleDeleteSuccess}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default InvoiceManager;
