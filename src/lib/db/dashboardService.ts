import axios from 'axios';

export interface ClientDashboardData {
  _id: string;
  companyName: string;
  contractStart: string | null;
  workflowCount: number;
  nodeCount: number;
  executionCount: number;
  exceptionCount: number;
  revenue: number;
  timeSaved: number;
  moneySaved: number;
}

export interface DashboardSummary {
  totalWorkflows: number;
  totalWorkflowsChange: number;
  totalExceptions: number;
  totalExceptionsChange: number;
  totalClients: number;
  timeSaved: number;
  timeSavedChange: number;
  totalRevenue: number;
  totalRevenueChange: number;
}

export interface DashboardSummary {
  totalWorkflows: number;
  totalWorkflowsChange: number;
  totalExceptions: number;
  totalExceptionsChange: number;
  totalClients: number;
  timeSaved: number;
  timeSavedChange: number;
  totalRevenue: number;
  totalRevenueChange: number;
  timespan: string;
}

export type TimespanOption = 'last7days' | 'last30days' | 'mtd' | 'qtd' | 'ytd' | 'ltd';
export type SortField = 'companyName' | 'contractStart' | 'workflowCount' | 'nodeCount' | 'executionCount' | 'exceptionCount' | 'revenue' | 'timeSaved' | 'moneySaved';
export type SortOrder = 'asc' | 'desc';

export interface DashboardParams {
  timespan?: TimespanOption;
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export const getDashboardSummary = async (timespan: TimespanOption = 'last30days'): Promise<DashboardSummary> => {
  try {
    const response = await axios.get('/api/admin/dashboard/summary', {
      params: { timespan }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard summary data:', error);
    throw error;
  }
};

export interface ClientsResponse {
  clients: ClientDashboardData[];
  timespan: string;
}

export const getDashboardClients = async (params: DashboardParams = {}): Promise<ClientsResponse> => {
  const { timespan = 'last30days', sortBy = 'revenue', sortOrder = 'desc' } = params;
  
  try {
    const response = await axios.get('/api/admin/dashboard/clients', {
      params: {
        timespan,
        sortBy,
        sortOrder
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard clients data:', error);
    throw error;
  }
};

// Utility functions for the dashboard
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  
  if (hours < 24) {
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (remainingHours === 0) {
    return `${days}d`;
  }
  
  return `${days}d ${remainingHours}h`;
};

export const formatPercentage = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
};

export const timespanOptions = [
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'mtd', label: 'Month to Date' },
  { value: 'qtd', label: 'Quarter to Date' },
  { value: 'ytd', label: 'Year to Date' },
  { value: 'ltd', label: 'All Time' }
];

export const sortOptions = [
  { value: 'companyName', label: 'Client Name' },
  { value: 'contractStart', label: 'Contract Start Date' },
  { value: 'workflowCount', label: 'Workflow Count' },
  { value: 'nodeCount', label: 'Node Count' },
  { value: 'executionCount', label: 'Execution Count' },
  { value: 'exceptionCount', label: 'Exception Count' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'timeSaved', label: 'Time Saved' },
  { value: 'moneySaved', label: 'Money Saved' }
];
