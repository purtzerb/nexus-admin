import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import ClientSubscription from '@/models/ClientSubscription';
import Client from '@/models/Client';
import SubscriptionPlan from '@/models/SubscriptionPlan';
import { Types } from 'mongoose';

// GET /api/admin/client-subscriptions - Get client subscriptions with pagination and search
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

    // Parse query parameters
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search') || '';
    const clientId = url.searchParams.get('clientId') || '';
    
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery: any = {};
    
    // Filter by clientId if provided
    if (clientId) {
      searchQuery.clientId = clientId;
      console.log('Filtering subscriptions by clientId:', clientId);
    }
    if (search && !clientId) {
      // First, find clients matching the search term
      const clients = await Client.find({
        companyName: { $regex: search, $options: 'i' }
      }, { _id: 1 }).lean();
      
      const clientIds = clients.map(client => client._id);
      
      // Then use those client IDs to filter subscriptions
      if (clientIds.length > 0) {
        searchQuery.clientId = { $in: clientIds };
      } else {
        // If no clients match, return empty result
        return NextResponse.json({ 
          subscriptions: [],
          totalCount: 0,
          page,
          totalPages: 0
        });
      }
    }

    // Get total count for pagination
    const totalCount = await ClientSubscription.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalCount / limit);

    // Get client subscriptions with pagination
    const subscriptions = await ClientSubscription.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Get client and subscription plan details
    const clientIds = [...new Set(subscriptions.map(sub => sub.clientId))];
    const planIds = [...new Set(subscriptions.map(sub => sub.subscriptionPlanId))];

    // Get client and plan details in parallel
    const [clients, plans] = await Promise.all([
      Client.find({ _id: { $in: clientIds } }, { _id: 1, companyName: 1 }).lean(),
      SubscriptionPlan.find({ _id: { $in: planIds } }, { _id: 1, name: 1 }).lean()
    ]);

    // Create maps for quick lookup
    const clientMap = clients.reduce((map, client) => {
      map[(client._id as Types.ObjectId).toString()] = client.companyName;
      return map;
    }, {} as Record<string, string>);

    const planMap = plans.reduce((map, plan) => {
      map[(plan._id as Types.ObjectId).toString()] = plan.name;
      return map;
    }, {} as Record<string, string>);

    // Add client and plan names to subscriptions
    const enrichedSubscriptions = subscriptions.map(subscription => ({
      ...subscription,
      clientName: clientMap[(subscription.clientId as Types.ObjectId).toString()] || 'Unknown Client',
      planName: planMap[(subscription.subscriptionPlanId as Types.ObjectId).toString()] || 'Unknown Plan'
    }));

    return NextResponse.json({
      subscriptions: enrichedSubscriptions,
      totalCount,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching client subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client subscriptions' },
      { status: 500 }
    );
  }
}

// POST /api/admin/client-subscriptions - Create a new client subscription
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
    const requiredFields = ['clientId', 'subscriptionPlanId', 'startDate', 'status'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Verify client exists
    const client = await Client.findById(data.clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify subscription plan exists
    const plan = await SubscriptionPlan.findById(data.subscriptionPlanId);
    if (!plan) {
      return NextResponse.json(
        { error: 'Subscription plan not found' },
        { status: 404 }
      );
    }

    // Create new client subscription
    const newSubscription = new ClientSubscription({
      clientId: data.clientId,
      subscriptionPlanId: data.subscriptionPlanId,
      startDate: data.startDate ? new Date(data.startDate) : new Date(),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      status: data.status || 'ACTIVE'
    });

    await newSubscription.save();

    // Update client's activeSubscriptionId
    await Client.findByIdAndUpdate(data.clientId, {
      activeSubscriptionId: newSubscription._id
    });

    return NextResponse.json({
      message: 'Client subscription created successfully',
      subscription: newSubscription
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating client subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create client subscription' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/client-subscriptions/:id - Update a client subscription
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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

    // Extract ID from URL
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 1];

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
    if (data.baseFeeOverride !== undefined) subscription.baseFeeOverride = data.baseFeeOverride;
    if (data.creditsRemainingThisPeriod !== undefined) subscription.creditsRemainingThisPeriod = data.creditsRemainingThisPeriod;
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
export async function DELETE(req: NextRequest) {
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

    // Extract ID from URL
    const url = new URL(req.url);
    const segments = url.pathname.split('/');
    const id = segments[segments.length - 1];

    // Verify client subscription exists
    const subscription = await ClientSubscription.findById(id);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Client subscription not found' },
        { status: 404 }
      );
    }

    // Get client ID before deleting subscription
    const clientId = subscription.clientId;

    // Delete the subscription
    await ClientSubscription.findByIdAndDelete(id);

    // Update client's activeSubscriptionId if this was their active subscription
    const client = await Client.findById(clientId);
    if (client && client.activeSubscriptionId && client.activeSubscriptionId.toString() === id) {
      client.activeSubscriptionId = undefined;
      await client.save();
    }

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
