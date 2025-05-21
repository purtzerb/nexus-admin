import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import SubscriptionPlan, { ISubscriptionPlan } from '@/models/SubscriptionPlan';
import ClientSubscription from '@/models/ClientSubscription';
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

    // Check if user has admin role
    if (!hasRequiredRole(user, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }

    // Get all subscription plans
    const plans = await SubscriptionPlan.find({}).sort({ name: 1 }).lean();

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
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
