import React from 'react';
import PageHeader from '@/components/shared/PageHeader';
import { Metadata } from 'next';
import BillingTabs from '@/components/admin/billing/BillingTabs';

export const metadata: Metadata = {
  title: 'Client Billing Center | Nexus Admin',
  description: 'Manage client subscriptions, invoices, and billing information.'
};

export default function BillingPage() {
  return (
    <div className="h-full bg-darkerBackground">
      <PageHeader pageTitle="Client Billing Center" />
      <div className="p-6 space-y-4">
        <BillingTabs />
      </div>
    </div>
  );
}
