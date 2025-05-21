'use client';

import React, { useState } from 'react';
import PlanManager from './PlanManager';
import InvoiceManager from './InvoiceManager';
import CreditManager from './CreditManager';
import { useAuth } from '@/hooks/useAuth';

const BillingTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      <div className="border-b border-buttonBorder">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('plans')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'plans'
                ? 'border-buttonPrimary text-buttonPrimary'
                : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-buttonBorder'
            }`}
          >
            Plan Manager
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'invoices'
                ? 'border-buttonPrimary text-buttonPrimary'
                : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-buttonBorder'
            }`}
          >
            Invoice Manager
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab('credits')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'credits'
                  ? 'border-buttonPrimary text-buttonPrimary'
                  : 'border-transparent text-textSecondary hover:text-textPrimary hover:border-buttonBorder'
              }`}
            >
              Credit Manager
            </button>
          )}
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'plans' && <PlanManager />}
        {activeTab === 'invoices' && <InvoiceManager />}
        {activeTab === 'credits' && isAdmin && <CreditManager />}
      </div>
    </div>
  );
};

export default BillingTabs;
