const express = require('express');
const router = express.Router();
const Interest = require('../../models/Interest');

// POST /api/interests - Create new interest
router.post('/', async (req, res) => {
  try {
    const { listingId, userId, userEmail, userName, listingTitle, listingPrice, timestamp } = req.body;
    
    if (!listingId || !userId || !userEmail || !userName || !listingTitle || !listingPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already showed interest in this listing
    const existingInterest = await Interest.findOne({ listingId, userId });
    if (existingInterest) {
      return res.status(400).json({ error: 'You have already shown interest in this listing' });
    }

    const interest = new Interest({
      listingId,
      userId,
      userEmail,
      userName,
      listingTitle,
      listingPrice,
      timestamp: new Date(timestamp)
    });

    await interest.save();

    // Send WhatsApp notification (you can implement this with WhatsApp Business API)
    console.log(`🔔 NEW INTEREST ALERT!`);
    console.log(`📱 User: ${userName} (${userEmail})`);
    console.log(`🎮 Listing: ${listingTitle} - ${listingPrice}`);
    console.log(`🆔 Listing ID: ${listingId}`);
    console.log(`⏰ Time: ${new Date(timestamp).toLocaleString()}`);
    console.log(`📞 WhatsApp Message: "New interest in ${listingTitle} (${listingPrice}) from ${userName} (${userEmail})"`);

    res.status(201).json(interest);
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({ error: 'Failed to create interest' });
  }
});

// GET /api/interests - Get all interests (admin only)
router.get('/', async (req, res) => {
  try {
    const interests = await Interest.find().sort({ timestamp: -1 });
    res.json(interests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
});

// GET /api/interests/listing/:listingId - Get interests for specific listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const interests = await Interest.find({ listingId: req.params.listingId }).sort({ timestamp: -1 });
    res.json(interests);
  } catch (error) {
    console.error('Error fetching listing interests:', error);
    res.status(500).json({ error: 'Failed to fetch listing interests' });
  }
});

// PUT /api/interests/:id - Update interest status (admin only)
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const interest = await Interest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!interest) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    res.json(interest);
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({ error: 'Failed to update interest' });
  }
});

// DELETE /api/interests/:id - Delete interest (admin only)
router.delete('/:id', async (req, res) => {
  try {
    const interest = await Interest.findByIdAndDelete(req.params.id);
    if (!interest) {
      return res.status(404).json({ error: 'Interest not found' });
    }
    res.json({ message: 'Interest deleted successfully' });
  } catch (error) {
    console.error('Error deleting interest:', error);
    res.status(500).json({ error: 'Failed to delete interest' });
  }
});

module.exports = router;
