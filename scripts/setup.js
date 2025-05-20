require('dotenv').config();
const { MongoClient } = require('mongodb');

// MongoDB connection string - use environment variable if available, otherwise use default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexus-admin';

// Initial admin users to seed
const initialUsers = [
  {
    name: 'Benjamin Purtzer',
    email: 'purtzerb92@gmail.com',
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date()
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('nexus-admin');

    console.log('Connected to MongoDB successfully');

    // Check if users collection exists and has documents
    const usersCollection = db.collection('users');
    const userCount = await usersCollection.countDocuments();

    if (userCount > 0) {
      console.log(`Database already has ${userCount} users. Skipping seeding.`);
      console.log('If you want to reseed, please drop the users collection first.');
      await client.close();
      return;
    }

    // Insert initial users
    const result = await usersCollection.insertMany(initialUsers);
    console.log(`${result.insertedCount} users inserted successfully`);

    // Display the inserted users
    console.log('Inserted users:');
    const insertedUsers = await usersCollection.find({}).toArray();
    insertedUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}): ${user.role}`);
    });

    await client.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
