'use client';

import React, { useState, useEffect } from 'react';
import { showToast } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';
import { TextInput } from '@/components/shared/inputs';
import SelectInput from '@/components/shared/inputs/SelectInput';
import SearchableSelect, { Option } from '@/components/shared/inputs/SearchableSelect';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Client {
  _id: string;
  companyName: string;
}

interface ClientSubscription {
  _id: string;
  clientId: string;
  subscriptionPlanId: string;
  startDate: string;
  endDate?: string;
  clientName?: string;
  planName?: string;
}

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

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingInvoice?: Invoice;
  isEdit?: boolean;
}

// This function is no longer needed as we'll use the search API instead

// Fetch client subscriptions
const fetchClientSubscriptions = async (clientId?: string): Promise<ClientSubscription[]> => {
  if (!clientId) return [];
  
  console.log('Fetching subscriptions for client ID:', clientId);
  
  // Use a more specific endpoint that filters by clientId
  const response = await fetch(`/api/admin/client-subscriptions?clientId=${clientId}&limit=50`);
  if (!response.ok) {
    throw new Error('Failed to fetch client subscriptions');
  }
  
  const data = await response.json();
  console.log('Fetched subscriptions:', data);
  
  // Return the subscriptions from the response
  return data.subscriptions || [];
};

