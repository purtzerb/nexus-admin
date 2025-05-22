import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import { SubscriptionPlan, ClientSubscription } from '@/models/index';
import mongoose from 'mongoose';

// GET /api/admin/subscription-plans - Get all subscription plans
export async function GET(req: NextRequest) {
  try {
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

    // Get all subscription plans
    const plans = await SubscriptionPlan.find({}).sort({ name: 1 }).lean();

    // For SE users, only show plans used by their assigned clients
    if (user.role === 'SOLUTIONS_ENGINEER') {
      // If SE has no assigned clients, return empty array
      if (!user.assignedClientIds || user.assignedClientIds.length === 0) {
        return NextResponse.json({ plans: [] });
      }

      // Get subscriptions for assigned clients
      const clientSubscriptions = await ClientSubscription.find({
        clientId: { $in: user.assignedClientIds }
      }).lean();

      // Get plan IDs used by assigned clients
      const assignedPlanIds = clientSubscriptions.map(sub => 
        sub.subscriptionPlanId.toString()
      );

      // Filter plans to only include those used by assigned clients
      const filteredPlans = plans.filter(plan => 
        assignedPlanIds.includes((plan._id as mongoose.Types.ObjectId).toString())
      );

      // Count clients using each plan (only for assigned clients)
      const planIds = filteredPlans.map(plan => plan._id);
      const subscriptionCounts = await ClientSubscription.aggregate([
        { 
          $match: { 
            subscriptionPlanId: { $in: planIds },
            clientId: { $in: user.assignedClientIds.map(id => new mongoose.Types.ObjectId(id)) }
          } 
        },
        { $group: { _id: '$subscriptionPlanId', count: { $sum: 1 } } }
      ]);

      // Create a map of plan IDs to client counts
      const countMap = subscriptionCounts.reduce((map, item) => {
        map[item._id.toString()] = item.count;
        return map;
      }, {} as Record<string, number>);

      // Add client count to each plan
      const plansWithClientCount = filteredPlans.map(plan => ({
        ...plan,
        clientCount: countMap[(plan._id as mongoose.Types.ObjectId).toString()] || 0
      }));

      return NextResponse.json({ plans: plansWithClientCount });
    } 
    // For admin users, show all plans with client counts
    else {
      // Count clients using each plan
      const planIds = plans.map(plan => plan._id);
      const subscriptionCounts = await ClientSubscription.aggregate([
        { $match: { subscriptionPlanId: { $in: planIds } } },
        { $group: { _id: '$subscriptionPlanId', count: { $sum: 1 } } }
      ]);

      // Create a map of plan IDs to client counts
      const countMap = subscriptionCounts.reduce((map, item) => {
        map[item._id.toString()] = item.count;
        return map;
      }, {} as Record<string, number>);

      // Add client count to each plan
      const plansWithClientCount = plans.map(plan => ({
        ...plan,
        clientCount: countMap[(plan._id as mongoose.Types.ObjectId).toString()] || 0
      }));

      return NextResponse.json({ plans: plansWithClientCount });
    }
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
