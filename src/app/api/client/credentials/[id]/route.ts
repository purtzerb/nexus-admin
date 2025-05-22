import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import Credential from '@/models/Credential';
import { validateCredentials } from '@/lib/utils/credentialValidation';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

// Connect to the database
dbConnect();

// GET /api/client/credentials/[id]
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const authUser = await getAuthUser(req);

    // Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Ensure the user has the CLIENT_USER role
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // Ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    const {id} = await params;

    // Find the credential and ensure it belongs to the client
    const credential = await Credential.findOne({
      _id: id,
      clientId: authUser.clientId
    });

    if (!credential) {
      return NextResponse.json({ error: 'Credential not found or access denied' }, { status: 404 });
    }

    return NextResponse.json(credential);
  } catch (error) {
    console.error('Error fetching credential:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/client/credentials/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const authUser = await getAuthUser(req);

    // Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Ensure the user has the CLIENT_USER role
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // Ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    // Parse request body
    const body = await req.json();
    const { credentials: credentialData } = body;

    if (!credentialData) {
      return NextResponse.json({ error: 'Missing credentials data' }, { status: 400 });
    }

    const {id} = await params;

    // Find the credential and ensure it belongs to the client
    const credential = await Credential.findOne({
      _id: id,
      clientId: authUser.clientId
    });

    if (!credential) {
      return NextResponse.json({ error: 'Credential not found or access denied' }, { status: 404 });
    }

    // Validate the credentials
    const isValid = validateCredentials(credentialData);

    // Update the credential
    credential.credentials = credentialData;
    credential.status = isValid ? 'CONNECTED' : 'DISCONNECTED';
    credential.lastVerifiedAt = isValid ? new Date() : undefined;

    await credential.save();

    return NextResponse.json(credential);
  } catch (error) {
    console.error('Error updating credential:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/client/credentials/[id]
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate the user
    const authUser = await getAuthUser(req);

    // Check if user is authenticated
    if (!authUser) {
      return unauthorizedResponse();
    }

    // Ensure the user has the CLIENT_USER role
    if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
      return forbiddenResponse('Only client users can access this endpoint');
    }

    // Ensure clientId is available
    if (!authUser.clientId) {
      return forbiddenResponse('Client ID not found for user');
    }

    const {id} = await params;

    // Find the credential and ensure it belongs to the client
    const result = await Credential.deleteOne({
      _id: id,
      clientId: authUser.clientId
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Credential not found or access denied' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting credential:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
