import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import Invoice from '@/models/Invoice';
import Client from '@/models/Client';
import ClientSubscription from '@/models/ClientSubscription';
import { Types } from 'mongoose';

// GET /api/admin/invoices - Get all invoices
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

    // Get all invoices
    const invoices = await Invoice.find({}).sort({ invoiceDate: -1 }).lean();

    // Get all client IDs from invoices
    const clientIds = [...new Set(invoices.map(invoice => invoice.clientId))];

    // Get client names in a single query
    const clients = await Client.find({
      _id: { $in: clientIds }
    }, { _id: 1, companyName: 1 }).lean();
    
    console.log('Found clients:', clients);

    // Create a map of client IDs to client names
    const clientMap = clients.reduce((map, client) => {
      // Use type assertion to tell TypeScript that _id and companyName exist
      const clientId = (client._id as Types.ObjectId).toString();
      const clientName = (client.companyName as string) || 'Unknown Client';
      map[clientId] = clientName;
      return map;
    }, {} as Record<string, string>);
    
    console.log('Client map:', clientMap);

    // Add client names to invoices
    const invoicesWithClientNames = invoices.map(invoice => ({
      ...invoice,
      clientName: clientMap[invoice.clientId.toString()] || 'Unknown Client'
    }));

    return NextResponse.json({ invoices: invoicesWithClientNames });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

// POST /api/admin/invoices - Create a new invoice
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
    const requiredFields = ['clientId', 'clientSubscriptionId', 'invoiceDate', 'dueDate', 'amountBilled', 'status'];
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

    // Verify client subscription exists
    const subscription = await ClientSubscription.findById(data.clientSubscriptionId);
    if (!subscription) {
      return NextResponse.json(
        { error: 'Client subscription not found' },
        { status: 404 }
      );
    }

    // Create new invoice
    const newInvoice = new Invoice({
      clientId: data.clientId,
      clientSubscriptionId: data.clientSubscriptionId,
      invoiceDate: new Date(data.invoiceDate),
      dueDate: new Date(data.dueDate),
      paymentMethodInfo: data.paymentMethodInfo,
      amountBilled: data.amountBilled,
      status: data.status,
      notes: data.notes
    });

    await newInvoice.save();

    return NextResponse.json({
      message: 'Invoice created successfully',
      invoice: newInvoice
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create invoice' },
      { status: 500 }
    );
  }
}
