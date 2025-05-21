import React from 'react';
import SubscriptionsList from '@/components/admin/subscriptions/SubscriptionsList';
import PageHeader from '@/components/shared/PageHeader';

export default function SubscriptionsPage() {
  return (
    <div className="space-y-4">
      <PageHeader pageTitle="Plan Manager" />
      <div className="mt-6">
        <SubscriptionsList />
      </div>
    </div>
  );
}
