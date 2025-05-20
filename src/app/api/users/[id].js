import userService from '../../../lib/userService';

/**
 * API handler for /api/users/[id]
 * Supports GET (get user), PUT (update user), and DELETE (delete user)
 */
export default async function handler(req, res) {
  const { 
    method,
    query: { id }
  } = req;

  try {
    switch (method) {
      case 'GET':
        // Get user by ID
        const user = await userService.getUserById(id);
        if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: user });

      case 'PUT':
        // Update user
        const updatedUser = await userService.updateUser(id, req.body);
        if (!updatedUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: updatedUser });

      case 'DELETE':
        // Delete user
        const deletedUser = await userService.deleteUser(id);
        if (!deletedUser) {
          return res.status(404).json({ success: false, message: 'User not found' });
        }
        return res.status(200).json({ success: true, data: deletedUser });

      default:
        return res.status(405).json({ success: false, message: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
}
