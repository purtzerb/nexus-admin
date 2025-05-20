import { userService } from '@/lib/db/userService';
import { clientService } from '@/lib/db/clientService';
import { Session } from '@/types';

/**
 * Check if a user has admin permissions
 * @param session User session
 * @returns Boolean indicating if user has admin permissions
 */
export const isAdmin = (session: Session | null): boolean => {
  if (!session || !session.user) return false;
  return session.user.role === 'ADMIN';
};

/**
 * Check if a user has SE permissions
 * @param session User session
 * @returns Boolean indicating if user has SE permissions
 */
export const isSolutionsEngineer = (session: Session | null): boolean => {
  if (!session || !session.user) return false;
  return session.user.role === 'SOLUTIONS_ENGINEER';
};

/**
 * Check if a user has client admin permissions
 * @param session User session
 * @returns Boolean indicating if user has client admin permissions
 */
export const isClientAdmin = (session: Session | null): boolean => {
  if (!session || !session.user) return false;
  return session.user.role === 'CLIENT_USER' && session.user.isClientAdmin === true;
};

/**
 * Check if an SE has access to a specific client
 * @param userId SE user ID
 * @param clientId Client ID
 * @returns Promise resolving to boolean indicating if SE has access to client
 */
export const checkSEClientAccess = async (userId: string, clientId: string): Promise<boolean> => {
  const seUser = await userService.getUserById(userId);
  if (!seUser) return false;
  
  // Type assertion to handle the mongoose return type
  const userDoc = seUser as unknown as { assignedClientIds?: string[] };
  
  if (!userDoc.assignedClientIds || !Array.isArray(userDoc.assignedClientIds)) {
    return false;
  }
  
  return userDoc.assignedClientIds.includes(clientId);
};

/**
 * Check if a client user has access to a specific client
 * @param userId Client user ID
 * @param clientId Client ID
 * @returns Promise resolving to boolean indicating if client user has access to client
 */
export const checkClientUserAccess = async (userId: string, clientId: string): Promise<boolean> => {
  const clientUser = await userService.getUserById(userId);
  if (!clientUser) return false;
  
  // Type assertion to handle the mongoose return type
  const userDoc = clientUser as unknown as { clientId?: string };
  
  return userDoc.clientId === clientId;
};

/**
 * Check if a user can manage client users for a specific client
 * @param session User session
 * @param clientId Client ID
 * @returns Promise resolving to boolean indicating if user can manage client users
 */
export const canManageClientUsers = async (session: Session | null, clientId: string): Promise<boolean> => {
  if (!session || !session.user) return false;
  
  // Admins can manage all client users
  if (session.user.role === 'ADMIN') return true;
  
  // SEs can manage users for their assigned clients
  if (session.user.role === 'SOLUTIONS_ENGINEER') {
    return await checkSEClientAccess(session.user.id, clientId);
  }
  
  // Client admins can manage users for their own client
  if (session.user.role === 'CLIENT_USER' && session.user.isClientAdmin) {
    return await checkClientUserAccess(session.user.id, clientId);
  }
  
  return false;
};

/**
 * Check if a client exists
 * @param clientId Client ID
 * @returns Promise resolving to boolean indicating if client exists
 */
export const clientExists = async (clientId: string): Promise<boolean> => {
  const client = await clientService.getClientById(clientId);
  return !!client;
};
