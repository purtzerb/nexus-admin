import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import ClientSubscription from '@/models/ClientSubscription';
import Client from '@/models/Client';
import SubscriptionPlan from '@/models/SubscriptionPlan';

// PUT /api/admin/client-subscriptions/:id - Update a client subscription
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

    const id = params.id;
    const data = await req.json();

    // Verify client subscription exists
    const subscription = await ClientSubscription.findById(id);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Client subscription not found' },
        { status: 404 }
      );
    }

    // Update subscription fields
    if (data.subscriptionPlanId) {
      // Verify subscription plan exists
      const plan = await SubscriptionPlan.findById(data.subscriptionPlanId);
      if (!plan) {
        return NextResponse.json(
          { error: 'Subscription plan not found' },
          { status: 404 }
        );
      }
      subscription.subscriptionPlanId = data.subscriptionPlanId;
    }

    if (data.startDate) subscription.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) subscription.endDate = data.endDate ? new Date(data.endDate) : undefined;
    if (data.status) subscription.status = data.status;

    await subscription.save();

    return NextResponse.json({
      message: 'Client subscription updated successfully',
      subscription
    });
  } catch (error) {
    console.error('Error updating client subscription:', error);
    return NextResponse.json(
      { error: 'Failed to update client subscription' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/client-subscriptions/:id - Delete a client subscription
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

    const id = params.id;

    // Verify client subscription exists
    const subscription = await ClientSubscription.findById(id);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Client subscription not found' },
        { status: 404 }
      );
    }

    // Delete the subscription
    await ClientSubscription.findByIdAndDelete(id);

    // Update activeSubscriptionId for ALL clients that have this subscription as their active subscription
    const updatedClients = await Client.updateMany(
      { activeSubscriptionId: id },
      { $unset: { activeSubscriptionId: 1 } }
    );

    console.log(`Updated ${updatedClients.modifiedCount} clients to remove the deleted subscription reference`);

    return NextResponse.json({
      message: 'Client subscription deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting client subscription:', error);
    return NextResponse.json(
      { error: 'Failed to delete client subscription' },
      { status: 500 }
    );
  }
}
