import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/apiAuth';
import ClientSubscription, { IClientSubscription } from '@/models/ClientSubscription';
import SubscriptionPlan, { ISubscriptionPlan } from '@/models/SubscriptionPlan';
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
    
    // Verify user is a CLIENT_USER and has a clientId
    if (user.role !== 'CLIENT_USER' || !user.clientId) {
      return NextResponse.json({ error: 'Forbidden - Invalid access' }, { status: 403 });
    }
    
    // Get the client's subscription
    const clientId = new mongoose.Types.ObjectId(user.clientId.toString());
    const clientSubscription = await ClientSubscription.findOne({
      clientId,
      status: 'ACTIVE'
    }).lean() as (IClientSubscription & { _id: string }) | null;
    
    if (!clientSubscription) {
      return NextResponse.json({ 
        success: true,
        subscription: null,
        message: 'No active subscription found'
      });
    }
    
    // Get the subscription plan details
    const subscriptionPlan = await SubscriptionPlan.findById(
      clientSubscription.subscriptionPlanId
    ).lean() as (ISubscriptionPlan & { _id: string }) | null;
    
    if (!subscriptionPlan) {
      return NextResponse.json({ 
        success: true,
        subscription: clientSubscription,
        planName: 'Unknown Plan',
        baseFee: 0,
        message: 'Subscription plan details not found'
      });
    }
    
    // Calculate next billing date based on start date and billing cadence
    const startDate = new Date(clientSubscription.startDate);
    let nextBillingDate = new Date(startDate);
    const currentDate = new Date();
    
    // Determine billing cadence in months
    let monthsToAdd = 1; // Default for MONTHLY
    if (subscriptionPlan.billingCadence === 'QUARTERLY') {
      monthsToAdd = 3;
    } else if (subscriptionPlan.billingCadence === 'YEARLY') {
      monthsToAdd = 12;
    }
    
    // Find the next billing date
    while (nextBillingDate <= currentDate) {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + monthsToAdd);
    }
    
    // Calculate contract end date based on start date and contract length
    let contractEndDate = null;
    if (subscriptionPlan.contractLengthMonths) {
      contractEndDate = new Date(startDate);
      contractEndDate.setMonth(contractEndDate.getMonth() + subscriptionPlan.contractLengthMonths);
    }
    
    return NextResponse.json({
      success: true,
      subscription: clientSubscription,
      planName: subscriptionPlan.name,
      baseFee: subscriptionPlan.capAmount || 0, // Use cap amount as base fee for fixed plans
      billingCadence: subscriptionPlan.billingCadence,
      nextBillingDate,
      contractEndDate,
      status: clientSubscription.status
    });
    
  } catch (error) {
    console.error('Error fetching client subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
