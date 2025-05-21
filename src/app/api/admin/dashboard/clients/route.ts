import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import dbConnect from '@/lib/db/db';
import { Client, Workflow, WorkflowExecution, WorkflowException, Invoice, ClientSubscription, WorkflowNode } from '@/models';
import { Types } from 'mongoose';

// Force dynamic rendering to ensure all HTTP methods are handled correctly
export const dynamic = 'force-dynamic';

// Helper function to get date range based on timespan
const getDateRange = (timespan: string): { startDate: Date, endDate: Date } => {
  const endDate = new Date();
  let startDate = new Date();
  
  switch(timespan) {
    case 'last7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case 'last30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case 'mtd': // Month to date
      startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
      break;
    case 'qtd': // Quarter to date
      const quarter = Math.floor(endDate.getMonth() / 3);
      startDate = new Date(endDate.getFullYear(), quarter * 3, 1);
      break;
    case 'ytd': // Year to date
      startDate = new Date(endDate.getFullYear(), 0, 1);
      break;
    case 'ltd': // Lifetime to date (all time)
      startDate = new Date(1970, 0, 1);
      break;
    default:
      startDate.setDate(endDate.getDate() - 30); // Default to last 30 days
  }
  
  return { startDate, endDate };
};

export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Authenticate the request
    const user = await getAuthUser(req);
    
    if (!user) {
      return unauthorizedResponse();
    }
    
    // Check if user has admin role
    if (!hasRequiredRole(user, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }
    
    // Parse query parameters
    const url = new URL(req.url);
    const timespan = url.searchParams.get('timespan') || 'last30days';
    const sortBy = url.searchParams.get('sortBy') || 'revenue';
    const sortOrder = url.searchParams.get('sortOrder') || 'desc';
    
    // Get date range based on timespan
    const { startDate, endDate } = getDateRange(timespan);
    
    // First, get all active clients 
    const activeClients = await Client.find({ status: 'ACTIVE' }).lean();
    
    // Define an interface for client dashboard data
    interface ClientData {
      _id: any; // Using any to avoid type issues with MongoDB ObjectIds
      companyName: string;
      contractStart: Date | null;
      workflowCount: number;
      nodeCount: number;
      executionCount: number;
      exceptionCount: number;
      revenue: number;
      timeSaved: number;
      moneySaved: number;
      [key: string]: any; // Index signature for sortBy dynamic access
    }
    
    // Create a map to quickly identify clients by ID
    const clientMap = new Map<string, ClientData>();
    activeClients.forEach(client => {
      if (client._id) {
        clientMap.set(client._id.toString(), {
          _id: client._id,
          companyName: client.companyName || 'Unknown Client',
          contractStart: null,
          workflowCount: 0,
          nodeCount: 0,
          executionCount: 0,
          exceptionCount: 0,
          revenue: 0,
          timeSaved: 0,
          moneySaved: 0
        });
      }
    });
    
    // Get workflow data
    const workflowData = await Workflow.aggregate([
      {
        $match: { status: 'ACTIVE' }
      },
      {
        $group: {
          _id: '$clientId',
          workflowCount: { $sum: 1 }
        }
      }
    ]);
    
    // Add workflow counts to clients
    workflowData.forEach(data => {
      const clientId = data._id?.toString();
      if (clientId && clientMap.has(clientId)) {
        const client = clientMap.get(clientId);
        if (client) {
          client.workflowCount = data.workflowCount || 0;
        }
      }
    });
    
    // Get node data
    const nodeData = await WorkflowNode.aggregate([
      {
        $match: { status: 'ACTIVE' }
      },
      {
        $group: {
          _id: '$clientId',
          nodeCount: { $sum: 1 }
        }
      }
    ]);
    
    // Add node counts to clients
    nodeData.forEach(data => {
      const clientId = data._id?.toString();
      if (clientId && clientMap.has(clientId)) {
        const client = clientMap.get(clientId);
        if (client) {
          client.nodeCount = data.nodeCount || 0;
        }
      }
    });
    
    // Get execution data for the selected time period
    const executionData = await WorkflowExecution.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$clientId',
          executionCount: { $sum: 1 }
        }
      }
    ]);
    
    // Add execution counts to clients
    executionData.forEach(data => {
      const clientId = data._id?.toString();
      if (clientId && clientMap.has(clientId)) {
        const client = clientMap.get(clientId);
        if (client) {
          client.executionCount = data.executionCount || 0;
        }
      }
    });
    
    // Get exception data for the selected time period
    const exceptionData = await WorkflowException.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$clientId',
          exceptionCount: { $sum: 1 }
        }
      }
    ]);
    
    // Add exception counts to clients
    exceptionData.forEach(data => {
      const clientId = data._id?.toString();
      if (clientId && clientMap.has(clientId)) {
        const client = clientMap.get(clientId);
        if (client) {
          client.exceptionCount = data.exceptionCount || 0;
        }
      }
    });
    
    // Get revenue data from invoices for the selected time period
    const revenueData = await Invoice.aggregate([
      {
        $match: {
          status: 'PAID',
          invoiceDate: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$clientId',
          revenue: { $sum: '$amountBilled' }
        }
      }
    ]);
    
    // Add revenue to clients
    revenueData.forEach(data => {
      const clientId = data._id?.toString();
      if (clientId && clientMap.has(clientId)) {
        const client = clientMap.get(clientId);
        if (client) {
          client.revenue = data.revenue || 0;
        }
      }
    });
    
    // Get time saved and money saved data
    const timeAndMoneySavedData = await WorkflowExecution.aggregate([
      {
        $match: {
          status: 'SUCCESS',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $lookup: {
          from: 'workflows',
          localField: 'workflowId',
          foreignField: '_id',
          as: 'workflow'
        }
      },
      {
        $unwind: {
          path: '$workflow',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $group: {
          _id: '$clientId',
          timeSaved: { $sum: { $ifNull: ['$workflow.timeSavedPerExecution', 0] } },
          moneySaved: { $sum: { $ifNull: ['$workflow.moneySavedPerExecution', 0] } }
        }
      }
    ]);
    
    // Add time and money saved to clients
    timeAndMoneySavedData.forEach(data => {
      const clientId = data._id?.toString();
      if (clientId && clientMap.has(clientId)) {
        const client = clientMap.get(clientId);
        if (client) {
          client.timeSaved = data.timeSaved || 0;
          client.moneySaved = data.moneySaved || 0;
        }
      }
    });
    
    // Get contract start dates
    const subscriptionData = await ClientSubscription.aggregate([
      {
        $group: {
          _id: '$clientId',
          contractStart: { $min: '$startDate' }
        }
      }
    ]);
    
    // Add contract start dates to clients
    subscriptionData.forEach(data => {
      const clientId = data._id?.toString();
      if (clientId && clientMap.has(clientId)) {
        const client = clientMap.get(clientId);
        if (client) {
          client.contractStart = data.contractStart || null;
        }
      }
    });
    
    // Convert the map to an array
    let clientsData = Array.from(clientMap.values());
    
    // Ensure all clients have a contract start date
    clientsData.forEach(client => {
      if (!client.contractStart) {
        // Set a default date for clients without a contract start
        client.contractStart = new Date(2025, 0, 1); // January 1, 2025 as a default
      }
    });
    
    // Sort the client data
    const sortMultiplier = sortOrder === 'asc' ? 1 : -1;
    clientsData.sort((a, b) => {
      if (sortBy === 'companyName') {
        // String comparison for company name
        return a.companyName.localeCompare(b.companyName) * sortMultiplier;
      } else if (sortBy === 'contractStart') {
        // Date comparison - handle case where one date might be null
        const dateA = a.contractStart ? new Date(a.contractStart).getTime() : 0;
        const dateB = b.contractStart ? new Date(b.contractStart).getTime() : 0;
        return (dateA - dateB) * sortMultiplier;
      } else {
        // Numeric comparison for other fields
        const valueA = a[sortBy] !== undefined ? a[sortBy] : 0;
        const valueB = b[sortBy] !== undefined ? b[sortBy] : 0;
        return (valueA - valueB) * sortMultiplier;
      }
    });
    
    return NextResponse.json({
      clients: clientsData,
      timespan
    });
  } catch (error) {
    console.error('Error fetching client dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client dashboard data' },
      { status: 500 }
    );
  }
}
