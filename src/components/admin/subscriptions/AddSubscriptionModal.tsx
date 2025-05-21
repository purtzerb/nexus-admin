'use client';

import React, { useState, useEffect } from 'react';
import { showToast } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';
import { TextInput } from '@/components/shared/inputs';
import SelectInput from '@/components/shared/inputs/SelectInput';

interface Subscription {
  _id: string;
  name: string;
  pricingModel: 'Fixed' | 'Tiered' | 'Usage';
  contractLength: number; // in months
  billingCadence: 'Monthly' | 'Quarterly' | 'Annually';
  setupFee: number;
  prepaymentPercentage: number;
  cap: number;
  overageCost: number;
  clientCount?: number;
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
    contractLength: 12,
    billingCadence: 'Monthly',
    setupFee: 0,
    prepaymentPercentage: 0,
    cap: 0,
    overageCost: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (subscription && mode === 'update') {
      setFormData({
        name: subscription.name,
        pricingModel: subscription.pricingModel,
        contractLength: subscription.contractLength,
        billingCadence: subscription.billingCadence,
        setupFee: subscription.setupFee,
        prepaymentPercentage: subscription.prepaymentPercentage,
        cap: subscription.cap,
        overageCost: subscription.overageCost
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        pricingModel: 'Fixed',
        contractLength: 12,
        billingCadence: 'Monthly',
        setupFee: 0,
        prepaymentPercentage: 0,
        cap: 0,
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

    if (formData.cap < 0) {
      newErrors.cap = 'Cap cannot be negative';
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
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
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
              id="contractLength"
              label="Contract Length (months)"
              value={formData.contractLength.toString()}
              onChange={handleChange}
              type="number"
              required
            />
          </div>

          {/* Setup Fee */}
          <div className="col-span-2 sm:col-span-1">
            <div className="relative">
              <TextInput
                id="setupFee"
                label="Setup Fee"
                value={formData.setupFee.toString()}
                onChange={handleChange}
                type="number"
                error={errors.setupFee}
                className="pl-6"
              />
              <div className="absolute bottom-[9px] left-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
            </div>
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
            <div className="relative">
              <TextInput
                id="prepaymentPercentage"
                label="Prepayment Percentage"
                value={formData.prepaymentPercentage.toString()}
                onChange={handleChange}
                type="number"
                error={errors.prepaymentPercentage}
                className="pr-6"
              />
              <div className="absolute bottom-[9px] right-3 pointer-events-none">
                <span className="text-gray-500">%</span>
              </div>
            </div>
          </div>

          {/* Cap */}
          <div className="col-span-2 sm:col-span-1">
            <div className="relative">
              <TextInput
                id="cap"
                label="Cap"
                value={formData.cap.toString()}
                onChange={handleChange}
                type="number"
                error={errors.cap}
                className="pl-6"
              />
              <div className="absolute bottom-[9px] left-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
            </div>
          </div>

          {/* Overage Cost */}
          <div className="col-span-2 sm:col-span-1">
            <div className="relative">
              <TextInput
                id="overageCost"
                label="Overage Cost ($/hr)"
                value={formData.overageCost.toString()}
                onChange={handleChange}
                type="number"
                error={errors.overageCost}
                className="pl-6"
              />
              <div className="absolute bottom-[9px] left-3 pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
            </div>
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
