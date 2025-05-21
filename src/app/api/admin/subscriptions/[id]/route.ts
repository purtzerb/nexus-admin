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

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }

    // Find the subscription
    const subscription = await SubscriptionPlan.findById(id).lean();

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Count clients using this subscription
    const Client = mongoose.connection.collection('clients');
    const clientCount = await Client.countDocuments({
      subscriptionId: id
    });

    return NextResponse.json({
      subscription: {
        ...subscription,
        clientCount
      }
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plan' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;
    const data = await req.json();

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    // Check if the subscription exists
    const Subscription = mongoose.connection.collection('subscriptions');
    const existingSubscription = await Subscription.findOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Check if another subscription with the same name exists (excluding this one)
    const duplicateNameSubscription = await SubscriptionPlan.findOne({
      name: data.name,
      _id: { $ne: id }
    });

    if (duplicateNameSubscription) {
      return NextResponse.json(
        { error: 'Another subscription plan with this name already exists' },
        { status: 400 }
      );
    }

    // Update subscription
    const updatedSubscription = {
      name: data.name,
      pricingModel: mapPricingModel(data.pricingModel || 'Fixed'),
      contractLengthMonths: data.contractLength || 12,
      billingCadence: mapBillingCadence(data.billingCadence || 'Monthly'),
      setupFee: data.setupFee || 0,
      prepaymentPercentage: data.prepaymentPercentage || 0,
      capAmount: data.cap || 0,
      overageCost: data.overageCost || 0
    };

    await SubscriptionPlan.findByIdAndUpdate(id, updatedSubscription, { new: true });

    return NextResponse.json({
      message: 'Subscription plan updated successfully',
      subscription: {
        ...updatedSubscription,
        _id: id
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update subscription plan' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid subscription ID' },
        { status: 400 }
      );
    }

    // Check if the subscription exists
    const Subscription = mongoose.connection.collection('subscriptions');
    const existingSubscription = await Subscription.findOne({
      _id: new mongoose.Types.ObjectId(id)
    });

    if (!existingSubscription) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Check if any clients are using this subscription
    const Client = mongoose.connection.collection('clients');
    const clientsUsingSubscription = await Client.countDocuments({
      subscriptionId: id
    });

    if (clientsUsingSubscription > 0) {
      // We'll allow deletion but provide a warning in the response
      // The frontend should handle this by showing a confirmation dialog
      console.warn(`Deleting subscription ${id} that is used by ${clientsUsingSubscription} clients`);
    }

    // Delete the subscription
    await SubscriptionPlan.findByIdAndDelete(id);

    return NextResponse.json({
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete subscription plan' },
      { status: 500 }
    );
  }
}
