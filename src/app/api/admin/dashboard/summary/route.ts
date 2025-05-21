import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import dbConnect from '@/lib/db/db';
import { Client, Workflow, WorkflowExecution, WorkflowException, Invoice } from '@/models';

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
    
    // Get date range based on timespan
    const { startDate, endDate } = getDateRange(timespan);
    
    // Aggregate data for summary statistics
    const [
      totalWorkflows,
      totalExceptions,
      totalExecutions,
      totalClients,
      totalRevenue,
      timeSaved
    ] = await Promise.all([
      // Total workflows
      Workflow.countDocuments({ status: 'ACTIVE' }),
      
      // Total exceptions in the time period
      WorkflowException.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      // Total executions in the time period
      WorkflowExecution.countDocuments({
        createdAt: { $gte: startDate, $lte: endDate }
      }),
      
      // Total active clients
      Client.countDocuments({ status: 'ACTIVE' }),
      
      // Total revenue from paid invoices in the time period
      Invoice.aggregate([
        {
          $match: {
            status: 'PAID',
            invoiceDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amountBilled' }
          }
        }
      ]).then(result => result.length > 0 ? result[0].total : 0),
      
      // Calculate time saved based on executions and workflow time saved per execution
      WorkflowExecution.aggregate([
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
      // Previous period workflows
      Workflow.countDocuments({ 
        status: 'ACTIVE',
        createdAt: { $lt: startDate }
      }),
      
      // Previous period exceptions
      WorkflowException.countDocuments({
        createdAt: { $gte: prevPeriodStartDate, $lt: startDate }
      }),
      
      // Previous period revenue
      Invoice.aggregate([
        {
          $match: {
            status: 'PAID',
            invoiceDate: { $gte: prevPeriodStartDate, $lt: startDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amountBilled' }
          }
        }
      ]).then(result => result.length > 0 ? result[0].total : 0),
      
      // Previous period time saved
      WorkflowExecution.aggregate([
        {
          $match: {
            status: 'SUCCESS',
            createdAt: { $gte: prevPeriodStartDate, $lt: startDate }
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
