'use client';

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import AddWorkflowModal from '@/components/admin/clients/detail/AddWorkflowModal';
import DeleteWorkflowModal from '@/components/admin/clients/detail/DeleteWorkflowModal';
import { showToast } from '@/lib/toast/toastUtils';

interface Workflow {
  _id: string;
  name: string;
  departmentId?: string;
  department?: string; // Department name from populated departmentId
  status: 'ACTIVE' | 'INACTIVE';
  numberOfNodes: number;
  numberOfExecutions: number;
  numberOfExceptions: number;
  timeSavedPerExecution?: number;
  moneySavedPerExecution?: number;
  createdAt: string;
}

interface ClientWorkflowsProps {
  clientId: string;
}

const ClientWorkflows: React.FC<ClientWorkflowsProps> = ({ clientId }) => {
  const { isAdmin } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const queryClient = useQueryClient();

  // Fetch workflows
  const { data: workflowsData, isLoading, isError, refetch } = useQuery({
    queryKey: ['client-workflows', clientId],
    queryFn: async () => {
      const response = await fetch(`/api/admin/clients/${clientId}/workflows`);
      if (!response.ok) {
        throw new Error('Failed to fetch workflows');
      }
      const data = await response.json();
      return data.workflows || [];
    },
    staleTime: 0, // Always consider data stale to ensure fresh data
    refetchOnWindowFocus: true // Refetch when window regains focus
  });
  
  // Handle workflow creation success
  const handleWorkflowCreated = () => {
    // Explicitly refetch the workflows data
    refetch();
    // Close the modal
    setIsAddModalOpen(false);
  };
  
  // Handle workflow update success
  const handleWorkflowUpdated = () => {
    // Explicitly refetch the workflows data
    refetch();
    // Close the modal
    setIsAddModalOpen(false);
    setSelectedWorkflow(null);
  };
  
  // Handle edit workflow
  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsAddModalOpen(true);
  };
  
  // Handle delete workflow
  const handleDeleteWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setIsDeleteModalOpen(true);
  };
  
  // Handle delete workflow success
  const handleDeleteWorkflowSuccess = () => {
    // Explicitly refetch the workflows data
    refetch();
    // Close the modal
    setIsDeleteModalOpen(false);
    setSelectedWorkflow(null);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleString('default', { month: 'short' })} ${date.getDate()}, ${date.getFullYear()}`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Workflows</h3>
        </div>
        <div className="text-textSecondary">Loading workflows...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Workflows</h3>
        </div>
        <div className="text-error">Error loading workflows</div>
      </div>
    );
  }

  const workflows = workflowsData || [];

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b border-buttonBorder flex justify-between items-center">
        <h3 className="text-lg font-medium">Workflows</h3>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-buttonPrimary text-textLight px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Workflow
        </button>
      </div>

      <div className="p-4">
        {workflows.length === 0 ? (
          <div className="text-textSecondary text-center py-6">
            No workflows found for this client. Click "Add Workflow" to create one.
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
                <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-buttonBorder">
                {workflows.map((workflow: Workflow) => (
                  <tr key={workflow._id} className="hover:bg-darkerBackground">
                    <td className="px-4 py-3 text-sm">
                      {formatDate(workflow.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {workflow.department || 'N/A'}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {workflow.name}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {workflow.numberOfNodes}
                    </td>
                    <td className="px-4 py-3 text-center text-blue-600">
                      {workflow.numberOfExecutions}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600">
                      {workflow.numberOfExceptions}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {workflow.timeSavedPerExecution ? 
                        `${workflow.timeSavedPerExecution} min` : 
                        'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {workflow.moneySavedPerExecution ? 
                        `${workflow.moneySavedPerExecution} USD` : 
                        'N/A'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workflow.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {workflow.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => handleEditWorkflow(workflow)}
                          className="text-textPrimary hover:text-textSecondary mr-3 transition-opacity duration-200"
                          aria-label="Edit workflow"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteWorkflow(workflow)}
                          className="text-error hover:text-opacity-75 transition-opacity duration-200"
                          aria-label="Delete workflow"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Workflow Modal */}
      <AddWorkflowModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedWorkflow(null);
        }}
        onSuccess={selectedWorkflow ? handleWorkflowUpdated : handleWorkflowCreated}
        clientId={clientId}
        workflow={selectedWorkflow}
      />
      
      {/* Delete Workflow Modal */}
      <DeleteWorkflowModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedWorkflow(null);
        }}
        onSuccess={handleDeleteWorkflowSuccess}
        clientId={clientId}
        workflow={selectedWorkflow}
      />
    </div>
  );
};

export default ClientWorkflows;
