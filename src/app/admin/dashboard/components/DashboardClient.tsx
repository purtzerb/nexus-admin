'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getDashboardSummary,
  getDashboardClients,
  ClientsResponse,
  DashboardSummary,
  TimespanOption,
  SortField,
  SortOrder,
  timespanOptions,
} from '@/lib/db/dashboardService';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import StatisticCard from './StatisticCard';
import ClientsTable from './ClientsTable';
import SelectInput from '@/components/shared/inputs/SelectInput';
import PageHeader from '@/components/shared/PageHeader';

export default function DashboardClient() {
  const { isAdmin, loading: authLoading } = useAuth();
  const [timespan, setTimespan] = useState<TimespanOption>('last30days');
  const [sortBy, setSortBy] = useState<SortField>('revenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Fetch summary data
  const {
    data: summaryData,
    isLoading: isSummaryLoading,
    error: summaryError
  } = useQuery<DashboardSummary>({
    queryKey: ['dashboardSummary', timespan],
    queryFn: () => getDashboardSummary(timespan),
    enabled: !authLoading && isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch clients data
  const {
    data: clientsData,
    isLoading: isClientsLoading,
    error: clientsError
  } = useQuery<ClientsResponse>({
    queryKey: ['dashboardClients', timespan, sortBy, sortOrder],
    queryFn: () => getDashboardClients({ timespan, sortBy, sortOrder }),
    enabled: !authLoading && isAdmin,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const isLoading = isSummaryLoading || isClientsLoading;
  const error = summaryError || clientsError;

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <PageHeader pageTitle="Dashboard Overview" />
    <div className="space-y-6 p-5 bg-darkerBackground h-full min-h-screen">
      {/* Timespan Pills */}
      <div className="flex flex-wrap gap-2">
        {timespanOptions.map((option) => (
          <button
            key={option.value}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${timespan === option.value
              ? 'bg-black text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'}`}
            onClick={() => setTimespan(option.value as TimespanOption)}
          >
            {option.label}
          </button>
        ))}
      </div>

      {/* Dashboard Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          <p>Failed to load dashboard data. Please try again later.</p>
        </div>
      ) : (summaryData && clientsData) ? (
        <>
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatisticCard
              title="Total Revenue"
              value={summaryData.totalRevenue}
              valueType="currency"
              change={summaryData.totalRevenueChange}
              icon="revenue"
            />
            <StatisticCard
              title="Time Saved"
              value={summaryData.timeSaved}
              valueType="time"
              change={summaryData.timeSavedChange}
              icon="time"
            />
            <StatisticCard
              title="Active Workflows"
              value={summaryData.totalWorkflows}
              valueType="number"
              change={summaryData.totalWorkflowsChange}
              icon="workflow"
            />
            <StatisticCard
              title="Exceptions"
              value={summaryData.totalExceptions}
              valueType="number"
              change={summaryData.totalExceptionsChange}
              icon="exception"
            />
          </div>

          {/* Clients Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="text-lg font-bold">All Clients</h2>
              <p className="text-sm text-muted-foreground">
                Client statistics for {timespanOptions.find(option => option.value === timespan)?.label.toLowerCase()}
              </p>
            </div>
            <ClientsTable
              clients={clientsData.clients}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={(field: SortField, order: SortOrder) => {
                setSortBy(field);
                setSortOrder(order);
              }}
            />
          </div>
        </>
      ) : null}
    </div>
    </>
  );
}
