'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/lib/toast/toastUtils';

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
  clientName?: string;
}

interface InvoiceListProps {
  invoices: Invoice[];
  onViewInvoice: (invoice: Invoice) => void;
  onRefresh: () => void;
  onDeleteInvoice?: (invoice: Invoice) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ 
  invoices, 
  onViewInvoice,
  onRefresh,
  onDeleteInvoice
}) => {
  const { isAdmin } = useAuth();

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'SENT':
        return 'bg-blue-100 text-blue-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800';
      case 'VOID':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodLabel = (paymentMethodInfo: string | undefined) => {
    if (!paymentMethodInfo) return 'N/A';
    
    if (paymentMethodInfo.toLowerCase().includes('stripe')) {
      return 'Stripe';
    } else if (paymentMethodInfo.toLowerCase().includes('erp')) {
      return 'ERP';
    } else {
      return paymentMethodInfo;
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-buttonBorder">
        <thead className="bg-darkerBackground">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
              Client
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
              Invoice Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
              Due Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
              Payment Method
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
              Amount
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
              Status
            </th>
            <th scope="col" className="relative px-6 py-3 text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-buttonBorder">
          {invoices.length > 0 ? (
            invoices.map((invoice) => (
              <tr key={invoice._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onViewInvoice(invoice)}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-textPrimary">{invoice.clientName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-textPrimary">{formatDate(invoice.invoiceDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-textPrimary">{formatDate(invoice.dueDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-textPrimary">{getPaymentMethodLabel(invoice.paymentMethodInfo)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-textPrimary">{formatCurrency(invoice.amountBilled)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewInvoice(invoice);
                    }}
                    className="text-textPrimary hover:text-textSecondary transition-opacity duration-200"
                    aria-label="Edit invoice"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </button>
                  {isAdmin && onDeleteInvoice && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteInvoice(invoice);
                      }}
                      className="text-error hover:text-red-700 transition-opacity duration-200 ml-2"
                      aria-label="Delete invoice"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="px-6 py-4 text-center text-sm text-textSecondary">
                No invoices found. Click "Create Invoice" to add one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;
