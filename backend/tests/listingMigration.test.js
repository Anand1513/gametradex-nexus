/**
 * Unit Tests for Listing Migration and Compatibility
 * Tests upload, listing creation, fetching, and media handling
 */

const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { listingCompatibility, validateListingFields, transformListing } = require('../middleware/listingCompatibility');

// Mock Express app for testing
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mock multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Test routes
app.post('/test/upload', upload.fields([
  { name: 'screenshots', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), validateListingFields, (req, res) => {
  res.json({
    success: true,
    files: req.files,
    body: req.body
  });
});

app.get('/test/listings', listingCompatibility, (req, res) => {
  // Mock listings with mixed old/new data
  const mockListings = [
    {
      _id: '1',
      title: 'Old Listing',
      game: 'BGMI',
      kdRatio: 4.2,
      // No collectionLevel
      characterId: 'old_123'
    },
    {
      _id: '2',
      title: 'New Listing',
      game: 'Valorant',
      collectionLevel: 3.8,
      characterId: 'new_456'
    },
    {
      _id: '3',
      title: 'Mixed Listing',
      game: 'Fortnite',
      kdRatio: 2.5,
      collectionLevel: 2.5,
      characterId: 'mixed_789'
    }
  ];
  
  res.json({
    success: true,
    listings: mockListings
  });
});

app.get('/test/listing/:id', listingCompatibility, (req, res) => {
  const listing = {
    _id: req.params.id,
    title: 'Test Listing',
    game: 'BGMI',
    kdRatio: 4.2,
    // No collectionLevel
    characterId: 'test_123'
  };
  
  res.json({
    success: true,
    listing: listing
  });
});

describe('Listing Migration and Compatibility Tests', () => {
  
  describe('File Upload Tests', () => {
    test('should handle image uploads correctly', async () => {
      const response = await request(app)
        .post('/test/upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Listing')
        .field('game', 'BGMI')
        .field('characterId', 'test_123')
        .field('collectionLevel', '4.2');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.files.screenshots).toBeDefined();
      expect(response.body.files.screenshots[0].fieldname).toBe('screenshots');
    });

    test('should handle video uploads correctly', async () => {
      const response = await request(app)
        .post('/test/upload')
        .attach('videos', Buffer.from('fake video data'), 'test.mp4')
        .field('title', 'Test Listing')
        .field('game', 'Valorant')
        .field('characterId', 'test_456')
        .field('collectionLevel', '3.8');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.files.videos).toBeDefined();
      expect(response.body.files.videos[0].fieldname).toBe('videos');
    });

    test('should handle mixed file uploads', async () => {
      const response = await request(app)
        .post('/test/upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test1.jpg')
        .attach('screenshots', Buffer.from('fake image data'), 'test2.jpg')
        .attach('videos', Buffer.from('fake video data'), 'test.mp4')
        .field('title', 'Test Listing')
        .field('game', 'Fortnite')
        .field('characterId', 'test_789')
        .field('collectionLevel', '2.5');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.files.screenshots).toHaveLength(2);
      expect(response.body.files.videos).toHaveLength(1);
    });

    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/test/upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Listing')
        .field('game', 'BGMI');
        // Missing characterId and collectionLevel

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      // Should have generated characterId
      expect(response.body.body.characterId).toBeDefined();
      expect(response.body.body.characterId).toMatch(/^new_\d+_[a-z0-9]+$/);
    });
  });

  describe('Listing Compatibility Tests', () => {
    test('should transform old listings with kdRatio to collectionLevel', async () => {
      const response = await request(app)
        .get('/test/listings');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const listings = response.body.listings;
      
      // Old listing should have collectionLevel set from kdRatio
      const oldListing = listings.find(l => l._id === '1');
      expect(oldListing.collectionLevel).toBe(4.2);
      expect(oldListing.kdRatio).toBe(4.2);
      
      // New listing should remain unchanged
      const newListing = listings.find(l => l._id === '2');
      expect(newListing.collectionLevel).toBe(3.8);
      expect(newListing.kdRatio).toBeUndefined();
      
      // Mixed listing should have both
      const mixedListing = listings.find(l => l._id === '3');
      expect(mixedListing.collectionLevel).toBe(2.5);
      expect(mixedListing.kdRatio).toBe(2.5);
    });

    test('should transform single listing with kdRatio', async () => {
      const response = await request(app)
        .get('/test/listing/1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const listing = response.body.listing;
      expect(listing.collectionLevel).toBe(4.2);
      expect(listing.kdRatio).toBe(4.2);
    });

    test('should ensure all listings have characterId', async () => {
      const response = await request(app)
        .get('/test/listings');

      expect(response.status).toBe(200);
      
      const listings = response.body.listings;
      listings.forEach(listing => {
        expect(listing.characterId).toBeDefined();
        expect(listing.characterId).not.toBe('');
      });
    });

    test('should ensure all listings have videos array', async () => {
      const response = await request(app)
        .get('/test/listings');

      expect(response.status).toBe(200);
      
      const listings = response.body.listings;
      listings.forEach(listing => {
        expect(Array.isArray(listing.videos)).toBe(true);
      });
    });
  });

  describe('Transform Function Tests', () => {
    test('should transform listing with kdRatio to collectionLevel', () => {
      const listing = {
        _id: '1',
        title: 'Test',
        kdRatio: 4.2
      };

      const transformed = transformListing(listing);
      
      expect(transformed.collectionLevel).toBe(4.2);
      expect(transformed.kdRatio).toBe(4.2);
    });

    test('should not override existing collectionLevel', () => {
      const listing = {
        _id: '1',
        title: 'Test',
        collectionLevel: 3.8,
        kdRatio: 4.2
      };

      const transformed = transformListing(listing);
      
      expect(transformed.collectionLevel).toBe(3.8);
      expect(transformed.kdRatio).toBe(4.2);
    });

    test('should generate characterId if missing', () => {
      const listing = {
        _id: '1',
        title: 'Test'
      };

      const transformed = transformListing(listing);
      
      expect(transformed.characterId).toBeDefined();
      expect(transformed.characterId).toMatch(/^legacy_1$/);
    });

    test('should ensure videos and images arrays exist', () => {
      const listing = {
        _id: '1',
        title: 'Test'
      };

      const transformed = transformListing(listing);
      
      expect(Array.isArray(transformed.videos)).toBe(true);
      expect(Array.isArray(transformed.images)).toBe(true);
    });

    test('should handle null/undefined listings', () => {
      expect(transformListing(null)).toBe(null);
      expect(transformListing(undefined)).toBe(undefined);
      expect(transformListing('string')).toBe('string');
    });
  });

  describe('Validation Middleware Tests', () => {
    test('should set collectionLevel from kdRatio if missing', () => {
      const req = {
        body: {
          title: 'Test',
          kdRatio: 4.2
        }
      };
      const res = {};
      const next = jest.fn();

      validateListingFields(req, res, next);

      expect(req.body.collectionLevel).toBe(4.2);
      expect(next).toHaveBeenCalled();
    });

    test('should generate characterId if missing', () => {
      const req = {
        body: {
          title: 'Test'
        }
      };
      const res = {};
      const next = jest.fn();

      validateListingFields(req, res, next);

      expect(req.body.characterId).toBeDefined();
      expect(req.body.characterId).toMatch(/^new_\d+_[a-z0-9]+$/);
      expect(next).toHaveBeenCalled();
    });

    test('should ensure videos and images arrays exist', () => {
      const req = {
        body: {
          title: 'Test'
        }
      };
      const res = {};
      const next = jest.fn();

      validateListingFields(req, res, next);

      expect(Array.isArray(req.body.videos)).toBe(true);
      expect(Array.isArray(req.body.images)).toBe(true);
      expect(next).toHaveBeenCalled();
    });
  });
});
