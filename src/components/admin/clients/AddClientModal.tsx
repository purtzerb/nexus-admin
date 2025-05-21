import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Dialog, Transition } from '@headlessui/react';
import CheckboxInput from '@/components/shared/inputs/CheckboxInput';
import SearchableSelect, { Option } from '@/components/shared/inputs/SearchableSelect';
import toast from 'react-hot-toast';
import { showToast, handleApiError } from '@/lib/toast/toastUtils';
import Modal from '@/components/ui/Modal';
import { TextInput } from '@/components/shared/inputs';

// Define interfaces for client data
interface ClientDepartment {
  _id?: string;
  name: string;
}

interface ClientUser {
  name: string;
  email: string;
  phone?: string;
  department?: {
    id: string;
    name: string;
  };
  exceptions?: {
    email?: boolean;
    sms?: boolean;
  };
  access?: {
    billing?: boolean;
    admin?: boolean;
  };
  _id?: string; // For existing users when editing
}

interface SolutionsEngineer {
  _id: string;
  name: string;
  email: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  onClientAdded?: () => void;
  client?: any;
  mode?: 'create' | 'update';
}

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onClientAdded,
  client,
  mode = 'create',
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Client form state
  const [companyName, setCompanyName] = useState('');
  const [companyUrl, setCompanyUrl] = useState('');

  // Department management
  const [departments, setDepartments] = useState<ClientDepartment[]>([]);
  const [departmentName, setDepartmentName] = useState('');

  // User management
  const [users, setUsers] = useState<ClientUser[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [userDepartment, setUserDepartment] = useState('');
  const [userEmailException, setUserEmailException] = useState(false);
  const [userSmsException, setUserSmsException] = useState(false);
  const [userBillingAccess, setUserBillingAccess] = useState(false);
  const [userAdminAccess, setUserAdminAccess] = useState(false);

  // Solutions Engineer assignment
  const [selectedSE, setSelectedSE] = useState('');
  const [assignedSEs, setAssignedSEs] = useState<string[]>([]);

  // Fetch solutions engineers
  const { data: solutionsEngineers } = useQuery<SolutionsEngineer[]>({
    queryKey: ['solutionsEngineers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/solutions-engineers');
      if (!response.ok) {
        throw new Error('Failed to fetch solutions engineers');
      }
      const data = await response.json();
      return data.users;
    },
    enabled: isOpen,
  });

  // Fetch departments from the database (limited to 5)
  const { data: dbDepartments } = useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const response = await fetch('/api/admin/departments?limit=5');
      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }
      const data = await response.json();
      return data.departments;
    },
    enabled: isOpen,
  });

  // Reset form when modal is opened/closed or populate with client data when editing
  useEffect(() => {
    if (!isOpen) {
      resetForm();
      return;
    }
    
    // If we're in edit mode and have client data, populate the form
    if (mode === 'update' && client) {
      console.log('Populating form with client data:', client);
      
      // Set basic client info
      setCompanyName(client.companyName || '');
      setCompanyUrl(client.companyUrl || '');
      
      // Set users if they exist
      if (client.users && Array.isArray(client.users)) {
        const formattedUsers = client.users.map((user: any) => ({
          _id: user._id || undefined, // Preserve existing user ID for updates
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          department: user.department ? {
            id: typeof user.department === 'object' ? user.department._id : user.department,
            name: typeof user.department === 'object' ? user.department.name : ''
          } : undefined,
          exceptions: {
            email: user.exceptions?.email || false,
            sms: user.exceptions?.sms || false
          },
          access: {
            billing: user.access?.billing || false,
            admin: user.access?.admin || false
          }
        }));
        setUsers(formattedUsers);
      }
      
      // Set departments if they exist in the client data
      if (client.departments && Array.isArray(client.departments)) {
        setDepartments(client.departments.map((dept: any) => ({
          _id: dept._id,
          name: dept.name
        })));
      }
      
      // Set assigned solution engineers
      if (client.assignedSolutionsEngineerIds && Array.isArray(client.assignedSolutionsEngineerIds)) {
        const seIds = client.assignedSolutionsEngineerIds.map((id: any) => 
          typeof id === 'object' && id._id ? id._id.toString() : id.toString()
        );
        setAssignedSEs(seIds);
      }
    }
  }, [isOpen, client, mode]);

  // Reset form to initial state
  const resetForm = () => {
    setCompanyName('');
    setCompanyUrl('');
    setDepartments([]);
    setDepartmentName('');
    setUsers([]);
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserDepartment('');
    setUserEmailException(false);
    setUserSmsException(false);
    setUserBillingAccess(false);
    setUserAdminAccess(false);
    setSelectedSE('');
    setAssignedSEs([]);
  };

  // Handle adding a department - creates it immediately in the database
  const handleAddDepartment = async () => {
    if (!departmentName.trim()) return;

    try {
      // Create department in the database
      const response = await fetch('/api/admin/departments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: departmentName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create department');
      }

      const data = await response.json();

      // Add the new department to local state so it's available in the Users dropdown
      setDepartments([...departments, { name: data.department.name }]);
      showToast(`Department "${departmentName.trim()}" created`, 'success');
      setDepartmentName('');

      // Refresh departments list
      queryClient.invalidateQueries({ queryKey: ['departments'] });
    } catch (error) {
      handleApiError(error);
    }
  };

  // Handle removing a department
  const handleRemoveDepartment = (index: number) => {
    setDepartments(departments.filter((_, i) => i !== index));
  };

  // Handle adding a user
  const handleAddUser = () => {
    if (!userName.trim() || !userEmail.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    // Check if user with same email already exists
    if (users.some(user => user.email.toLowerCase() === userEmail.trim().toLowerCase())) {
      showToast('User with this email already exists', 'error');
      return;
    }

    // Get department name from the selected department ID
    let departmentObj = undefined;
    if (userDepartment) {
      // Find the selected department in the options
      const selectedOption = queryClient.getQueryData<any>(['departments', ''])?.departments?.find(
        (dept: any) => dept._id === userDepartment
      );

      if (selectedOption) {
        departmentObj = {
          id: userDepartment,
          name: selectedOption.name
        };
      } else {
        // Fallback if we can't find the department name
        departmentObj = {
          id: userDepartment,
          name: 'Unknown Department'
        };
      }
      console.log(`Adding user with department: ${departmentObj.name} (${departmentObj.id})`);
    }

    // Create a new user with the form data
    const newUser: ClientUser = {
      name: userName.trim(),
      email: userEmail.trim().toLowerCase(),
      phone: userPhone.trim() || undefined,
      department: departmentObj, // Store both ID and name
      exceptions: {
        email: userEmailException,
        sms: userSmsException,
      },
      access: {
        billing: userBillingAccess,
        admin: userAdminAccess,
      },
    };

    setUsers([...users, newUser]);

    // Reset user form
    setUserName('');
    setUserEmail('');
    setUserPhone('');
    setUserDepartment('');
    setUserEmailException(false);
    setUserSmsException(false);
    setUserBillingAccess(false);
    setUserAdminAccess(false);
  };

  // Handle removing a user
  const handleRemoveUser = (index: number) => {
    setUsers(users.filter((_, i) => i !== index));
  };

  // Handle adding a solutions engineer
  const handleAddSE = () => {
    if (!selectedSE) return;

    // Check if SE is already assigned
    if (assignedSEs.includes(selectedSE)) {
      showToast('Solutions Engineer already assigned', 'error');
      return;
    }

    setAssignedSEs([...assignedSEs, selectedSE]);
    setSelectedSE('');
  };

  // Handle removing a solutions engineer
  const handleRemoveSE = (seId: string) => {
    setAssignedSEs(assignedSEs.filter(id => id !== seId));
  };

  // Check if a client name already exists
  const checkClientNameExists = async (name: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/admin/clients/check-name?name=${encodeURIComponent(name)}`);
      if (!response.ok) {
        // If the endpoint doesn't exist yet, we'll assume the name is unique
        if (response.status === 404) {
          return false;
        }
        throw new Error('Failed to check client name');
      }
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error('Error checking client name:', error);
      // In case of error, we'll let the backend validation handle it
      return false;
    }
  };

  // Check if any user emails already exist
  const checkUserEmailsExist = async (emails: string[]): Promise<string[]> => {
    try {
      const response = await fetch('/api/admin/users/check-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails }),
      });
      if (!response.ok) {
        // If the endpoint doesn't exist yet, we'll assume the emails are unique
        if (response.status === 404) {
          return [];
        }
        throw new Error('Failed to check user emails');
      }
      const data = await response.json();
      return data.existingEmails || [];
    } catch (error) {
      console.error('Error checking user emails:', error);
      // In case of error, we'll let the backend validation handle it
      return [];
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyName.trim()) {
      showToast('Company name is required', 'error');
      return;
    }

    if (!companyUrl.trim()) {
      showToast('Company URL is required', 'error');
      return;
    }

    // Check if client name already exists (only for new clients)
    if (mode === 'create' && await checkClientNameExists(companyName)) {
      showToast('A client with this name already exists', 'error');
      return;
    }

    // Check if any user emails already exist (only for new users)
    if (mode === 'create' || users.some(user => !user._id)) {
      const newUserEmails = users
        .filter(user => !user._id) // Only check emails for new users
        .map(user => user.email);
      
      if (newUserEmails.length > 0) {
        const existingEmails = await checkUserEmailsExist(newUserEmails);
        if (existingEmails.length > 0) {
          showToast(`The following emails already exist: ${existingEmails.join(', ')}`, 'error');
          return;
        }
      }
    }

    // Prepare client data
    const clientData = {
      companyName: companyName.trim(),
      companyUrl: companyUrl.trim(),
      status: 'ACTIVE',
      users: users.map(user => ({
        // Include _id for existing users to update them instead of creating new ones
        ...(user._id ? { _id: user._id } : {}),
        name: user.name,
        email: user.email,
        phone: user.phone,
        department: user.department?.id,
        exceptions: {
          email: user.exceptions?.email,
          sms: user.exceptions?.sms
        },
        access: {
          billing: user.access?.billing,
          admin: user.access?.admin
        }
      })),
      departments: departments.map(dept => ({
        _id: dept._id,
        name: dept.name
      })),
      assignedSolutionsEngineerIds: assignedSEs
    };

    try {
      let response;
      
      if (mode === 'create') {
        // Create client
        response = await fetch('/api/admin/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientData),
        });
      } else {
        // Update client
        response = await fetch(`/api/admin/clients/${client._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to ${mode === 'create' ? 'create' : 'update'} client`);
      }

      // Get the created/updated client
      const data = await response.json();
      console.log(`Client ${mode === 'create' ? 'created' : 'updated'} successfully:`, data);

      // Invalidate and refetch clients query to update the UI
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['solutionsEngineers'] });
      
      // Also invalidate the specific client query if updating
      if (mode === 'update' && client?._id) {
        queryClient.invalidateQueries({ queryKey: ['client', client._id] });
      }

      // Reset form
      resetForm();

      // Call success callback
      if (onSuccess) onSuccess();
      if (onClientAdded) onClientAdded();
      
      // Show success message
      showToast(`Client ${mode === 'create' ? 'created' : 'updated'} successfully`, 'success');
      
      // Close the modal
      onClose();
    } catch (error) {
      handleApiError(error, `Failed to ${mode === 'create' ? 'create' : 'update'} client`);
    }
  };

  // Search function for departments
  const searchDepartments = async (query: string): Promise<Option[]> => {
    try {
      // Use React Query to fetch and cache departments
      const result = await queryClient.fetchQuery({
        queryKey: ['departments', query],
        queryFn: async () => {
          const response = await fetch(`/api/admin/departments?q=${encodeURIComponent(query)}&limit=5`);
          if (!response.ok) {
            throw new Error('Failed to fetch departments');
          }
          return response.json();
        },
        staleTime: 30000, // 30 seconds
      });

      // Map API response to options format - use department ID as value
      return result.departments.map((dept: any) => ({
        value: dept._id, // Use the department ID as the value
        label: dept.clientCount ? `${dept.name} (${dept.clientCount} clients)` : dept.name
      }));
    } catch (error) {
      console.error('Error searching departments:', error);

      // Fallback to local filtering if API fails
      if (dbDepartments && dbDepartments.length > 0) {
        return dbDepartments
          .filter((dept: any) => dept.name.toLowerCase().includes(query.toLowerCase()))
          .map((dept: any) => ({
            value: dept._id,
            label: dept.name
          }));
      }

      return [];
    }
  };

  const searchSolutionsEngineers = async (query: string): Promise<Option[]> => {
    try {
      // Use React Query to fetch and cache solutions engineers
      const result = await queryClient.fetchQuery({
        queryKey: ['solutionsEngineers', query],
        queryFn: async () => {
          // If query is empty and we have cached data, use it
          if (!query.trim() && solutionsEngineers && solutionsEngineers.length > 0) {
            return { users: solutionsEngineers };
          }

          const response = await fetch(`/api/admin/solutions-engineers/search?q=${encodeURIComponent(query)}&limit=5`);
          if (!response.ok) {
            throw new Error('Failed to fetch solutions engineers');
          }
          return response.json();
        },
        staleTime: 30000, // 30 seconds
      });

      // Map API response to options format
      return result.users.map((se: any) => ({
        value: se._id,
        label: `${se.name} (${se.email})`
      }));
    } catch (error) {
      console.error('Error searching solutions engineers:', error);

      // Fallback to local filtering if API fails
      if (solutionsEngineers && solutionsEngineers.length > 0) {
        return solutionsEngineers
          .filter(se =>
            se.name.toLowerCase().includes(query.toLowerCase()) ||
            se.email.toLowerCase().includes(query.toLowerCase())
          )
          .map(se => ({
            value: se._id,
            label: `${se.name} (${se.email})`
          }));
      }

      return [];
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add New Client' : 'Edit Client'}
      maxWidth="6xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information Section */}
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm font-medium mb-1">
                  Company Name <span className="text-error">*</span>
                </label>
                <input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="companyUrl" className="block text-sm font-medium mb-1">
                  Company URL <span className="text-error">*</span>
                </label>
                <input
                  id="companyUrl"
                  type="url"
                  value={companyUrl}
                  onChange={(e) => setCompanyUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary"
                />
              </div>
            </div>

            <div>
              {/* Create Departments */}
              <div className="mb-6">
                <div className="bg-darkerBackground p-6 rounded">
                <h4 className="text-md font-medium mb-2">Create Departments</h4>
                <p className="text-sm text-textSecondary mb-4">Departments created here will be immediately available for selection in the Users section below.</p>
                  <input
                    type="text"
                    value={departmentName}
                    onChange={(e) => setDepartmentName(e.target.value)}
                    className="w-full px-3 py-2 border border-buttonBorder rounded focus:outline-none focus:ring-1 focus:ring-buttonPrimary mb-4"
                    placeholder="Department name"
                  />
                  <button
                    type="button"
                    onClick={handleAddDepartment}
                    className="w-full flex items-center justify-center px-4 py-2 border border-buttonBorder bg-white rounded hover:bg-darkerBackground transition-colors duration-200"
                  >
                    <span className="mr-1">+</span>
                    Create Department
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Section */}
        <div>
          <h4 className="text-md font-medium mb-2">Add Users</h4>

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
                <SearchableSelect
                  value={userDepartment}
                  onChange={setUserDepartment}
                  onSearch={searchDepartments}
                  placeholder="Select Department"
                  emptyMessage="No departments found"
                  initialOptions={dbDepartments ? dbDepartments.map((dept: any) => ({
                    value: dept.name,
                    label: dept.name
                  })) : []}
                />
              </div>
              <div className="flex flex-col space-y-1 ml-2 justify-center">
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
              <div className="flex flex-col space-y-1 ml-2 justify-center">
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
            {/* Users List */}
            {users.length > 0 && (
              <div className="ml-3">
                {users.map((user, index) => (
                  <div key={index} className="grid grid-cols-6 gap-2 p-2 border-b border-buttonBorder last:border-b-0">
                    <div>{user.name}</div>
                    <div>{user.email}</div>
                    <div>{user.phone || '-'}</div>
                    <div>{user.department ? user.department.name : '-'}</div>
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
              <SearchableSelect
                value={selectedSE}
                onChange={setSelectedSE}
                onSearch={searchSolutionsEngineers}
                placeholder="Search by name or email"
                emptyMessage="No solutions engineers found"
                initialOptions={solutionsEngineers?.map(se => ({
                  value: se._id,
                  label: `${se.name} (${se.email})`
                })) || []}
              />
            </div>
            <div>
              {selectedSE && solutionsEngineers?.find(se => se._id === selectedSE)?.email || 'email@example.com'}
            </div>
            <div>
            </div>
          </div>

          {/* SE List */}
          {assignedSEs.length > 0 && (
            <div className="ml-3">
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
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-buttonBorder">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-buttonBorder rounded hover:bg-darkerBackground transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-buttonPrimary text-white rounded hover:bg-buttonPrimaryHover transition-colors duration-200"
          >
            {mode === 'create' ? 'Add Client' : 'Update Client'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddClientModal;
