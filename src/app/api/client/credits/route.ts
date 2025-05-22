import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/apiAuth';
import ClientCredit, { IClientCredit } from '@/models/ClientCredit';
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
    
    // Convert clientId to ObjectId
    const clientId = new mongoose.Types.ObjectId(user.clientId.toString());
    
    // Find the latest client credit transaction to get the current balance
    const latestCredit = await ClientCredit.findOne({ clientId })
      .sort({ appliedAt: -1 })
      .lean() as (IClientCredit & { _id: string }) | null;
    
    if (!latestCredit) {
      return NextResponse.json({ 
        success: true,
        balance: 0,
        renewalDate: null
      });
    }
    
    // Calculate next renewal date - usually first of next month
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    // Get the sum of all credits
    const creditSum = await ClientCredit.aggregate([
      { 
        $match: { clientId } 
      },
      {
        $group: {
          _id: null,
          totalCredits: { 
            $sum: { 
              $cond: [
                { $eq: ["$transactionType", "CREDIT"] },
                "$amount",
                { $multiply: ["$amount", -1] }
              ]
            } 
          }
        }
      }
    ]);
    
    const balance = creditSum.length > 0 ? creditSum[0].totalCredits : 0;
    
    return NextResponse.json({
      success: true,
      balance,
      renewalDate: nextMonth,
      lastTransaction: latestCredit
    });
    
  } catch (error) {
    console.error('Error fetching client credits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
