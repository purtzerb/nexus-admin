import userService from '../../../lib/userService';

/**
 * API handler for /api/users
 * Supports GET (list users) and POST (create user)
 */
export default async function handler(req, res) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Get all users (with optional filtering)
        const users = await userService.getUsers(req.query);
        return res.status(200).json({ success: true, data: users });

      case 'POST':
        // Create a new user
        const user = await userService.createUser(req.body);
        return res.status(201).json({ success: true, data: user });

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
