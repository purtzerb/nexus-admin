import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/apiAuth';
import Client from '@/models/Client';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await dbConnect();
    
    // Authenticate the request
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify user is a CLIENT_USER
    if (user.role !== 'CLIENT_USER') {
      return NextResponse.json({ error: 'Forbidden - Only client users can access this endpoint' }, { status: 403 });
    }
    
    // Get the client's payment method info
    const client = await Client.findById(
      new mongoose.Types.ObjectId(user.clientId.toString())
    ).lean();
    
    if (!client) {
      return NextResponse.json({ 
        success: false,
        error: 'Client not found'
      }, { status: 404 });
    }
    
    // In a real implementation, you would fetch the payment method from a payment processor like Stripe
    // For now, we'll return mock payment data based on the client
    return NextResponse.json({
      success: true,
      paymentMethod: {
        type: 'Visa',
        lastFour: '4242',
        expiration: '12/25',
        isDefault: true
      }
    });
    
  } catch (error) {
    console.error('Error fetching payment method:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
