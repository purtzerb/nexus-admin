import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import Invoice, { IInvoice } from '@/models/Invoice';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import mongoose from 'mongoose';


// GET /api/admin/invoices/[id] - Get a specific invoice
export async function GET(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(req);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }

    const {id} = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(id).lean() as (IInvoice & { _id: mongoose.Types.ObjectId }) | null;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // For SE users, check if the invoice belongs to one of their assigned clients
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const clientId = invoice.clientId.toString();
      if (!user.assignedClientIds || !user.assignedClientIds.includes(clientId)) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/invoices/[id] - Update a specific invoice
export async function PUT(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(req);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }

    const {id} = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      );
    }

    const data = await req.json();

    const invoice = await Invoice.findById(id) as mongoose.Document & IInvoice;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // For SE users, check if the invoice belongs to one of their assigned clients
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const clientId = invoice.clientId.toString();
      if (!user.assignedClientIds || !user.assignedClientIds.includes(clientId)) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    // Update all invoice fields
    if (data.clientId) invoice.clientId = data.clientId;
    if (data.clientSubscriptionId) invoice.clientSubscriptionId = data.clientSubscriptionId;
    if (data.invoiceDate) invoice.invoiceDate = new Date(data.invoiceDate);
    if (data.dueDate) invoice.dueDate = new Date(data.dueDate);
    if (data.paymentMethodInfo !== undefined) invoice.paymentMethodInfo = data.paymentMethodInfo;
    if (data.amountBilled !== undefined) invoice.amountBilled = data.amountBilled;
    if (data.status) invoice.status = data.status;
    if (data.notes !== undefined) invoice.notes = data.notes;

    await invoice.save();

    return NextResponse.json({
      message: 'Invoice updated successfully',
      invoice
    });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/invoices/[id] - Delete a specific invoice
export async function DELETE(req: NextRequest, { params }: any) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(req);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }

    const {id} = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid invoice ID format' },
        { status: 400 }
      );
    }

    const invoice = await Invoice.findById(id) as mongoose.Document & IInvoice;

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      );
    }

    // For SE users, check if the invoice belongs to one of their assigned clients
    if (user.role === 'SOLUTIONS_ENGINEER') {
      const clientId = invoice.clientId.toString();
      if (!user.assignedClientIds || !user.assignedClientIds.includes(clientId)) {
        return forbiddenResponse('Forbidden: You are not assigned to this client');
      }
    }

    // Instead of deleting, we'll mark it as VOID
    invoice.status = 'VOID';
    await invoice.save();

    return NextResponse.json({
      message: 'Invoice voided successfully'
    });
  } catch (error) {
    console.error('Error voiding invoice:', error);
    return NextResponse.json(
      { error: 'Failed to void invoice' },
      { status: 500 }
    );
  }
}
