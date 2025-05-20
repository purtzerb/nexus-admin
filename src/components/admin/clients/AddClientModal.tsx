'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';
import { TextInput, SelectInput, CheckboxInput } from '@/components/shared/inputs';

// Define interfaces for client data
interface ClientDepartment {
  name: string;
  _id?: string;
}

interface ClientUser {
  name: string;
  email: string;
  phone?: string;
  department?: string;
  exceptions?: {
    email?: boolean;
    sms?: boolean;
  };
  access?: {
    billing?: boolean;
    admin?: boolean;
  };
  _id?: string;
}

interface SolutionsEngineer {
  _id: string;
  name: string;
  email: string;
}

interface Client {
  _id: string;
  companyName: string;
  companyUrl?: string;
  departments?: ClientDepartment[];
  users?: ClientUser[];
  assignedSolutionsEngineerIds?: string[];
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  industry?: string;
  contactName?: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  client?: Client | null;
  mode: 'create' | 'update';
}

// Fetch solutions engineers function
const fetchSolutionsEngineers = async (): Promise<SolutionsEngineer[]> => {
  const response = await fetch('/api/admin/solutions-engineers');
  if (!response.ok) {
    throw new Error('Failed to fetch solutions engineers');
  }
  const data = await response.json();
  return data.users;
};

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  client,
  mode
}) => {
  const { isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departments, setDepartments] = useState<ClientDepartment[]>([]);

  // User form state
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userDepartment, setUserDepartment] = useState('');
  const [userEmailException, setUserEmailException] = useState(false);
  const [userSmsException, setUserSmsException] = useState(false);
  const [userBillingAccess, setUserBillingAccess] = useState(false);
  const [userAdminAccess, setUserAdminAccess] = useState(false);
  const [users, setUsers] = useState<ClientUser[]>([]);

  // SE form state
  const [selectedSE, setSelectedSE] = useState<string>('');
  const [assignedSEs, setAssignedSEs] = useState<string[]>([]);

  // Fetch solutions engineers
  const { data: solutionsEngineers } = useQuery({
    queryKey: ['solutionsEngineers'],
    queryFn: fetchSolutionsEngineers
  });

  // Reset form when modal opens/closes or client changes
  useEffect(() => {
    if (isOpen && mode === 'update' && client) {
      setCompanyName(client.companyName || '');
      setCompanyUrl(client.companyUrl || '');
      setDepartments(client.departments || []);
      setUsers(client.users || []);
      setAssignedSEs(client.assignedSolutionsEngineerIds || []);
    } else if (isOpen && mode === 'create') {
      setCompanyName('');
      setCompanyUrl('');
      setDepartments([]);
      setUsers([]);
      setAssignedSEs([]);
    }

    // Reset user form
    resetUserForm();

    // Reset department form
    setDepartmentName('');

    // Reset SE form
    setSelectedSE('');

    setErrors({});
    setSubmitError('');
  }, [isOpen, client, mode]);

  const resetUserForm = () => {
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserDepartment('');
    setUserEmailException(false);
    setUserSmsException(false);
    setUserBillingAccess(false);
    setUserAdminAccess(false);
  };

  // Handle adding a department
  const handleAddDepartment = () => {
    if (!departmentName.trim()) return;

    setDepartments([...departments, { name: departmentName }]);
    setDepartmentName('');
  };

  // Handle removing a department
  const handleRemoveDepartment = (index: number) => {
    const updatedDepartments = [...departments];
    updatedDepartments.splice(index, 1);
    setDepartments(updatedDepartments);
  };

  // Handle adding a user
  const handleAddUser = () => {
    if (!userName.trim() || !userEmail.trim()) return;

    const newUser: ClientUser = {
      name: userName,
      email: userEmail,
      phone: userPhone,
      department: userDepartment,
      exceptions: {
        email: userEmailException,
        sms: userSmsException
      },
      access: {
        billing: userBillingAccess,
        admin: userAdminAccess
      }
    };

    setUsers([...users, newUser]);
    resetUserForm();
  };

  // Handle removing a user
  const handleRemoveUser = (index: number) => {
    const updatedUsers = [...users];
    updatedUsers.splice(index, 1);
    setUsers(updatedUsers);
  };

  // Handle adding a solutions engineer
  const handleAddSE = () => {
    if (!selectedSE || assignedSEs.includes(selectedSE)) return;
    setAssignedSEs([...assignedSEs, selectedSE]);
    setSelectedSE('');
  };

  // Handle removing a solutions engineer
  const handleRemoveSE = (seId: string) => {
    setAssignedSEs(assignedSEs.filter(id => id !== seId));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName) {
      setSubmitError('Company name is required');
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSubmitError('');

    const clientData = {
      companyName,
      companyUrl,
      departments,
      users,
      assignedSolutionsEngineerIds: assignedSEs
    };

    try {
      const url = mode === 'create'
        ? '/api/admin/clients'
        : `/api/admin/clients/${client?._id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save client');
      }

      // Show success toast
      showToast(
        mode === 'create' ? 'Client created successfully' : 'Client updated successfully',
        'success'
      );

      // Invalidate clients query to refresh data
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      // Close modal and notify parent of success
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving client:', error);
      handleApiError(error);
      setSubmitError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Client' : 'Edit Client'}
      maxWidth="5xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Left Column - Company Information */}
          <div className="space-y-4">
            <TextInput
              id="companyName"
              label="Company Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Enter company name"
              required
            />

            <TextInput
              id="companyUrl"
              label="Company URL"
              value={companyUrl}
              onChange={(e) => setCompanyUrl(e.target.value)}
              placeholder="https://"
              type="url"
              required
            />
          </div>

          {/* Right Column - Manage Departments */}
          <div>
            <h4 className="text-md font-medium mb-2">Manage Departments</h4>
            <div className="bg-darkerBackground p-4 rounded">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={departmentName}
                  onChange={(e) => setDepartmentName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
                  placeholder="Department name"
                />
                {departmentName && (
                  <button
                    type="button"
                    onClick={() => setDepartmentName('')}
                    className="ml-2 text-error"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={handleAddDepartment}
                className="w-full flex items-center justify-center px-4 py-2 border border-buttonBorder bg-white rounded hover:bg-darkerBackground transition-colors duration-200"
              >
                <span className="text-lg mr-1">+</span>
                Add Department
              </button>

              {departments.map((dept, index) => (
                <div key={index} className="flex items-center justify-between mb-2 last:mb-0">
                  <span>{dept.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(index)}
                    className="text-error"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div>
          <h4 className="text-md font-medium mb-2">Users</h4>

          {/* Users Table */}
          <div className="mb-4">
            <div className="bg-darkerBackground rounded">
              <div className="grid grid-cols-6 gap-2 p-2">
                <div className="font-medium text-sm">Name</div>
                <div className="font-medium text-sm">Email</div>
                <div className="font-medium text-sm">Phone</div>
                <div className="font-medium text-sm">Department</div>
                <div className="font-medium text-sm">Exceptions</div>
                <div className="font-medium text-sm">Access</div>
              </div>
            </div>

            {/* User Input Row */}
            <div className="grid grid-cols-6 gap-2 p-2 items-end">
              <div>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
                  placeholder="Full name"
                />
              </div>
              <div>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
                  placeholder="Email"
                />
              </div>
              <div>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
                  placeholder="Phone"
                />
              </div>
              <div>
                <select
                  value={userDepartment}
                  onChange={(e) => setUserDepartment(e.target.value)}
                  className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
                >
                  <option value="">Select Department</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col space-y-1 justify-center">
                <CheckboxInput
                  id="userEmailException"
                  label="Email"
                  checked={userEmailException}
                  onChange={(e) => setUserEmailException(e.target.checked)}
                />
                <CheckboxInput
                  id="userSmsException"
                  label="SMS"
                  checked={userSmsException}
                  onChange={(e) => setUserSmsException(e.target.checked)}
                />
              </div>
              <div className="flex flex-col space-y-1 justify-center">
                <CheckboxInput
                  id="userBillingAccess"
                  label="Billing"
                  checked={userBillingAccess}
                  onChange={(e) => setUserBillingAccess(e.target.checked)}
                />
                <CheckboxInput
                  id="userAdminAccess"
                  label="Admin"
                  checked={userAdminAccess}
                  onChange={(e) => setUserAdminAccess(e.target.checked)}
                />
              </div>
            </div>

            {/* Add User Button */}
            <div className="mt-2">
              <button
                type="button"
                onClick={handleAddUser}
                className="flex items-center px-4 py-2 bg-white border border-buttonBorder rounded hover:bg-darkerBackground transition-colors duration-200"
              >
                <span className="mr-1">+</span>
                Add User
              </button>
            </div>

            {/* Users List */}
            {users.length > 0 && (
              <div className="mt-4 border-t border-buttonBorder pt-2">
                {users.map((user, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 p-2 border-b border-buttonBorder last:border-b-0">
                    <div>{user.name}</div>
                    <div>{user.email}</div>
                    <div>{user.phone || '-'}</div>
                    <div>{user.department || '-'}</div>
                    <div>
                      {user.exceptions?.email && <span className="mr-1">Email</span>}
                      {user.exceptions?.sms && <span>SMS</span>}
                      {!user.exceptions?.email && !user.exceptions?.sms && '-'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        {user.access?.billing && <span className="mr-1">Billing</span>}
                        {user.access?.admin && <span>Admin</span>}
                        {!user.access?.billing && !user.access?.admin && '-'}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveUser(index)}
                        className="text-error"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Assign Solutions Engineers Section */}
        <div>
          <h4 className="text-md font-medium mb-2">Assign Solutions Engineers</h4>

          {/* SE Table Header */}
          <div className="bg-darkerBackground rounded">
            <div className="grid grid-cols-3 gap-2 p-2">
              <div className="font-medium text-sm">Name</div>
              <div className="font-medium text-sm">Email</div>
              <div className="font-medium text-sm">Actions</div>
            </div>
          </div>

          {/* SE Input Row */}
          <div className="grid grid-cols-3 gap-2 p-2 items-center">
            <div>
              <select
                value={selectedSE}
                onChange={(e) => setSelectedSE(e.target.value)}
                className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
              >
                <option value="">Select SE</option>
                {solutionsEngineers?.map((se) => (
                  <option key={se._id} value={se._id}>{se.name}</option>
                ))}
              </select>
            </div>
            <div>
              {selectedSE && solutionsEngineers?.find(se => se._id === selectedSE)?.email || 'email@example.com'}
            </div>
            <div>
              <div className="text-error">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          {/* Add SE Button */}
          <div className="mt-2">
            <button
              type="button"
              onClick={handleAddSE}
              className="flex items-center px-4 py-2 bg-white border border-buttonBorder rounded hover:bg-darkerBackground transition-colors duration-200"
            >
              <span className="mr-1">+</span>
              Add Solutions Engineer
            </button>
          </div>

          {/* SE List */}
          {assignedSEs.length > 0 && (
            <div className="mt-4 border-t border-buttonBorder pt-2">
              {assignedSEs.map((seId) => {
                const se = solutionsEngineers?.find(s => s._id === seId);
                return (
                  <div key={seId} className="grid grid-cols-3 gap-2 p-2 border-b border-buttonBorder last:border-b-0">
                    <div>{se?.name || 'Unknown'}</div>
                    <div>{se?.email || ''}</div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveSE(seId)}
                        className="text-error"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {submitError && (
          <div className="text-error text-sm">{submitError}</div>
        )}

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-buttonBorder rounded text-textPrimary hover:bg-darkerBackground transition-colors duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-buttonPrimary text-white rounded hover:opacity-90 transition-opacity duration-200"
            disabled={isSubmitting || !isAdmin}
          >
            {isSubmitting ? 'Processing...' : (mode === 'create' ? 'Create Client' : 'Update Client')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddClientModal;
