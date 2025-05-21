import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/connect';
import Client from '@/models/Client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';
import mongoose from 'mongoose';

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/admin/clients/[id]/credits - Apply credit to client account
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

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

    await connectToDatabase();

    // Find client and update credit balance
    const client = await Client.findById(id);

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Initialize creditBalance if it doesn't exist
    if (!client.creditBalance) {
      client.creditBalance = 0;
    }

    // Add credit to client's balance
    client.creditBalance += Number(data.amount);

    // Add credit transaction to client's history if the schema supports it
    if (!client.creditHistory) {
      client.creditHistory = [];
    }

    client.creditHistory.push({
      amount: Number(data.amount),
      reason: data.reason,
      appliedBy: session.user.email,
      appliedAt: new Date()
    });

    await client.save();

    return NextResponse.json({ 
      message: 'Credit applied successfully', 
      newCreditBalance: client.creditBalance 
    });
  } catch (error) {
    console.error('Error applying credit:', error);
    return NextResponse.json(
      { error: 'Failed to apply credit' },
      { status: 500 }
    );
  }
}
