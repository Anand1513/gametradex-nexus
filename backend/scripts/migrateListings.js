/**
 * Migration Script: kdRatio to collectionLevel
 * Migrates existing listings to use the new collectionLevel field
 */

const mongoose = require('mongoose');
const { Listing } = require('../models/Listing');
require('dotenv').config();

const migrateListings = async () => {
  try {
    console.log('🔄 Starting listing migration...');
    
    // Connect to MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/gametradex';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find all listings that have kdRatio but no collectionLevel
    const listingsToMigrate = await Listing.find({
      kdRatio: { $exists: true },
      collectionLevel: { $exists: false }
    });

    console.log(`📊 Found ${listingsToMigrate.length} listings to migrate`);

    if (listingsToMigrate.length === 0) {
      console.log('✅ No listings need migration');
      return;
    }

    // Migrate each listing
    let migratedCount = 0;
    let errorCount = 0;

    for (const listing of listingsToMigrate) {
      try {
        await Listing.findByIdAndUpdate(
          listing._id,
          {
            $set: {
              collectionLevel: listing.kdRatio,
              // Keep kdRatio for backward compatibility
              kdRatio: listing.kdRatio
            }
          },
          { new: true }
        );
        
        migratedCount++;
        console.log(`✅ Migrated listing ${listing._id}: kdRatio ${listing.kdRatio} → collectionLevel ${listing.kdRatio}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating listing ${listing._id}:`, error.message);
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`✅ Successfully migrated: ${migratedCount} listings`);
    console.log(`❌ Errors: ${errorCount} listings`);
    console.log(`📊 Total processed: ${migratedCount + errorCount} listings`);

    // Verify migration
    const remainingToMigrate = await Listing.countDocuments({
      kdRatio: { $exists: true },
      collectionLevel: { $exists: false }
    });

    if (remainingToMigrate === 0) {
      console.log('🎉 Migration completed successfully!');
    } else {
      console.log(`⚠️  ${remainingToMigrate} listings still need migration`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateListings()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateListings };
