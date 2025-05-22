'use client';

import React, { useState, useEffect } from 'react';
import { showToast } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';
import { TextInput } from '@/components/shared/inputs';
import SelectInput from '@/components/shared/inputs/SelectInput';
import DatePicker from '@/components/shared/inputs/DatePicker';
import SearchableSelect, { Option } from '@/components/shared/inputs/SearchableSelect';

interface Client {
  _id: string;
  companyName: string;
  activeSubscriptionId?: string;
}

interface SubscriptionPlan {
  _id: string;
  name: string;
  pricingModel: string;
  billingCadence: string;
}

interface ClientSubscription {
  _id?: string;
  clientId: string;
  subscriptionPlanId: string;
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING_RENEWAL';
}

interface AssignSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
  existingSubscription: ClientSubscription | null;
  onSave: () => void;
  selectableClients?: boolean;
}

const AssignSubscriptionModal: React.FC<AssignSubscriptionModalProps> = ({
  isOpen,
  onClose,
  client,
  existingSubscription,
  onSave,
  selectableClients = false
}) => {
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(client?._id || '');
  const [formData, setFormData] = useState<Omit<ClientSubscription, '_id'>>({
    clientId: client?._id || '',
    subscriptionPlanId: '',
    startDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);

  // We no longer need to fetch all clients upfront
  // Instead, we'll use the search API endpoint when needed

  // Fetch subscription plans
  useEffect(() => {
    const fetchSubscriptionPlans = async () => {
      try {
        setIsLoading(true);

        // Try the subscriptions endpoint first
        let response = await fetch('/api/admin/subscriptions');
        let plansData = [];

        if (response.ok) {
          const data = await response.json();
          if (data.subscriptions && Array.isArray(data.subscriptions)) {
            plansData = data.subscriptions;
            console.log('Fetched subscription plans from /subscriptions:', plansData);
          }
        }

        // If no plans found, try the subscription-plans endpoint as fallback
        if (plansData.length === 0) {
          response = await fetch('/api/admin/subscription-plans');
          if (response.ok) {
            const data = await response.json();
            if (data.plans && Array.isArray(data.plans)) {
              plansData = data.plans;
              console.log('Fetched subscription plans from /subscription-plans:', plansData);
            }
          } else {
            throw new Error('Failed to fetch subscription plans');
          }
        }

        if (plansData.length > 0) {
          setSubscriptionPlans(plansData);
        } else {
          console.warn('No subscription plans found in either API response');
          showToast('No subscription plans available', 'error');
        }
      } catch (error) {
        console.error('Error fetching subscription plans:', error);
        showToast('Failed to load subscription plans', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionPlans();
  }, []);

  // Initialize form with existing subscription data if available
  useEffect(() => {
    if (existingSubscription) {
      setFormData({
        clientId: existingSubscription.clientId,
        subscriptionPlanId: existingSubscription.subscriptionPlanId,
        startDate: new Date(existingSubscription.startDate).toISOString().split('T')[0],
        endDate: existingSubscription.endDate
          ? new Date(existingSubscription.endDate).toISOString().split('T')[0]
          : undefined,
        status: existingSubscription.status
      });
    } else {
      // Reset form for new subscription
      setFormData({
        clientId: selectedClientId || (client?._id || ''),
        subscriptionPlanId: subscriptionPlans.length > 0 ? subscriptionPlans[0]._id : '',
        startDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
      });
    }
    setErrors({});
  }, [client, existingSubscription, subscriptionPlans, selectedClientId]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!formData.subscriptionPlanId) {
      newErrors.subscriptionPlanId = 'Subscription plan is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    const dataToSubmit = {
      clientId: formData.clientId,
      subscriptionPlanId: formData.subscriptionPlanId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: formData.status
    };



    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
    setSelectedClientId(clientId);
    setFormData(prev => ({
      ...prev,
      clientId
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value, type } = e.target;

    setFormData(prev => ({
      ...prev,
      [id]: type === 'number' ? (value ? parseFloat(value) : undefined) : value
    }));

    // Clear error when field is edited
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleDateChange = (id: string, date: Date | null) => {
    setFormData(prev => ({
      ...prev,
      [id]: date ? date.toISOString().split('T')[0] : undefined
    }));

    // Clear error when field is edited
    if (errors[id]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[id];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const url = existingSubscription
        ? `/api/admin/client-subscriptions/${existingSubscription._id}`
        : '/api/admin/client-subscriptions';

      const method = existingSubscription ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save subscription');
      }

      showToast(
        existingSubscription
          ? 'Subscription updated successfully'
          : 'Subscription assigned successfully',
        'success'
      );

      onSave();
    } catch (error) {
      console.error('Error saving subscription:', error);
      showToast((error as Error).message || 'Failed to save subscription', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingSubscription ? 'Update Subscription' : 'Assign Subscription'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit}>
        {!selectableClients && client && (
          <div className="mb-4">
            <p className="text-gray-700 font-medium">Client: <span className="font-bold">{client.companyName}</span></p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Client Selection - only shown when selectableClients is true */}
          {selectableClients && (
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1 text-gray-700">
                Client<span className="text-error ml-1">*</span>
              </label>
              <SearchableSelect
                value={formData.clientId}
                onChange={handleClientChange}
                onSearch={searchClients}
                placeholder="Search for a client..."
                emptyMessage="No clients found"
                initialOptions={clients.map(client => ({
                  value: client._id,
                  label: client.companyName
                }))}
                className="w-full"
              />
              {errors.clientId && <p className="mt-1 text-xs text-error">{errors.clientId}</p>}
            </div>
          )}
          {/* Subscription Plan */}
          <div className="col-span-2 sm:col-span-1">
            <SelectInput
              id="subscriptionPlanId"
              label="Subscription Plan"
              value={formData.subscriptionPlanId}
              onChange={handleChange}
              options={subscriptionPlans.map(plan => ({
                value: plan._id,
                label: plan.name
              }))}
              required
              error={errors.subscriptionPlanId}
              disabled={isLoading}
              className="pr-8"
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
                { value: 'ACTIVE', label: 'Active' },
                { value: 'CANCELLED', label: 'Cancelled' },
                { value: 'EXPIRED', label: 'Expired' },
                { value: 'PENDING_RENEWAL', label: 'Pending Renewal' }
              ]}
              required
              error={errors.status}
              className="pr-8"
            />
          </div>

          {/* Start Date */}
          <div className="col-span-2 sm:col-span-1">
            <DatePicker
              id="startDate"
              label="Start Date"
              value={formData.startDate ? new Date(formData.startDate) : null}
              onChange={(date) => handleDateChange('startDate', date)}
              required
              error={errors.startDate}
            />
          </div>

          {/* End Date */}
          <div className="col-span-2 sm:col-span-1">
            <DatePicker
              id="endDate"
              label="End Date (Optional)"
              value={formData.endDate ? new Date(formData.endDate) : null}
              onChange={(date) => handleDateChange('endDate', date)}
              error={errors.endDate}
            />
          </div>






        </div>

        <div className="flex justify-end space-x-3 pt-4 mt-4 border-t border-buttonBorder">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-buttonBorder rounded hover:bg-darkerBackground transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isLoading}
            className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-opacity-90 transition-colors duration-200"
          >
            {isSubmitting
              ? 'Saving...'
              : existingSubscription
                ? 'Update Subscription'
                : 'Assign Subscription'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignSubscriptionModal;
