'use client';

import React, { useState, useEffect } from 'react';
import { useClientDetails, useClientMetrics } from '@/hooks/useClientDashboard';
import Header from '@/components/shared/PageHeader';
import Link from 'next/link';
import Image from 'next/image';

export default function ClientDashboardPage() {
  const { data: clientDetails, isLoading: isLoadingClient, error: clientError } = useClientDetails();
  const { data: metrics, isLoading: isLoadingMetrics, error: metricsError } = useClientMetrics();
  const [hasError, setHasError] = useState<boolean>(false);
  
  useEffect(() => {
    if (clientError || metricsError) {
      setHasError(true);
      console.error('Client dashboard error:', clientError || metricsError);
    }
  }, [clientError, metricsError]);

  // Format time in hours for display
  const formatTime = (minutes: number): string => {
    return `${(minutes / 60).toFixed(1)} hrs`;
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Show loading skeleton while data is loading
  const isLoading = isLoadingClient || isLoadingMetrics;
  
  // Error message component
  const ErrorMessage = () => (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div className="flex items-center">
        <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-red-600">There was an error loading your dashboard data. Please try refreshing the page.</p>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Dashboard" />
      <div className="p-6">
        {hasError && <ErrorMessage />}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section: Pipeline Progress */}
          <div className="bg-cardBackground p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Pipeline Progress</h2>
            {isLoadingClient ? (
              <div>Loading pipeline progress...</div>
            ) : clientDetails?.pipelineSteps && clientDetails.pipelineSteps.length > 0 ? (
              <div className="space-y-4">
                {clientDetails.pipelineSteps
                  .sort((a, b) => a.order - b.order)
                  .map((step, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div 
                        className={`w-4 h-4 rounded-full ${
                          step.status === 'completed' 
                            ? 'bg-success' 
                            : clientDetails.pipelineProgressCurrentPhase === step.name 
                              ? 'bg-blue-500' 
                              : 'bg-gray-300'
                        }`}
                      ></div>
                      <div>
                        <p className="font-medium">{step.name}</p>
                        <p className="text-sm text-gray-500">
                          {step.status === 'completed' && step.completedDate 
                            ? `Completed ${new Date(step.completedDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric' 
                              })}` 
                            : clientDetails.pipelineProgressCurrentPhase === step.name 
                              ? 'In progress' 
                              : ''}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div>No pipeline steps available</div>
            )}
          </div>
          
          {/* Middle Section: Metrics Cards (stacked vertically) */}
          <div className="space-y-6">
            {/* Time Saved Card */}
            <div className="bg-cardBackground p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Time Saved</h2>
              <div className="grid grid-cols-2">
                <div>
                  <div className="text-3xl font-bold">
                    {isLoadingMetrics ? 'Loading...' : formatTime(metrics?.timeSaved?.recent || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Last 7 days</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {isLoadingMetrics ? '' : formatTime(metrics?.timeSaved?.total || 0)}
                  </div>
                  <div className="text-sm text-gray-500">All time</div>
                </div>
              </div>
            </div>
            
            {/* Money Saved Card */}
            <div className="bg-cardBackground p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Money Saved</h2>
              <div className="grid grid-cols-2">
                <div>
                  <div className="text-3xl font-bold">
                    {isLoadingMetrics ? 'Loading...' : formatCurrency(metrics?.moneySaved?.recent || 0)}
                  </div>
                  <div className="text-sm text-gray-500">Last 7 days</div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">
                    {isLoadingMetrics ? '' : formatCurrency(metrics?.moneySaved?.total || 0)}
                  </div>
                  <div className="text-sm text-gray-500">All time</div>
                </div>
              </div>
            </div>
            
            {/* Active Workflows Card */}
            <div className="bg-cardBackground p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Active Workflows</h2>
              <div className="flex justify-between items-center">
                <div className="text-3xl font-bold">
                  {isLoadingMetrics ? 'Loading...' : metrics?.activeWorkflows || 0}
                </div>
                <Link href="/client/workflows" className="text-sm text-primary hover:underline">
                  View workflows →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Right Section: Solutions Engineers */}
          <div>
            {isLoadingClient ? (
              <div className="bg-cardBackground p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Your Solutions Engineer</h2>
                <div>Loading solutions engineer data...</div>
              </div>
            ) : clientDetails?.assignedSolutionsEngineers && clientDetails.assignedSolutionsEngineers.length > 0 ? (
              <div className="bg-cardBackground p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Your Solutions Engineer</h2>
                <div className="space-y-6">
                  {clientDetails.assignedSolutionsEngineers.map((se, index) => (
                    <div key={index} className="flex items-center">
                      <div className="relative mr-4">
                        <img 
                          src={se.profileImageUrl || '/images/default-avatar.png'} 
                          alt={se.name || 'Solutions Engineer'}
                          className="w-16 h-16 rounded-full object-cover" 
                        />
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{se.name || 'Solutions Engineer'}</h3>
                        <p className="text-sm text-gray-500">Solutions Engineer</p>
                        <button 
                          onClick={() => window.location.href = `/client/messaging?se=${se.id}`}
                          className="mt-2 text-sm text-primary hover:underline"
                        >
                          Message SE
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-cardBackground p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Your Solutions Engineer</h2>
                <p>No solutions engineers assigned yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
