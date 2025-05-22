'use client';

import React from 'react';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import Header from '@/components/shared/PageHeader';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import { CreditCardIcon, InvoiceIcon, UsageIcon } from '@/components/shared/NavIcons';

// Define interfaces for API responses
interface Subscription {
  planName: string;
  billingCadence: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  nextBillingDate: string;
  contractEndDate: string;
  baseFee: number;
  status: string;
}

interface Credits {
  balance: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amountBilled: number;
  status: string;
}

interface PaymentMethod {
  cardType: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface UsageSummary {
  apiCalls: number;
  storageUsed: string;
  activeUsers: number;
}

interface SEHours {
  current: number;
  total: number;
  remaining: number;
}

// API fetching functions
const fetchSubscription = async (): Promise<Subscription> => {
  const response = await fetch('/api/client/subscription');
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch subscription');
  }
  return {
    planName: data.planName,
    billingCadence: data.billingCadence,
    nextBillingDate: data.nextBillingDate,
    contractEndDate: data.contractEndDate,
    baseFee: data.baseFee,
    status: data.status
  };
};

const fetchCredits = async (): Promise<Credits> => {
  const response = await fetch('/api/client/credits');
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch credits');
  }
  return {
    balance: data.balance || 0
  };
};

const fetchInvoices = async (): Promise<Invoice[]> => {
  const response = await fetch('/api/client/invoices');
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch invoices');
  }
  return data.invoices || [];
};

const fetchPaymentMethod = async (): Promise<PaymentMethod | null> => {
  const response = await fetch('/api/client/payment-method');
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch payment method');
  }
  return data.paymentMethod;
};

const fetchWorkflowExecutionsCount = async (): Promise<number> => {
  const response = await fetch('/api/client/workflow-executions/count');
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch workflow executions count');
  }
  return data.count || 0;
};

const fetchClientUserCount = async (): Promise<number> => {
  const response = await fetch('/api/client/users/count');
  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch client user count');
  }
  return data.count || 0;
};

// Mock data for features that don't have backend implementations yet
const getMockSEHours = (): SEHours => {
  return {
    current: 12.5,
    total: 20,
    remaining: 7.5
  };
};

// Mock storage used data
const getMockStorageUsed = (): string => {
  return '1.2 TB';
};

