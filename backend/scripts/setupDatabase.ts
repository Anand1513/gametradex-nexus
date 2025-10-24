/**
 * Database Setup Script
 * Initializes MongoDB connection and creates indexes
 */

import { connectToDatabase, disconnectFromDatabase } from '../utils/database';
import { AdminAction } from '../models/AdminAction';
import { AdminSession } from '../models/AdminSession';

/**
 * Setup database indexes
 */
const setupIndexes = async () => {
  try {
    console.log('Creating database indexes...');
    
    // Create indexes for AdminAction collection
    await AdminAction.collection.createIndex({ adminId: 1, createdAt: -1 });
    await AdminAction.collection.createIndex({ actionType: 1, createdAt: -1 });
    await AdminAction.collection.createIndex({ targetType: 1, targetId: 1 });
    await AdminAction.collection.createIndex({ sessionId: 1, createdAt: -1 });
    await AdminAction.collection.createIndex({ createdAt: -1 });
    await AdminAction.collection.createIndex({ ip: 1 });
    
    // Create indexes for AdminSession collection
    await AdminSession.collection.createIndex({ adminId: 1, loginAt: -1 });
    await AdminSession.collection.createIndex({ sessionId: 1 });
    await AdminSession.collection.createIndex({ isActive: 1, lastActivity: -1 });
    await AdminSession.collection.createIndex({ loginAt: -1 });
    await AdminSession.collection.createIndex({ ip: 1, loginAt: -1 });
    
    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
    throw error;
  }
};

/**
 * Setup database
 */
const setupDatabase = async () => {
  try {
    console.log('Setting up database...');
    
    // Connect to database
    await connectToDatabase();
    
    // Create indexes
    await setupIndexes();
    
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Database setup failed:', error);
    throw error;
  } finally {
    // Disconnect from database
    await disconnectFromDatabase();
  }
};

/**
 * Run setup if called directly
 */
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Database setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

export default setupDatabase;
