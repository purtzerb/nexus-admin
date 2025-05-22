import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import dbConnect from '@/lib/db/db';
import { Client, Workflow, WorkflowExecution, WorkflowException, Invoice } from '@/models';
import mongoose from 'mongoose';

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
    
    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }
    
    // For Solutions Engineers, we need their assigned client IDs
    const isSE = user.role === 'SOLUTIONS_ENGINEER';
    const assignedClientIds = isSE && Array.isArray(user.assignedClientIds) ? 
      user.assignedClientIds.map((id: string) => new mongoose.Types.ObjectId(id)) : null;
    
    // Parse query parameters
    const url = new URL(req.url);
    const timespan = url.searchParams.get('timespan') || 'last30days';
    
    // Get date range based on timespan
    const { startDate, endDate } = getDateRange(timespan);
    
    // Build client filter for SE users
    const clientFilter = isSE && assignedClientIds ? 
      { _id: { $in: assignedClientIds } } : 
      { status: 'ACTIVE' };

    // Get client IDs (either all active clients for admins, or assigned clients for SEs)
    const clients = await Client.find(clientFilter).lean();
    const clientIds = clients.map(client => client._id);

    // Aggregate data for summary statistics
    const [
      totalWorkflows,
      totalExceptions,
      totalExecutions,
      totalClients,
      totalRevenue,
      timeSaved
    ] = await Promise.all([
      // Total workflows for the user's clients
      Workflow.countDocuments({ 
        status: 'ACTIVE',
        ...(isSE && { clientId: { $in: clientIds } })
      }),
      
      // Total exceptions in the time period for the user's clients
      WorkflowException.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        ...(isSE && { clientId: { $in: clientIds } })
      }),
      
      // Total executions in the time period for the user's clients
      WorkflowExecution.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate },
        ...(isSE && { clientId: { $in: clientIds } })
      }),
      
      // Total active clients (for admin) or assigned clients (for SE)
      Promise.resolve(clients.length),
      
      // Total revenue from paid invoices in the time period for the user's clients
      Invoice.aggregate([
        {
          $match: {
            status: 'PAID',
            invoiceDate: { $gte: startDate, $lte: endDate },
            ...(isSE && { clientId: { $in: clientIds } })
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amountBilled' }
          }
        }
      ]).then(result => result.length > 0 ? result[0].total : 0),
      
      // Calculate time saved based on executions and workflow time saved per execution for the user's clients
      WorkflowExecution.aggregate([
        {
          $match: {
            status: 'SUCCESS',
            createdAt: { $gte: startDate, $lte: endDate },
            ...(isSE && { clientId: { $in: clientIds } })
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
            _id: null,
            totalTimeSaved: {
              $sum: { $ifNull: ['$workflow.timeSavedPerExecution', 0] }
            }
          }
        }
      ]).then(result => result.length > 0 ? result[0].totalTimeSaved : 0)
    ]);
    
    // Calculate previous period metrics for comparison
    const prevPeriodEndDate = new Date(startDate);
    const prevPeriodStartDate = new Date(startDate);
    const periodDuration = endDate.getTime() - startDate.getTime();
    prevPeriodStartDate.setTime(prevPeriodStartDate.getTime() - periodDuration);
    
    const [
      prevPeriodWorkflows,
      prevPeriodExceptions,
      prevPeriodRevenue,
      prevPeriodTimeSaved
    ] = await Promise.all([
      // Previous period workflows for the user's clients
      Workflow.countDocuments({ 
        status: 'ACTIVE',
        createdAt: { $lt: startDate },
        ...(isSE && { clientId: { $in: clientIds } })
      }),
      
      // Previous period exceptions for the user's clients
      WorkflowException.countDocuments({
        createdAt: { $gte: prevPeriodStartDate, $lt: startDate },
        ...(isSE && { clientId: { $in: clientIds } })
      }),
      
      // Previous period revenue for the user's clients
      Invoice.aggregate([
        {
          $match: {
            status: 'PAID',
            invoiceDate: { $gte: prevPeriodStartDate, $lt: startDate },
            ...(isSE && { clientId: { $in: clientIds } })
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amountBilled' }
          }
        }
      ]).then(result => result.length > 0 ? result[0].total : 0),
      
      // Previous period time saved for the user's clients
      WorkflowExecution.aggregate([
        {
          $match: {
            status: 'SUCCESS',
            createdAt: { $gte: prevPeriodStartDate, $lt: startDate },
            ...(isSE && { clientId: { $in: clientIds } })
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
            _id: null,
            totalTimeSaved: {
              $sum: { $ifNull: ['$workflow.timeSavedPerExecution', 0] }
            }
          }
        }
      ]).then(result => result.length > 0 ? result[0].totalTimeSaved : 0)
    ]);
    
    // Calculate percentage changes
    const calculatePercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };
    
    const workflowsChange = calculatePercentageChange(totalWorkflows, prevPeriodWorkflows);
    const exceptionsChange = calculatePercentageChange(totalExceptions, prevPeriodExceptions);
    const revenueChange = calculatePercentageChange(totalRevenue, prevPeriodRevenue);
    const timeSavedChange = calculatePercentageChange(timeSaved, prevPeriodTimeSaved);
    
    return NextResponse.json({
      totalWorkflows,
      totalWorkflowsChange: workflowsChange,
      totalExceptions,
      totalExceptionsChange: exceptionsChange,
      totalClients,
      timeSaved,
      timeSavedChange: timeSavedChange,
      totalRevenue,
      totalRevenueChange: revenueChange,
      timespan
    });
  } catch (error) {
    console.error('Error fetching dashboard summary data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard summary data' },
      { status: 500 }
    );
  }
}
