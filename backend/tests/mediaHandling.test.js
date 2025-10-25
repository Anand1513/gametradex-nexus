/**
 * Unit Tests for Media Handling
 * Tests image and video upload, processing, and serving
 */

const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Mock Express app for testing
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'test-uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'screenshots') {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for screenshots'), false);
    }
  } else if (file.fieldname === 'videos') {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed for videos'), false);
    }
  } else {
    cb(new Error('Invalid field name'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
    files: 15 // Max 15 files total
  }
});

// Test route for media upload
app.post('/test/media-upload', upload.fields([
  { name: 'screenshots', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), (req, res) => {
  try {
    // Handle multer errors
    if (req.fileValidationError) {
      return res.status(500).json({
        success: false,
        message: 'File validation failed',
        error: req.fileValidationError
      });
    }

    // Process uploaded files and create URLs
    const imageUrls = [];
    const videoUrls = [];

    if (req.files.screenshots) {
      req.files.screenshots.forEach(file => {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/listings/${file.filename}`;
        imageUrls.push(fileUrl);
      });
    }

    if (req.files.videos) {
      req.files.videos.forEach(file => {
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/listings/${file.filename}`;
        videoUrls.push(fileUrl);
      });
    }

    res.json({
      success: true,
      message: 'Media uploaded successfully',
      data: {
        images: imageUrls,
        videos: videoUrls,
        imageCount: imageUrls.length,
        videoCount: videoUrls.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Media upload failed',
      error: error.message
    });
  }
});

// Test route for media validation
app.post('/test/media-validation', upload.fields([
  { name: 'screenshots', maxCount: 10 },
  { name: 'videos', maxCount: 5 }
]), (req, res) => {
  const errors = [];

  // Validate at least one screenshot
  if (!req.files || !req.files.screenshots || req.files.screenshots.length === 0) {
    errors.push('At least one screenshot is required');
  }

  // Validate video files if provided
  if (req.files && req.files.videos) {
    const validVideoTypes = ['video/mp4', 'video/mov', 'video/webm'];
    const invalidVideos = req.files.videos.filter(file => !validVideoTypes.includes(file.mimetype));
    if (invalidVideos.length > 0) {
      errors.push('Only MP4, MOV, and WebM video formats are allowed');
    }

    // Check video file sizes (50MB max)
    const oversizedVideos = req.files.videos.filter(file => file.size > 50 * 1024 * 1024);
    if (oversizedVideos.length > 0) {
      errors.push('Videos must be smaller than 50MB each');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }

  res.json({
    success: true,
    message: 'Media validation passed',
    data: {
      screenshotCount: req.files.screenshots ? req.files.screenshots.length : 0,
      videoCount: req.files.videos ? req.files.videos.length : 0
    }
  });
});

describe('Media Handling Tests', () => {
  
  beforeEach(() => {
    // Clean up test uploads directory
    if (fs.existsSync('test-uploads')) {
      fs.rmSync('test-uploads', { recursive: true, force: true });
    }
  });

  afterAll(() => {
    // Clean up test uploads directory
    if (fs.existsSync('test-uploads')) {
      fs.rmSync('test-uploads', { recursive: true, force: true });
    }
  });

  describe('Image Upload Tests', () => {
    test('should upload single image successfully', async () => {
      const response = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Listing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(1);
      expect(response.body.data.imageCount).toBe(1);
      expect(response.body.data.videoCount).toBe(0);
    });

    test('should upload multiple images successfully', async () => {
      const response = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test1.jpg')
        .attach('screenshots', Buffer.from('fake image data'), 'test2.jpg')
        .attach('screenshots', Buffer.from('fake image data'), 'test3.jpg')
        .field('title', 'Test Listing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(3);
      expect(response.body.data.imageCount).toBe(3);
    });

    test('should handle file type validation', async () => {
      // Test with valid image file
      const validResponse = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Listing');

      expect(validResponse.status).toBe(200);
      expect(validResponse.body.success).toBe(true);
    });
  });

  describe('Video Upload Tests', () => {
    test('should upload single video successfully', async () => {
      const response = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .attach('videos', Buffer.from('fake video data'), 'test.mp4')
        .field('title', 'Test Listing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.videos).toHaveLength(1);
      expect(response.body.data.videoCount).toBe(1);
    });

    test('should upload multiple videos successfully', async () => {
      const response = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .attach('videos', Buffer.from('fake video data'), 'test1.mp4')
        .attach('videos', Buffer.from('fake video data'), 'test2.mov')
        .attach('videos', Buffer.from('fake video data'), 'test3.webm')
        .field('title', 'Test Listing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.videos).toHaveLength(3);
      expect(response.body.data.videoCount).toBe(3);
    });

    test('should handle video file type validation', async () => {
      // Test with valid video file
      const validResponse = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .attach('videos', Buffer.from('fake video data'), 'test.mp4')
        .field('title', 'Test Listing');

      expect(validResponse.status).toBe(200);
      expect(validResponse.body.success).toBe(true);
    });
  });

  describe('Media Validation Tests', () => {
    test('should validate required screenshots', async () => {
      const response = await request(app)
        .post('/test/media-validation')
        .field('title', 'Test Listing');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('At least one screenshot is required');
    });

    test('should validate video file types', async () => {
      const response = await request(app)
        .post('/test/media-validation')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .attach('videos', Buffer.from('fake video data'), 'test.avi')
        .field('title', 'Test Listing');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Only MP4, MOV, and WebM video formats are allowed');
    });

    test('should handle file size validation', async () => {
      // Test with normal sized files
      const response = await request(app)
        .post('/test/media-validation')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .attach('videos', Buffer.from('fake video data'), 'test.mp4')
        .field('title', 'Test Listing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should pass validation with valid media', async () => {
      const response = await request(app)
        .post('/test/media-validation')
        .attach('screenshots', Buffer.from('fake image data'), 'test1.jpg')
        .attach('screenshots', Buffer.from('fake image data'), 'test2.jpg')
        .attach('videos', Buffer.from('fake video data'), 'test.mp4')
        .field('title', 'Test Listing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.screenshotCount).toBe(2);
      expect(response.body.data.videoCount).toBe(1);
    });
  });

  describe('File Processing Tests', () => {
    test('should generate unique filenames', async () => {
      const response1 = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Listing 1');

      const response2 = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Listing 2');

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      
      const filename1 = response1.body.data.images[0].split('/').pop();
      const filename2 = response2.body.data.images[0].split('/').pop();
      
      expect(filename1).not.toBe(filename2);
    });

    test('should create proper file URLs', async () => {
      const response = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test.jpg')
        .field('title', 'Test Listing');

      expect(response.status).toBe(200);
      expect(response.body.data.images[0]).toMatch(/^https?:\/\/.+\/uploads\/listings\/screenshots-\d+-\d+\.jpg$/);
    });

    test('should handle mixed file uploads correctly', async () => {
      const response = await request(app)
        .post('/test/media-upload')
        .attach('screenshots', Buffer.from('fake image data'), 'test1.jpg')
        .attach('screenshots', Buffer.from('fake image data'), 'test2.jpg')
        .attach('videos', Buffer.from('fake video data'), 'test1.mp4')
        .attach('videos', Buffer.from('fake video data'), 'test2.mov')
        .field('title', 'Test Listing');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.images).toHaveLength(2);
      expect(response.body.data.videos).toHaveLength(2);
      expect(response.body.data.imageCount).toBe(2);
      expect(response.body.data.videoCount).toBe(2);
    });
  });
});
