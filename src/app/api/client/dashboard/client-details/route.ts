import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser, hasRequiredRole, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/apiAuth';
import Client from '@/models/Client';
import User from '@/models/User';
import mongoose from 'mongoose';
import { IClient } from '@/models/Client';

export async function GET(request: NextRequest) {
  // Authenticate the user
  const authUser = await getAuthUser(request);
  
  // Check if user is authenticated and has CLIENT_USER role
  if (!authUser) {
    return unauthorizedResponse();
  }
  
  if (!hasRequiredRole(authUser, ['CLIENT_USER'])) {
    return forbiddenResponse('Only client users can access this endpoint');
  }
  
  // Ensure clientId is available
  if (!authUser.clientId) {
    return forbiddenResponse('Client ID not found for user');
  }
  
  try {
    // Convert string ID to ObjectId
    const clientObjectId = new mongoose.Types.ObjectId(authUser.clientId);
    
    // Fetch client details
    const client = await Client.findById(clientObjectId) as IClient;
    
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    // Fetch assigned SE details
    let assignedSEs = [];
    if (client.assignedSolutionsEngineerIds && client.assignedSolutionsEngineerIds.length > 0) {
      assignedSEs = await User.find(
        { 
          _id: { $in: client.assignedSolutionsEngineerIds },
          role: 'SOLUTIONS_ENGINEER'
        },
        { 
          firstName: 1, 
          lastName: 1, 
          email: 1, 
          profileImageUrl: 1 
        }
      );
    }
    
    // Return client details with pipeline progress and assigned SEs
    return NextResponse.json({
      companyName: client.companyName,
      companyUrl: client.companyUrl,
      status: client.status,
      pipelineProgressCurrentPhase: client.pipelineProgressCurrentPhase,
      pipelineSteps: client.pipelineSteps,
      assignedSolutionsEngineers: assignedSEs.map((se: any) => ({
        id: se._id,
        name: `${se.firstName} ${se.lastName}`,
        email: se.email,
        profileImageUrl: se.profileImageUrl
      }))
    });
    
  } catch (error) {
    console.error('Error fetching client details:', error);
    return NextResponse.json({ error: 'Failed to fetch client details' }, { status: 500 });
  }
}
