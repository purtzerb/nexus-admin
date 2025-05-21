'use client';

import React, { useState, useEffect } from 'react';
import { showToast } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';
import { TextInput } from '@/components/shared/inputs';
import SelectInput from '@/components/shared/inputs/SelectInput';
import { Subscription } from '@/types/subscription';

// Using the shared Subscription interface from @/types/subscription

// Helper functions to map database enum values to frontend values
function mapDbPricingModelToUi(model: string): 'Fixed' | 'Tiered' | 'Usage' | 'Per Seat' {
  const modelMap: Record<string, 'Fixed' | 'Tiered' | 'Usage' | 'Per Seat'> = {
    'FIXED': 'Fixed',
    'TIERED_USAGE': 'Tiered',
    'CONSUMPTION': 'Usage',
    'PER_SEAT': 'Per Seat'
  };
  return modelMap[model] || 'Fixed';
}

function mapDbBillingCadenceToUi(cadence: string): 'Monthly' | 'Quarterly' | 'Annually' {
  const cadenceMap: Record<string, 'Monthly' | 'Quarterly' | 'Annually'> = {
    'MONTHLY': 'Monthly',
    'QUARTERLY': 'Quarterly',
    'YEARLY': 'Annually'
  };
  return cadenceMap[cadence] || 'Monthly';
}

// Helper functions to map frontend values to database enum values
function mapUiPricingModelToDb(model: string): 'FIXED' | 'TIERED_USAGE' | 'CONSUMPTION' | 'PER_SEAT' {
  const modelMap: Record<string, 'FIXED' | 'TIERED_USAGE' | 'CONSUMPTION' | 'PER_SEAT'> = {
    'Fixed': 'FIXED',
    'Tiered': 'TIERED_USAGE',
    'Usage': 'CONSUMPTION',
    'Per Seat': 'PER_SEAT'
  };
  return modelMap[model] || 'FIXED';
}

function mapUiBillingCadenceToDb(cadence: string): 'MONTHLY' | 'QUARTERLY' | 'YEARLY' {
  const cadenceMap: Record<string, 'MONTHLY' | 'QUARTERLY' | 'YEARLY'> = {
    'Monthly': 'MONTHLY',
    'Quarterly': 'QUARTERLY',
    'Annually': 'YEARLY'
  };
  return cadenceMap[cadence] || 'MONTHLY';
}

interface AddSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription?: Subscription | null;
  mode: 'create' | 'update';
}

const AddSubscriptionModal: React.FC<AddSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subscription,
  mode
}) => {
  const [formData, setFormData] = useState<Omit<Subscription, '_id' | 'clientCount'>>({
    name: '',
    pricingModel: 'Fixed',
    contractLengthMonths: 12,
    billingCadence: 'Monthly',
    setupFee: 0,
    prepaymentPercentage: 0,
    capAmount: 0,
    overageCost: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subscription && mode === 'update') {
      setFormData({
        name: subscription.name,
        pricingModel: mapDbPricingModelToUi(subscription.pricingModel),
        contractLengthMonths: subscription.contractLengthMonths,
        billingCadence: mapDbBillingCadenceToUi(subscription.billingCadence),
        setupFee: subscription.setupFee,
        prepaymentPercentage: subscription.prepaymentPercentage,
        capAmount: subscription.capAmount,
        overageCost: subscription.overageCost
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        pricingModel: 'Fixed',
        contractLengthMonths: 12,
        billingCadence: 'Monthly',
        setupFee: 0,
        prepaymentPercentage: 0,
        capAmount: 0,
        overageCost: 0
      });
    }
    setErrors({});
  }, [subscription, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (formData.setupFee < 0) {
      newErrors.setupFee = 'Setup fee cannot be negative';
    }

    if (formData.prepaymentPercentage < 0 || formData.prepaymentPercentage > 100) {
      newErrors.prepaymentPercentage = 'Prepayment percentage must be between 0 and 100';
    }

    if (formData.capAmount < 0) {
      newErrors.capAmount = 'Cap cannot be negative';
    }

    if (formData.overageCost < 0) {
      newErrors.overageCost = 'Overage cost cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Handle numeric inputs
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? 0 : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
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
      const url = mode === 'create' 
        ? '/api/admin/subscriptions' 
        : `/api/admin/subscriptions/${subscription?._id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      // Convert UI values to database enum values before sending
      const dataToSend = {
        ...formData,
        pricingModel: mapUiPricingModelToDb(formData.pricingModel),
        billingCadence: mapUiBillingCadenceToDb(formData.billingCadence)
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save subscription plan');
      }

      showToast(
        mode === 'create' 
          ? 'Subscription plan created successfully!' 
          : 'Subscription plan updated successfully!',
        'success'
      );
      
      onSuccess();
    } catch (error) {
      console.error('Error saving subscription plan:', error);
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
      title={mode === 'create' ? 'Add New Subscription Plan' : 'Edit Subscription Plan'}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Plan Name */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="name"
              label="Plan Name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter plan name"
              required
              error={errors.name}
            />
          </div>

          {/* Pricing Model */}
          <div className="col-span-2 sm:col-span-1">
            <SelectInput
              id="pricingModel"
              label="Pricing Model"
              value={formData.pricingModel}
              onChange={handleChange}
              options={[
                { value: 'Fixed', label: 'Fixed' },
                { value: 'Tiered', label: 'Tiered' },
                { value: 'Usage', label: 'Usage' }
              ]}
              required
              className="pr-8"
            />
          </div>

          {/* Contract Length */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="contractLengthMonths"
              label="Contract Length (months)"
              value={formData.contractLengthMonths.toString()}
              onChange={handleChange}
              type="number"
              error={errors.contractLengthMonths}
            />
          </div>

          {/* Setup Fee */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="setupFee"
              label="Setup Fee"
              value={formData.setupFee.toString()}
              onChange={handleChange}
              type="number"
              error={errors.setupFee}
              leftIcon={<span className="text-gray-500">$</span>}
            />
          </div>

          {/* Billing Cadence */}
          <div className="col-span-2 sm:col-span-1">
            <SelectInput
              id="billingCadence"
              label="Billing Cadence"
              value={formData.billingCadence}
              onChange={handleChange}
              options={[
                { value: 'Monthly', label: 'Monthly' },
                { value: 'Quarterly', label: 'Quarterly' },
                { value: 'Annually', label: 'Annually' }
              ]}
              required
              className="pr-8"
            />
          </div>

          {/* Prepayment Percentage */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="prepaymentPercentage"
              label="Prepayment Percentage"
              value={formData.prepaymentPercentage.toString()}
              onChange={handleChange}
              type="number"
              error={errors.prepaymentPercentage}
              rightIcon={<span className="text-gray-500">%</span>}
            />
          </div>

          {/* Cap */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="capAmount"
              label="Cap"
              value={formData.capAmount.toString()}
              onChange={handleChange}
              type="number"
              error={errors.capAmount}
              leftIcon={<span className="text-gray-500">$</span>}
            />
          </div>

          {/* Overage Cost */}
          <div className="col-span-2 sm:col-span-1">
            <TextInput
              id="overageCost"
              label="Overage Cost ($/hr)"
              value={formData.overageCost.toString()}
              onChange={handleChange}
              type="number"
              error={errors.overageCost}
              leftIcon={<span className="text-gray-500">$</span>}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-buttonBorder">
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
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Plan' : 'Update Plan'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSubscriptionModal;
