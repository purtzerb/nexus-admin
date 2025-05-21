'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface PipelineStep {
  _id: string;
  name: string;
  status: 'completed' | 'pending';
  completedDate?: string;
  order: number;
}

interface PipelineProgressProps {
  clientId: string;
}

const PipelineProgress: React.FC<PipelineProgressProps> = ({ clientId }) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();

  // Fetch pipeline progress
  const { data: pipelineSteps, isLoading, isError } = useQuery({
    queryKey: ['client-pipeline', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/clients/${clientId}/pipeline`);
      if (!response.ok) {
        throw new Error('Failed to fetch pipeline progress');
      }
      const data = await response.json();
      return data.pipelineSteps || [];
    },
    // Use staleTime to prevent unnecessary refetches
    staleTime: 30000 // 30 seconds
  });

  // Mutation to update pipeline step status
  const updatePipelineStep = useMutation({
    mutationFn: async ({ stepName, status }: { stepName: string; status: 'pending' | 'completed' }) => {
      const response = await fetch(`/api/admin/clients/${clientId}/pipeline`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stepName, status })
      });

      if (!response.ok) {
        throw new Error('Failed to update pipeline step');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch the client and pipeline data
      queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-pipeline', clientId] });
    },
    onError: (error) => {
      console.error('Error updating pipeline step:', error);
    }
  });

  // Function to handle marking a step as complete
  const handleMarkComplete = (stepName: string) => {
    updatePipelineStep.mutate({ stepName, status: 'completed' });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Pipeline Progress</h3>
        <div className="text-textSecondary">Loading pipeline progress...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Pipeline Progress</h3>
        <div className="text-error">Error loading pipeline progress</div>
      </div>
    );
  }

  if (!pipelineSteps || pipelineSteps.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Pipeline Progress</h3>
        <div className="text-textSecondary">No pipeline steps found for this client</div>
      </div>
    );
  }

  // Sort steps by order
  const sortedSteps = [...pipelineSteps].sort((a, b) => a.order - b.order);

  // Find the first pending step - this is our active step
  const activeStepIndex = sortedSteps.findIndex(step => step.status === 'pending');

  // If all steps are completed, there is no active step
  const activeStep = activeStepIndex >= 0 ? sortedSteps[activeStepIndex] : null;


  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-buttonBorder">
        <h3 className="text-lg font-medium">Pipeline Progress</h3>
      </div>
      <div className="p-4">
        <ul className="space-y-4">
          {sortedSteps.map((step: PipelineStep, index: number) => {
            const isActiveStep = step._id === activeStep?._id;

            return (
              <li key={step._id}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {step.status === 'completed' ? (
                      <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                        <svg className="w-4 h-4 text-textLight" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-buttonBorder"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-textPrimary">{step.name}</p>
                    {step.completedDate && (
                      <p className="text-sm text-textSecondary mt-1">
                        Completed on {new Date(step.completedDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Show Mark Complete button under the active step */}
                {isActiveStep && (
                  <div className="mt-2 ml-9">
                    <button
                      onClick={() => handleMarkComplete(step.name)}
                      disabled={updatePipelineStep.isPending}
                      className="text-sm bg-success text-textLight px-3 py-1 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 relative"
                    >
                      <span className={updatePipelineStep.isPending ? 'invisible' : ''}>
                        Mark Complete
                      </span>
                      {updatePipelineStep.isPending && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg className="animate-spin h-4 w-4 text-textLight" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PipelineProgress;
