import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser } from '@/lib/auth/apiAuth';
import Invoice, { IInvoice } from '@/models/Invoice';
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
    
    // Get limit from query params or default to 5
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');
    
    // Convert clientId to ObjectId
    const clientId = new mongoose.Types.ObjectId(user.clientId.toString());
    
    // Get recent invoices for this client
    const invoicesData = await Invoice.find({ clientId })
      .sort({ invoiceDate: -1 })
      .limit(limit)
      .lean();
      
    // Transform the data to a more consistent format with proper typing
    const invoices = invoicesData.map(invoice => ({
      id: invoice._id?.toString() || '',
      invoiceNumber: `INV-${new Date(invoice.invoiceDate).getFullYear()}-${String(new Date(invoice.invoiceDate).getMonth() + 1).padStart(2, '0')}${String(new Date(invoice.invoiceDate).getDate()).padStart(2, '0')}`,
      invoiceDate: invoice.invoiceDate,
      dueDate: invoice.dueDate,
      amountBilled: invoice.amountBilled,
      status: invoice.status
    }));
    
    return NextResponse.json({
      success: true,
      invoices
    });
    
  } catch (error) {
    console.error('Error fetching client invoices:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
