const express = require('express');
const router = express.Router();

// In-memory storage for interests (for development)
let interests = [];

// POST /api/interests - Create new interest
router.post('/', async (req, res) => {
  try {
    const { listingId, userId, userEmail, userName, userPhone, listingTitle, listingPrice, timestamp } = req.body;
    
    if (!listingId || !userId || !userEmail || !userName || !listingTitle || !listingPrice) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already showed interest in this listing
    const existingInterest = interests.find(i => i.listingId === listingId && i.userId === userId);
    if (existingInterest) {
      return res.status(400).json({ error: 'You have already shown interest in this listing' });
    }

    const interest = {
      _id: Date.now().toString(),
      listingId,
      userId,
      userEmail,
      userName,
      userPhone: userPhone || 'Not provided',
      listingTitle,
      listingPrice,
      timestamp: new Date(timestamp),
      status: 'pending',
      createdAt: new Date()
    };

    interests.push(interest);

    // Send WhatsApp notification (console logging)
    console.log(`🔔 NEW INTEREST ALERT!`);
    console.log(`📱 User: ${userName} (${userEmail})`);
    console.log(`📞 Phone: ${userPhone}`);
    console.log(`🎮 Listing: ${listingTitle} - ${listingPrice}`);
    console.log(`🆔 Listing ID: ${listingId}`);
    console.log(`⏰ Time: ${new Date(timestamp).toLocaleString()}`);
    console.log(`📞 WhatsApp Message: "New interest in ${listingTitle} (${listingPrice}) from ${userName} (${userEmail}) - Phone: ${userPhone}"`);
    console.log(`📞 Send to: https://wa.me/7703976645?text=New%20interest%20in%20${encodeURIComponent(listingTitle)}%20(${encodeURIComponent(listingPrice)})%20from%20${encodeURIComponent(userName)}%20(${encodeURIComponent(userEmail)})%20-%20Phone:%20${encodeURIComponent(userPhone)}`);

    res.status(201).json(interest);
  } catch (error) {
    console.error('Error creating interest:', error);
    res.status(500).json({ error: 'Failed to create interest' });
  }
});

// GET /api/interests - Get all interests
router.get('/', async (req, res) => {
  try {
    res.json(interests);
  } catch (error) {
    console.error('Error fetching interests:', error);
    res.status(500).json({ error: 'Failed to fetch interests' });
  }
});

// GET /api/interests/listing/:listingId - Get interests for specific listing
router.get('/listing/:listingId', async (req, res) => {
  try {
    const listingInterests = interests.filter(i => i.listingId === req.params.listingId);
    res.json(listingInterests);
  } catch (error) {
    console.error('Error fetching listing interests:', error);
    res.status(500).json({ error: 'Failed to fetch listing interests' });
  }
});

// PUT /api/interests/:id - Update interest status
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status || !['pending', 'contacted', 'closed'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }

    const interestIndex = interests.findIndex(i => i._id === req.params.id);
    if (interestIndex === -1) {
      return res.status(404).json({ error: 'Interest not found' });
    }

    interests[interestIndex].status = status;
    res.json(interests[interestIndex]);
  } catch (error) {
    console.error('Error updating interest:', error);
    res.status(500).json({ error: 'Failed to update interest' });
  }
});

// DELETE /api/interests/:id - Delete interest
router.delete('/:id', async (req, res) => {
  try {
    const interestIndex = interests.findIndex(i => i._id === req.params.id);
    if (interestIndex === -1) {
      return res.status(404).json({ error: 'Interest not found' });
    }
    
    interests.splice(interestIndex, 1);
    res.json({ message: 'Interest deleted successfully' });
  } catch (error) {
    console.error('Error deleting interest:', error);
    res.status(500).json({ error: 'Failed to delete interest' });
  }
});

module.exports = router;
