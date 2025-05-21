'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { showToast } from '@/lib/toast/toastUtils';
import { TextInput } from '@/components/shared/inputs';
import SelectInput from '@/components/shared/inputs/SelectInput';

interface Client {
  _id: string;
  name: string;
  creditBalance?: number;
}

// Fetch clients with credit information
const fetchClientsWithCredits = async (): Promise<Client[]> => {
  const response = await fetch('/api/admin/clients?includeCredits=true');
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  const data = await response.json();
  return data.clients;
};

const CreditManager: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState('');
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch clients with credit information
  const { 
    data: clients, 
    isLoading, 
    isError,
    refetch
  } = useQuery({
    queryKey: ['clientsWithCredits'],
    queryFn: fetchClientsWithCredits,
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedClientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!creditAmount || isNaN(Number(creditAmount)) || Number(creditAmount) <= 0) {
      newErrors.creditAmount = 'Credit amount must be a positive number';
    }

    if (!creditReason.trim()) {
      newErrors.creditReason = 'Reason for credit is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleApplyCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/clients/${selectedClientId}/credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Number(creditAmount),
          reason: creditReason
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to apply credit');
      }

      showToast('Credit applied successfully!', 'success');
      setSelectedClientId('');
      setCreditAmount('');
      setCreditReason('');
      refetch();
    } catch (error) {
      console.error('Error applying credit:', error);
      showToast(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading client credit information...</div>;
  }

  if (isError) {
    return <div className="text-center py-8 text-error">Error loading client credit information. Please try again.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Client Credits</h2>
        <p className="text-textSecondary mt-1">Apply credits to client accounts for adjustments, refunds, or promotional offers.</p>
      </div>

      <div className="bg-white p-6 rounded-lg border border-buttonBorder">
        <h3 className="text-lg font-medium mb-4">Apply New Credit</h3>
        <form onSubmit={handleApplyCredit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <SelectInput
                id="clientId"
                label="Client"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                options={(clients || []).map(client => ({ 
                  value: client._id, 
                  label: `${client.name} (Current Balance: ${formatCurrency(client.creditBalance)})` 
                }))}
                placeholder="Select a client"
                required
                error={errors.clientId}
                className="pr-8"
              />
            </div>
            <div>
              <TextInput
                id="creditAmount"
                label="Credit Amount"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                type="number"
                required
                error={errors.creditAmount}
                leftIcon={<span className="text-gray-500">$</span>}
              />
            </div>
            <div>
              <TextInput
                id="creditReason"
                label="Reason for Credit"
                value={creditReason}
                onChange={(e) => setCreditReason(e.target.value)}
                required
                error={errors.creditReason}
                placeholder="e.g., Service adjustment, Promotional offer"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors duration-200"
            >
              {isSubmitting ? 'Applying...' : 'Apply Credit'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-lg border border-buttonBorder overflow-hidden">
        <h3 className="text-lg font-medium p-4 border-b border-buttonBorder">Client Credit Balances</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-buttonBorder">
            <thead className="bg-darkerBackground">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                  Credit Balance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-textSecondary uppercase tracking-wider text-[0.65rem]">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-buttonBorder">
              {clients && clients.length > 0 ? (
                clients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-textPrimary">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-textPrimary">{formatCurrency(client.creditBalance)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-textSecondary">
                        {/* This would come from the API in a real implementation */}
                        {new Date().toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-textSecondary">
                    No client credit information available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CreditManager;
