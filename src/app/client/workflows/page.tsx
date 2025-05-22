'use client';

import React, { useState } from 'react';
import Header from '@/components/shared/PageHeader';
import { useClientWorkflows, IWorkflowData } from '@/hooks/useClientWorkflows';

export default function ClientWorkflowsPage() {
  const { data: workflows, isLoading, error } = useClientWorkflows();
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Format time saved in hours
  const formatHours = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`;
    }
    return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMinutes} min`;
  };
  
  // Format money as currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header pageTitle="Workflows" />
      <div className="p-6">
        <div className="bg-cardBackground rounded-lg shadow">
          <div className="flex justify-between items-center p-4 border-b border-buttonBorder">
            <h2 className="text-xl font-semibold">Your Workflows</h2>
          </div>
          
          <div className="p-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                <p className="mt-2 text-textSecondary">Loading workflows...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-error">
                <p>Error loading workflows. Please try again later.</p>
              </div>
            ) : workflows && workflows.length === 0 ? (
              <div className="text-textSecondary text-center py-6">
                No workflows found for your account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-buttonBorder">
                  <thead>
                    <tr className="text-left text-sm text-textSecondary">
                      <th className="px-4 py-3">Create Date</th>
                      <th className="px-4 py-3">Department</th>
                      <th className="px-4 py-3">Workflow Name</th>
                      <th className="px-4 py-3 text-center"># of Nodes</th>
                      <th className="px-4 py-3 text-center"># of Executions</th>
                      <th className="px-4 py-3 text-center"># of Exceptions</th>
                      <th className="px-4 py-3 text-center">Time Saved</th>
                      <th className="px-4 py-3 text-center">$ Saved</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-buttonBorder">
                    {workflows && workflows.map((workflow: IWorkflowData) => (
                      <tr key={workflow._id} className="hover:bg-darkerBackground">
                        <td className="px-4 py-3 text-sm">
                          {formatDate(workflow.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {workflow.department}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          {workflow.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {workflow.nodesCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {workflow.executionsCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {workflow.exceptionsCount}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {formatHours(workflow.timeSaved)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          {formatCurrency(workflow.moneySaved)}
                        </td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            workflow.status === 'ACTIVE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {workflow.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
