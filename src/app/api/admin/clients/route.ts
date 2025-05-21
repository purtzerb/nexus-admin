import { NextRequest, NextResponse } from 'next/server';
import { clientService } from '@/lib/db/clientService';
import { userService } from '@/lib/db/userService';
import dbConnect from '@/lib/db/db';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import mongoose from 'mongoose';

/**
 * GET /api/admin/clients
 * Get all clients
 * Only accessible by admins and solutions engineers
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin or solutions engineer role
    if (!hasRequiredRole(user, ['ADMIN', 'SOLUTIONS_ENGINEER'])) {
      return forbiddenResponse('Forbidden: Admin or Solutions Engineer access required');
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
    const skip = searchParams.get('skip') ? parseInt(searchParams.get('skip')!) : undefined;

    let filter = {};

    // If user is a solutions engineer, only show clients assigned to them
    if (user.role === 'SOLUTIONS_ENGINEER' && user.id) {
      filter = { assignedSolutionsEngineerIds: user.id };
    }

    // Get clients
    const clients = await clientService.getClients(
      filter,
      { limit, skip, sort: { companyName: 1 as 1 } }
    );

    return NextResponse.json({ clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

/**
 * POST /api/admin/clients
 * Create a new client with associated users and solution engineers
 * Only accessible by admins
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Authenticate the request
    const user = await getAuthUser(request);

    if (!user) {
      return unauthorizedResponse();
    }

    // Check if user has admin role
    if (!hasRequiredRole(user, ['ADMIN'])) {
      return forbiddenResponse('Forbidden: Admin access required');
    }

    const data = await request.json();
    const {
      companyName,
      companyUrl,
      contactName,
      industry,
      status = 'ACTIVE',
      users = [],
      assignedSolutionsEngineerIds = []
    } = data;

    // Validate required fields
    if (!companyName) {
      return NextResponse.json({ error: 'Missing required field: company name is required' }, { status: 400 });
    }

    // Check if a client with the same name already exists
    const existingClient = await clientService.getClientByName(companyName.trim());
    if (existingClient) {
      return NextResponse.json({ error: 'A client with this name already exists' }, { status: 409 });
    }

    // Check if any of the client users already exist
    if (users && users.length > 0) {
      for (const userData of users) {
        const existingUser = await userService.getUserByEmail(userData.email);
        if (existingUser) {
          return NextResponse.json({
            error: `User with email ${userData.email} already exists. Cannot create client with existing users.`
          }, { status: 409 });
        }
      }
    }

    // Start a MongoDB session for transaction
    const session = await mongoose.startSession();
    let newClient;

    try {
      // Start transaction
      session.startTransaction();

      // Create client data
      const clientData = {
        companyName,
        companyUrl,
        contactName,
        industry,
        status,
        users,
        assignedSolutionsEngineerIds
      };

      // Create the client
      newClient = await clientService.createClient(clientData);
      const clientId = newClient._id;

      // Create CLIENT_USER users if provided
      if (users && users.length > 0) {
        for (const userData of users) {
          try {
            // Check if user with email already exists
            const existingUser = await userService.getUserByEmail(userData.email);
            if (existingUser) {
              console.warn(`User with email ${userData.email} already exists. Skipping creation.`);
              continue;
            }

            // Create user data object with CLIENT_USER role
            const userCreateData: any = {
              name: userData.name,
              email: userData.email.toLowerCase(),
              phone: userData.phone,
              role: 'CLIENT_USER',
              clientId: clientId,
              notifyByEmailForExceptions: userData.exceptions?.email || false,
              notifyBySmsForExceptions: userData.exceptions?.sms || false,
              hasBillingAccess: userData.access?.billing || false,
              isClientAdmin: userData.access?.admin || false
            };

            // Only add departmentId if it's a valid ObjectId
            if (userData.department) {
              console.log(`Department for user ${userData.name}: ${userData.department}`);
              // Check if department is already an ObjectId
              if (mongoose.Types.ObjectId.isValid(userData.department)) {
                userCreateData.departmentId = userData.department;
              } else {
                // If not, log it but don't add it to avoid the error
                console.warn(`Invalid departmentId format for user ${userData.name}: ${userData.department}. Skipping department assignment.`);
              }
            }

            // Create user with CLIENT_USER role
            await userService.createUser(userCreateData);
          } catch (userError) {
            console.error(`Error creating user ${userData.name}:`, userError);
            // Continue with other users even if one fails
          }
        }
      }

      // Update solution engineers to associate them with this client
      if (assignedSolutionsEngineerIds && assignedSolutionsEngineerIds.length > 0) {
        for (const seId of assignedSolutionsEngineerIds) {
          // Use updateOne with $addToSet to add clientId to assignedClientIds
          await userService.updateUser(
            seId,
            { $addToSet: { assignedClientIds: clientId } } as any
          );
        }
      }

      // Commit the transaction
      await session.commitTransaction();
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      throw error;
    } finally {
      // End session
      session.endSession();
    }

    return NextResponse.json({ client: newClient }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    // Add more detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if ('errors' in (error as any)) {
        console.error('Validation errors:', JSON.stringify((error as any).errors, null, 2));
      }
    }
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}
