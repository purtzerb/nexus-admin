import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import mongoose from 'mongoose';
import SubscriptionPlan, { ISubscriptionPlan } from '@/models/SubscriptionPlan';

// Helper functions to map frontend values to database enum values
function mapPricingModel(model: string): 'CONSUMPTION' | 'FIXED' | 'TIERED_USAGE' | 'PER_SEAT' {
  const modelMap: Record<string, 'CONSUMPTION' | 'FIXED' | 'TIERED_USAGE' | 'PER_SEAT'> = {
    'Fixed': 'FIXED',
    'Tiered': 'TIERED_USAGE',
    'Usage': 'CONSUMPTION',
    'Per Seat': 'PER_SEAT'
  };
  return modelMap[model] || 'FIXED';
}

function mapBillingCadence(cadence: string): 'MONTHLY' | 'QUARTERLY' | 'YEARLY' {
  const cadenceMap: Record<string, 'MONTHLY' | 'QUARTERLY' | 'YEARLY'> = {
    'Monthly': 'MONTHLY',
    'Quarterly': 'QUARTERLY',
    'Annually': 'YEARLY'
  };
  return cadenceMap[cadence] || 'MONTHLY';
}

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
    const subscriptions = await SubscriptionPlan.find({}).lean();
    
    // For each subscription, count how many clients are using it
    const Client = mongoose.connection.collection('clients');
    const subscriptionsWithClientCount = await Promise.all(
      subscriptions.map(async (subscription) => {
        const clientCount = await Client.countDocuments({
          subscriptionId: subscription._id ? subscription._id.toString() : ''
        });
        
        return {
          ...subscription,
          clientCount
        };
      })
    );

    return NextResponse.json({ subscriptions: subscriptionsWithClientCount });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
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

    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if a subscription with the same name already exists
    const existingSubscription = await SubscriptionPlan.findOne({
      name: data.name
    });

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'A subscription plan with this name already exists' },
        { status: 400 }
      );
    }

    // Map the frontend model to the database model
    const subscription = new SubscriptionPlan({
      name: data.name,
      pricingModel: mapPricingModel(data.pricingModel || 'Fixed'),
      contractLengthMonths: data.contractLength || 12,
      billingCadence: mapBillingCadence(data.billingCadence || 'Monthly'),
      setupFee: data.setupFee || 0,
      prepaymentPercentage: data.prepaymentPercentage || 0,
      capAmount: data.cap || 0,
      overageCost: data.overageCost || 0
    });

    // Save the new subscription plan
    await subscription.save();

    return NextResponse.json({
      message: 'Subscription plan created successfully',
      subscription: subscription
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription plan' },
      { status: 500 }
    );
  }
}
