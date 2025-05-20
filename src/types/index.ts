export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';
  phone?: string;
  
  // Solutions Engineer specific fields
  costRate?: number;
  billRate?: number;
  assignedClientIds?: string[];
  
  // Client User specific fields
  clientId?: string;
  departmentId?: string;
  notifyByEmailForExceptions?: boolean;
  notifyBySmsForExceptions?: boolean;
  hasBillingAccess?: boolean;
  isClientAdmin?: boolean;
  clientUserNotes?: string;
}

export interface Client {
  _id: string;
  name: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  assignedSolutionsEngineerIds?: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  _id: string;
  name: string;
  clientId: string;
  description?: string;
}

export interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'SOLUTIONS_ENGINEER' | 'CLIENT_USER';
    isClientAdmin?: boolean;
    clientId?: string;
  };
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status?: number;
}
