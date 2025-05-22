import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db/db';
import Credential, { ICredential } from '@/models/Credential';
import { SUPPORTED_SERVICES, createEmptyCredentials, validateCredentials } from '@/lib/utils/credentialValidation';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';

// Connect to the database
dbConnect();

// GET /api/client/credentials
export async function GET(req: NextRequest) {
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

    // Get credentials for the client
    const credentials = await Credential.find({ clientId: authUser.clientId });

    // If no credentials found, initialize default credentials for supported services
    if (credentials.length === 0) {
      const initialCredentials = await Promise.all(
        SUPPORTED_SERVICES.map(async (serviceName) => {
          const emptyCredential = createEmptyCredentials(serviceName);
          
          const newCredential = new Credential({
            clientId: authUser.clientId,
            serviceName,
            credentials: emptyCredential,
            status: 'DISCONNECTED'
          });
          
          return await newCredential.save();
        })
      );
      
      return NextResponse.json(initialCredentials);
    }

    // Check if we need to initialize any missing service credentials
    const existingServices = credentials.map(c => c.serviceName);
    const missingServices = SUPPORTED_SERVICES.filter(service => 
      !existingServices.includes(service)
    );

    // Initialize any missing service credentials
    if (missingServices.length > 0) {
      const newCredentials = await Promise.all(
        missingServices.map(async (serviceName) => {
          const emptyCredential = createEmptyCredentials(serviceName);
          
          const newCredential = new Credential({
            clientId: authUser.clientId,
            serviceName,
            credentials: emptyCredential,
            status: 'DISCONNECTED'
          });
          
          return await newCredential.save();
        })
      );
      
      return NextResponse.json([...credentials, ...newCredentials]);
    }

    return NextResponse.json(credentials);
  } catch (error) {
    console.error('Error fetching credentials:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/client/credentials
export async function POST(req: NextRequest) {
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
    const { id, serviceName, credentials: credentialData } = body;

    if (!serviceName || !credentialData) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate the credentials
    const isValid = validateCredentials(credentialData);
    
    // If updating an existing credential
    if (id) {
      // Find the credential and ensure it belongs to the client
      const credential = await Credential.findOne({ _id: id, clientId: authUser.clientId });
      
      if (!credential) {
        return NextResponse.json({ error: 'Credential not found or access denied' }, { status: 404 });
      }
      
      // Update the credential
      credential.credentials = credentialData;
      credential.status = isValid ? 'CONNECTED' : 'DISCONNECTED';
      credential.lastVerifiedAt = isValid ? new Date() : undefined;
      
      await credential.save();
      
      return NextResponse.json(credential);
    } 
    // Creating a new credential
    else {
      // Check if a credential for this service already exists
      const existingCredential = await Credential.findOne({ clientId: authUser.clientId, serviceName });
      
      if (existingCredential) {
        return NextResponse.json({ error: 'Credential for this service already exists' }, { status: 400 });
      }
      
      // Create a new credential
      const newCredential = new Credential({
        clientId: authUser.clientId,
        serviceName,
        credentials: credentialData,
        status: isValid ? 'CONNECTED' : 'DISCONNECTED',
        lastVerifiedAt: isValid ? new Date() : undefined
      });
      
      await newCredential.save();
      
      return NextResponse.json(newCredential);
    }
  } catch (error) {
    console.error('Error saving credential:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
