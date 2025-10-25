// Test script to add sample success stories and deals to the database
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/gametradex', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define schemas
const SuccessStorySchema = new mongoose.Schema({
  imageUrl: { type: String, required: true, trim: true },
  caption: { type: String, required: true, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const DealLogSchema = new mongoose.Schema({
  message: { type: String, required: true, trim: true, maxlength: 1000 },
  date: { type: Date, required: true }
}, {
  timestamps: true
});

const SuccessStory = mongoose.model('SuccessStory', SuccessStorySchema);
const DealLog = mongoose.model('DealLog', DealLogSchema);

async function addTestData() {
  try {
    // Clear existing data
    await SuccessStory.deleteMany({});
    await DealLog.deleteMany({});
    
    console.log('Cleared existing data...');

    // Add sample success stories
    const successStories = [
      {
        imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=600&fit=crop',
        caption: 'Successfully traded my Fortnite account for a rare skin collection! The process was smooth and secure.',
        createdAt: new Date('2024-01-15')
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=600&fit=crop',
        caption: 'Amazing experience trading my Valorant account. GameTradeX made it so easy and safe!',
        createdAt: new Date('2024-01-20')
      },
      {
        imageUrl: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=800&h=600&fit=crop',
        caption: 'Got my dream CS:GO inventory through GameTradeX. Highly recommended for all gamers!',
        createdAt: new Date('2024-01-25')
      }
    ];

    const createdStories = await SuccessStory.insertMany(successStories);
    console.log(`Added ${createdStories.length} success stories`);

    // Add sample deal logs
    const dealLogs = [
      {
        message: '✅ Oct 27, 2025 — Successfully completed a high-value CS:GO skin trade! 🎉',
        date: new Date('2025-10-27')
      },
      {
        message: '✅ Oct 26, 2025 — Valorant account with rare skins sold in under an hour! 🎉',
        date: new Date('2025-10-26')
      },
      {
        message: '✅ Oct 25, 2025 — Happy customer acquired a premium Minecraft account. 🎉',
        date: new Date('2025-10-25')
      }
    ];

    const createdDeals = await DealLog.insertMany(dealLogs);
    console.log(`Added ${createdDeals.length} deal logs`);

    console.log('✅ Test data added successfully!');
    console.log('Now you can:');
    console.log('1. Go to Admin Dashboard → Success Stories Management');
    console.log('2. Add/Edit/Delete stories and deals');
    console.log('3. Visit /success page to see the changes');
    console.log('4. Check the homepage carousel for updates');

  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

addTestData();