const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingInvoice,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    clientId: '',
    clientSubscriptionId: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    paymentMethodInfo: 'Stripe',
    amountBilled: '',
    status: 'DRAFT',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialClientOption, setInitialClientOption] = useState<Option | null>(null);
  
  // Get the query client instance at the top level
  const queryClient = useQueryClient();

  // We no longer need to fetch all clients upfront
  // Instead, we'll use the search API endpoint when needed

  // Fetch client subscriptions when client is selected
  const { data: clientSubscriptions, isLoading: isLoadingSubscriptions } = useQuery({
    queryKey: ['clientSubscriptions', formData.clientId],
    queryFn: () => fetchClientSubscriptions(formData.clientId),
    enabled: isOpen && !!formData.clientId
  });

  // Fetch client details when editing an invoice
  const fetchClientDetails = async (clientId: string) => {
    try {
      const response = await fetch(`/api/admin/clients/${clientId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch client details');
      }
      const data = await response.json();
      if (data.client) {
        setInitialClientOption({
          value: data.client._id,
          label: data.client.companyName
        });
      }
    } catch (error) {
      console.error('Error fetching client details:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isEdit && existingInvoice) {
        // Populate form with existing invoice data for editing
        setFormData({
          clientId: existingInvoice.clientId,
          clientSubscriptionId: existingInvoice.clientSubscriptionId,
          invoiceDate: new Date(existingInvoice.invoiceDate).toISOString().split('T')[0],
          dueDate: new Date(existingInvoice.dueDate).toISOString().split('T')[0],
          paymentMethodInfo: existingInvoice.paymentMethodInfo || 'Stripe',
          amountBilled: existingInvoice.amountBilled.toString(),
          status: existingInvoice.status,
          notes: existingInvoice.notes || ''
        });
        
        // If we have the client name already, use it
        if (existingInvoice.clientName) {
          setInitialClientOption({
            value: existingInvoice.clientId,
            label: existingInvoice.clientName
          });
        } else if (existingInvoice.clientId) {
          // Otherwise fetch the client details
          fetchClientDetails(existingInvoice.clientId);
        }
      } else {
        // Reset form for new invoice
        setFormData({
          clientId: '',
          clientSubscriptionId: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paymentMethodInfo: 'Stripe',
          amountBilled: '',
          status: 'DRAFT',
          notes: ''
        });
        setInitialClientOption(null);
      }
      setErrors({});
    }
  }, [isOpen, isEdit, existingInvoice]);



  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!formData.clientSubscriptionId) {
      newErrors.clientSubscriptionId = 'Subscription is required';
    }

    if (!formData.invoiceDate) {
      newErrors.invoiceDate = 'Invoice date is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (!formData.amountBilled || isNaN(Number(formData.amountBilled)) || Number(formData.amountBilled) <= 0) {
      newErrors.amountBilled = 'Amount billed must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Search clients function for SearchableSelect using API endpoint
  const searchClients = async (query: string): Promise<Option[]> => {
    try {
      // Construct query parameters
      const params = new URLSearchParams();
      if (query.trim()) {
        params.append('query', query);
      }
      params.append('limit', '5'); // Limit to 5 results

      // Call the search API endpoint
      const response = await fetch(`/api/admin/clients/search?${params}`);

      if (!response.ok) {
        throw new Error('Failed to search clients');
      }

      const data = await response.json();
      console.log('Search results:', data.clients);

      // Map the results to the Option format
      return (data.clients || []).map((client: Client) => ({
        value: client._id,
        label: client.companyName
      }));
    } catch (error) {
      console.error('Error searching clients:', error);
      showToast('Failed to search clients', 'error');
      return [];
    }
  };

  // Handle client selection
  const handleClientChange = (clientId: string) => {
    setFormData({
      ...formData,
      clientId,
      clientSubscriptionId: '' // Reset subscription when client changes
    });
    
    // Log for debugging
    console.log('Selected client ID:', clientId);
    
    // Force refetch of client subscriptions when client changes
    setTimeout(() => {
      // We use setTimeout to ensure the state update has completed
      queryClient.invalidateQueries({ queryKey: ['clientSubscriptions', clientId] });
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSubmit = {
        ...formData,
        amountBilled: parseFloat(formData.amountBilled)
      };

      let url = '/api/admin/invoices';
      let method = 'POST';
      let successMessage = 'Invoice created successfully!';
      
      if (isEdit && existingInvoice) {
        url = `/api/admin/invoices/${existingInvoice._id}`;
        method = 'PUT';
        successMessage = 'Invoice updated successfully!';
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${isEdit ? 'update' : 'create'} invoice`);
      }

      showToast(successMessage, 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} invoice:`, error);
      showToast(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!isEdit || !existingInvoice) return;
    
    if (!confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/admin/invoices/${existingInvoice._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }
      
      showToast('Invoice deleted successfully!', 'success');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error deleting invoice:', error);
      showToast(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        'error'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Invoice' : 'Create Invoice'}
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Client */}
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Client<span className="text-error ml-1">*</span>
            </label>
            <SearchableSelect
              value={formData.clientId}
              onChange={handleClientChange}
              onSearch={searchClients}
              placeholder="Search for a client..."
              emptyMessage="No clients found"
              className="w-full"
              debounceMs={300}
              initialOptions={initialClientOption ? [initialClientOption] : []}
            />
            {errors.clientId && <p className="mt-1 text-xs text-error">{errors.clientId}</p>}
          </div>

          {/* Client Subscription */}
          <div className="col-span-2 sm:col-span-1">
            <SelectInput
              id="clientSubscriptionId"
              label="Subscription"
              value={formData.clientSubscriptionId}
              onChange={handleChange}
              options={(clientSubscriptions || []).map(sub => ({ 
                value: sub._id, 
                label: sub.planName || 'Unknown Plan'
              }))}
              placeholder={isLoadingSubscriptions 
                    ? "Loading subscriptions..." 
                    : clientSubscriptions && clientSubscriptions.length > 0 
                      ? "Select a subscription" 
                      : "No subscriptions found"}
              required
              error={errors.clientSubscriptionId}
              className="pr-8"
              disabled={!formData.clientId || isLoadingSubscriptions || (clientSubscriptions && clientSubscriptions.length === 0)}
            />
          </div>

          {/* Invoice Date */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="invoiceDate"
              label="Invoice Date"
              type="date"
              value={formData.invoiceDate}
              onChange={handleChange}
              required
              error={errors.invoiceDate}
            />
          </div>

          {/* Due Date */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="dueDate"
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={handleChange}
              required
              error={errors.dueDate}
            />
          </div>

          {/* Payment Method */}
          <div className="col-span-2 sm:col-span-1">
            <SelectInput
              id="paymentMethodInfo"
              label="Payment Method"
              value={formData.paymentMethodInfo}
              onChange={handleChange}
              options={[
                { value: 'Stripe', label: 'Stripe' },
                { value: 'Submit to ERP', label: 'Submit to ERP' }
              ]}
              required
              error={errors.paymentMethodInfo}
              className="pr-8"
            />
          </div>

          {/* Amount Billed */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="amountBilled"
              label="Amount Billed"
              value={formData.amountBilled}
              onChange={handleChange}
              type="number"
              required
              error={errors.amountBilled}
              leftIcon={<span className="text-gray-500">$</span>}
            />
          </div>



          {/* Status */}
          <div className="col-span-2 sm:col-span-1">
            <SelectInput
              id="status"
              label="Status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SENT', label: 'Sent' },
                { value: 'PAID', label: 'Paid' },
                { value: 'OVERDUE', label: 'Overdue' },
                { value: 'VOID', label: 'Void' }
              ]}
              required
              error={errors.status}
              className="pr-8"
            />
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label htmlFor="notes" className="block text-sm font-medium mb-1">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
              placeholder="Add any notes or additional information about this invoice"
            />
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t border-buttonBorder">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors duration-200"
            >
              {isSubmitting ? 'Deleting...' : 'Delete Invoice'}
            </button>
          )}
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-buttonBorder rounded hover:bg-darkerBackground transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors duration-200"
            >
              {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default CreateInvoiceModal;