export default function ClientBillingPage() {
  // Use React Query for data fetching
  const { data: subscription, error: subscriptionError, isLoading: isSubscriptionLoading } =
    useQuery({ queryKey: ['subscription'], queryFn: fetchSubscription });

  const { data: credits, error: creditsError, isLoading: isCreditsLoading } =
    useQuery({ queryKey: ['credits'], queryFn: fetchCredits });

  const { data: invoices, error: invoicesError, isLoading: isInvoicesLoading } =
    useQuery({ queryKey: ['invoices'], queryFn: fetchInvoices });

  const { data: paymentMethod, error: paymentMethodError, isLoading: isPaymentMethodLoading } =
    useQuery({ queryKey: ['paymentMethod'], queryFn: fetchPaymentMethod });

  const { data: apiCallsCount, error: apiCallsError, isLoading: isApiCallsLoading } =
    useQuery({ queryKey: ['workflowExecutionsCount'], queryFn: fetchWorkflowExecutionsCount });

  const { data: userCount, error: userCountError, isLoading: isUserCountLoading } =
    useQuery({ queryKey: ['clientUserCount'], queryFn: fetchClientUserCount });

  // Get mock SE hours data
  const seHours = getMockSEHours();

  // Handle errors with toast notifications
  React.useEffect(() => {
    if (subscriptionError) {
      handleApiError(subscriptionError, 'Failed to load subscription information');
    }
    if (creditsError) {
      handleApiError(creditsError, 'Failed to load credits information');
    }
    if (invoicesError) {
      handleApiError(invoicesError, 'Failed to load invoice information');
    }
    if (paymentMethodError) {
      handleApiError(paymentMethodError, 'Failed to load payment method information');
    }
    if (apiCallsError) {
      handleApiError(apiCallsError, 'Failed to load API calls information');
    }
    if (userCountError) {
      handleApiError(userCountError, 'Failed to load user count information');
    }
  }, [subscriptionError, creditsError, invoicesError, paymentMethodError, apiCallsError, userCountError]);

  // Prepare usage summary data
  const usageSummary: UsageSummary = {
    apiCalls: apiCallsCount || 0,
    storageUsed: getMockStorageUsed(), // Mocked data as per requirements
    activeUsers: userCount || 0
  };

  // Handle user actions
  const handleViewInvoice = (invoiceId: string) => {
    showToast(`Viewing invoice ${invoiceId}`, 'info');
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    const toastId = showToast(`Downloading invoice ${invoiceId}...`, 'loading');

    // Simulate download completion after 1.5 seconds
    setTimeout(() => {
      showToast('Invoice downloaded successfully', 'success');
    }, 1500);
  };

  const handleExportHistory = () => {
    const toastId = showToast('Exporting billing history...', 'loading');

    // Simulate export completion after 2 seconds
    setTimeout(() => {
      showToast('Billing history exported successfully', 'success');
    }, 2000);
  };

  const handleManageSubscription = () => {
    showToast('Redirecting to subscription management...', 'info');
  };

  const handleViewContract = () => {
    const toastId = showToast('Downloading contract...', 'loading');

    // Simulate download completion after 1.5 seconds
    setTimeout(() => {
      showToast('Contract downloaded successfully', 'success');
    }, 1500);
  };

  const handleEditPaymentMethod = () => {
    showToast('Editing payment method...', 'info');
  };

  const handleViewDetailedReport = () => {
    showToast('Viewing detailed usage report...', 'info');
  };

  // Check if any data is still loading
  const isLoading = isSubscriptionLoading || isCreditsLoading || isInvoicesLoading || isPaymentMethodLoading ||
                   isApiCallsLoading || isUserCountLoading;

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header pageTitle="Billing" />
        <div className="p-6 flex justify-center items-center">
          <LoadingSpinner />
          <span className="ml-2 text-textPrimary">Loading billing information...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Billing" />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold text-textPrimary mb-6">Billing Overview</h1>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Current Plan Card */}
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-textSecondary mb-2">Current Plan</h3>
            <p className="text-2xl font-bold text-textPrimary">{subscription?.planName || 'N/A'}</p>
            <p className="text-textSecondary text-sm mt-1">{subscription?.baseFee ? '$' + subscription.baseFee.toLocaleString() + '/month base fee' : 'N/A'}</p>
          </div>

          {/* Credits Remaining Card */}
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-textSecondary mb-2">Credits Remaining</h3>
            <p className="text-2xl font-bold text-textPrimary">{credits?.balance ? credits.balance.toLocaleString() : '0'}</p>
            <p className="text-textSecondary text-sm mt-1">&nbsp;</p>
          </div>

          {/* SE Hours Card */}
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-textSecondary mb-2">SE Hours This Month</h3>
            <p className="text-2xl font-bold text-textPrimary">{seHours.current} / {seHours.total}</p>
            <p className="text-textSecondary text-sm mt-1">{seHours.remaining} hours remaining</p>
          </div>
        </div>

        {/* Usage Summary and Recent Invoices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Usage Summary */}
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-textPrimary">Usage Summary</h2>
              <button
                onClick={handleViewDetailedReport}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center"
              >
                View detailed report
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div className="flex justify-between py-1">
                <span className="text-textSecondary text-base">API Calls</span>
                <span className="text-textPrimary font-medium text-base">{usageSummary.apiCalls ? usageSummary.apiCalls.toLocaleString() : '0'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-textSecondary text-base">Storage Used</span>
                <span className="text-textPrimary font-medium text-base">{usageSummary.storageUsed}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-textSecondary text-base">Active Users</span>
                <span className="text-textPrimary font-medium text-base">{usageSummary.activeUsers ? usageSummary.activeUsers.toString() : '0'}</span>
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-6 text-textPrimary">Recent Invoices</h2>

            <div className="space-y-5">
              {invoices && invoices.length > 0 ? (
                invoices.slice(0, 3).map((invoice) => (
                  <div key={invoice.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-textPrimary text-base">
                          {(() => {
                            try {
                              return format(new Date(invoice.invoiceDate), 'MMMM yyyy');
                            } catch (e) {
                              return 'Invalid date';
                            }
                          })()}
                        </h3>
                        <p className="text-textSecondary text-xs mt-0.5">Invoice #{invoice.invoiceNumber}</p>
                      </div>
                      <div className="flex items-center">
                        <span className="text-textPrimary font-medium mr-3 text-base">${invoice.amountBilled ? invoice.amountBilled.toLocaleString() : '0.00'}</span>
                        <button
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-gray-700 hover:text-gray-900 focus:outline-none"
                          aria-label="Download invoice"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-textSecondary text-center py-4">No invoices found</p>
              )}
            </div>

            {invoices?.length && invoices.length > 3 ? <div className="mt-6 text-center">
              <button
                onClick={handleExportHistory}
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium flex items-center justify-center w-full"
              >
                View all invoices
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div> : null}
          </div>
        </div>

        {/* Billing Actions */}
        <div className="bg-cardBackground p-6 rounded-lg shadow mt-8">
          <h2 className="text-xl font-semibold mb-6 text-textPrimary">Billing Actions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Method */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-textPrimary">Payment Method</h3>

              {paymentMethod ? (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="mr-3 flex items-center justify-center">
                      <img src="/visa-logo.svg" alt="Visa" className="h-8 w-12" onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.style.display = 'none';
                      }} />
                    </div>
                    <div>
                      <p className="text-textPrimary font-medium">{paymentMethod.cardType || 'Visa'} ending in {paymentMethod.last4 || '4242'}</p>
                      <p className="text-textSecondary text-xs mt-1">Expires {paymentMethod.expiryMonth || '12'}/{paymentMethod.expiryYear || '25'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-dashed border rounded-lg p-4 flex items-center justify-center h-24">
                  <p className="text-textSecondary">No payment method on file</p>
                </div>
              )}

              <div className="mt-4">
                <button
                  onClick={handleEditPaymentMethod}
                  className="text-indigo-600 hover:text-indigo-900 text-sm"
                >
                  {paymentMethod ? 'Update payment method' : 'Add payment method'}
                </button>
              </div>
            </div>

            {/* Need Help */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-textPrimary">Need Help?</h3>

              <div className="space-y-3">
                <button
                  onClick={handleViewContract}
                  className="w-full px-4 py-3 bg-transparent text-textPrimary border border-gray-900 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
                >
                  Download Contract
                </button>

                <button
                  className="w-full px-4 py-3 bg-black text-white rounded-lg font-medium text-center hover:bg-gray-900 transition-colors"
                  onClick={() => showToast('Contacting support...', 'info')}
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
