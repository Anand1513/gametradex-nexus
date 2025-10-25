/**
 * Listing Compatibility Middleware
 * Ensures backward compatibility for old listings without collectionLevel
 */

const listingCompatibility = (req, res, next) => {
  // Store original json method
  const originalJson = res.json;

  // Override json method to transform response
  res.json = function(data) {
    if (data && typeof data === 'object') {
      // Transform single listing
      if (data.listing) {
        data.listing = transformListing(data.listing);
      }
      
      // Transform array of listings
      if (Array.isArray(data.listings)) {
        data.listings = data.listings.map(transformListing);
      }
      
      // Transform single listing in data object
      if (data.data && data.data.listing) {
        data.data.listing = transformListing(data.data.listing);
      }
      
      // Transform array of listings in data object
      if (data.data && Array.isArray(data.data.listings)) {
        data.data.listings = data.data.listings.map(transformListing);
      }
    }
    
    // Call original json method
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Transform a single listing to ensure compatibility
 */
const transformListing = (listing) => {
  if (!listing || typeof listing !== 'object') {
    return listing;
  }

  // Create a copy to avoid mutating original
  const transformedListing = { ...listing };

  // If collectionLevel doesn't exist but kdRatio does, use kdRatio
  if (!transformedListing.collectionLevel && transformedListing.kdRatio !== undefined) {
    transformedListing.collectionLevel = transformedListing.kdRatio;
  }

  // If characterId doesn't exist, set a default or generate one
  if (!transformedListing.characterId) {
    transformedListing.characterId = `legacy_${transformedListing._id || 'unknown'}`;
  }

  // Ensure videos array exists
  if (!transformedListing.videos) {
    transformedListing.videos = [];
  }

  // Ensure images array exists
  if (!transformedListing.images) {
    transformedListing.images = [];
  }

  return transformedListing;
};

/**
 * Middleware for listing creation/update
 * Ensures new listings have required fields
 */
const validateListingFields = (req, res, next) => {
  if (req.body) {
    // If collectionLevel is not provided but kdRatio is, use kdRatio
    if (!req.body.collectionLevel && req.body.kdRatio !== undefined) {
      req.body.collectionLevel = req.body.kdRatio;
    }

    // If characterId is not provided, generate one
    if (!req.body.characterId) {
      req.body.characterId = `new_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Ensure videos array exists
    if (!req.body.videos) {
      req.body.videos = [];
    }

    // Ensure images array exists
    if (!req.body.images) {
      req.body.images = [];
    }
  }

  next();
};

module.exports = {
  listingCompatibility,
  validateListingFields,
  transformListing
};
