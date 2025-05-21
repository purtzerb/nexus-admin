'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface PipelineStep {
  _id: string;
  name: string;
  status: 'completed' | 'in_progress' | 'pending';
  completedDate?: string;
  order: number;
}

interface PipelineProgressProps {
  clientId: string;
}

const PipelineProgress: React.FC<PipelineProgressProps> = ({ clientId }) => {
  const { isAdmin } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);
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
    }
  });
  
  // Mutation to update pipeline step status
  const updatePipelineStep = useMutation({
    mutationFn: async ({ stepName, status }: { stepName: string; status: 'pending' | 'in_progress' | 'completed' }) => {
      setIsUpdating(true);
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
      setIsUpdating(false);
    },
    onError: (error) => {
      console.error('Error updating pipeline step:', error);
      setIsUpdating(false);
    }
  });
  
  // Function to handle marking a step as complete
  const handleMarkComplete = (stepName: string) => {
    updatePipelineStep.mutate({ stepName, status: 'completed' });
  };
  
  // Function to handle marking a step as in progress
  const handleMarkInProgress = (stepName: string) => {
    updatePipelineStep.mutate({ stepName, status: 'in_progress' });
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

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-buttonBorder">
        <h3 className="text-lg font-medium">Pipeline Progress</h3>
      </div>
      <div className="p-4">
        {isUpdating && (
          <div className="mb-4 p-2 bg-darkerBackground rounded text-textSecondary text-sm">
            Updating pipeline status...
          </div>
        )}
        <ul className="space-y-4">
          {sortedSteps.map((step: PipelineStep) => (
            <li key={step._id} className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-1">
                {step.status === 'completed' ? (
                  <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
                    <svg className="w-4 h-4 text-textLight" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : step.status === 'in_progress' ? (
                  <div className="w-6 h-6 rounded-full border-2 border-buttonPrimary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-buttonPrimary"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-buttonBorder"></div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:justify-between">
                  <p className="font-medium text-textPrimary">{step.name}</p>
                  <div className="mt-1 sm:mt-0 flex space-x-2">
                    {/* Show action buttons based on step status and user role */}
                    {(isAdmin || step.status === 'in_progress') && (
                      <>
                        {step.status === 'pending' && (
                          <button 
                            onClick={() => handleMarkInProgress(step.name)}
                            disabled={isUpdating}
                            className="text-sm bg-buttonPrimary text-textLight px-3 py-1 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            Start Step
                          </button>
                        )}
                        {step.status === 'in_progress' && (
                          <button 
                            onClick={() => handleMarkComplete(step.name)}
                            disabled={isUpdating}
                            className="text-sm bg-success text-textLight px-3 py-1 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
                          >
                            Mark Complete
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {step.completedDate && (
                  <p className="text-sm text-textSecondary mt-1">
                    Completed on {new Date(step.completedDate).toLocaleDateString()}
                  </p>
                )}
                {step.status === 'in_progress' && (
                  <p className="text-sm text-textSecondary mt-1 italic">
                    In progress
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PipelineProgress;
