import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import Client from '@/models/Client';
import ClientCredit from '@/models/ClientCredit';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import mongoose from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/admin/clients/[id]/credits - Get client credit history
export async function GET(req: NextRequest, { params }: RouteParams) {
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

    const {id} = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid client ID format' },
        { status: 400 }
      );
    }

    // Parse query parameters for pagination
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Get credit transactions for this client
    const [creditHistory, totalCount] = await Promise.all([
      ClientCredit.find({ clientId: id })
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ClientCredit.countDocuments({ clientId: id })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      creditHistory,
      totalCount,
      page,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching client credit history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client credit history' },
      { status: 500 }
    );
  }
}

// POST /api/admin/clients/[id]/credits - Apply credit to client account
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid client ID format' },
        { status: 400 }
      );
    }

    const data = await req.json();

    // Validate required fields
    if (!data.amount || isNaN(Number(data.amount)) || Number(data.amount) <= 0) {
      return NextResponse.json(
        { error: 'Credit amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!data.reason || !data.reason.trim()) {
      return NextResponse.json(
        { error: 'Reason for credit is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find client and update credit balance
    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Initialize creditBalance if it doesn't exist
    if (client.creditBalance === undefined) {
      client.creditBalance = 0;
    }

    // Add credit to client's balance
    const previousBalance = client.creditBalance;
    client.creditBalance += Number(data.amount);
    client.lastCreditUpdate = new Date();

    // Create a new credit transaction record
    const creditTransaction = new ClientCredit({
      clientId: id,
      amount: Number(data.amount),
      reason: data.reason,
      appliedBy: user.email || user.id || 'admin-user', // Fallback to user ID or a default value if email is missing
      appliedAt: new Date(),
      transactionType: 'CREDIT',
      balance: client.creditBalance,
      notes: data.notes || ''
    });

    // Save both the client and the credit transaction
    await Promise.all([
      client.save(),
      creditTransaction.save()
    ]);

    return NextResponse.json({
      message: 'Credit applied successfully',
      newCreditBalance: client.creditBalance,
      previousBalance,
      transaction: creditTransaction
    });
  } catch (error) {
    console.error('Error applying credit:', error);
    return NextResponse.json(
      { error: 'Failed to apply credit' },
      { status: 500 }
    );
  }
}
