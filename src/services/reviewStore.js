const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
const mongoose = require('mongoose');

const config = require('../config');
const seedReviews = require('../data/seedReviews');
const Review = require('../models/Review');

let storageMode = 'file';
let isInitialized = false;

function buildSeedRecords() {
  return seedReviews.map((review, index) => ({
    id: `seed-${index + 1}`,
    ...review
  }));
}

async function ensureFileStore() {
  await fs.mkdir(path.dirname(config.dataFilePath), { recursive: true });

  try {
    await fs.access(config.dataFilePath);
  } catch {
    await fs.writeFile(config.dataFilePath, JSON.stringify(buildSeedRecords(), null, 2));
  }
}

async function readFileStore() {
  await ensureFileStore();

  const raw = await fs.readFile(config.dataFilePath, 'utf8');
  const parsed = JSON.parse(raw || '[]');

  if (!Array.isArray(parsed) || parsed.length === 0) {
    const seeded = buildSeedRecords();
    await fs.writeFile(config.dataFilePath, JSON.stringify(seeded, null, 2));
    return seeded;
  }

  return parsed;
}

async function writeFileStore(reviews) {
  await fs.writeFile(config.dataFilePath, JSON.stringify(reviews, null, 2));
}

function toPublicReview(record) {
  const createdAt = record.createdAt instanceof Date
    ? record.createdAt.toISOString()
    : new Date(record.createdAt).toISOString();

  return {
    id: String(record.id || record._id),
    name: record.name,
    business: record.business || '',
    rating: record.rating,
    reviewText: record.reviewText,
    createdAt
  };
}

function buildSummary(reviews) {
  const normalized = reviews
    .map((review) => toPublicReview(review))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));

  const totalReviews = normalized.length;
  const totalRating = normalized.reduce((sum, review) => sum + review.rating, 0);

  return {
    averageRating: totalReviews ? Number((totalRating / totalReviews).toFixed(1)) : 0,
    totalReviews,
    reviews: normalized
  };
}

async function seedMongoIfEmpty() {
  const totalReviews = await Review.countDocuments();

  if (totalReviews === 0) {
    await Review.insertMany(seedReviews);
  }
}

async function initializeReviewStore() {
  if (isInitialized) {
    return storageMode;
  }

  if (config.mongoUri) {
    try {
      await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 4000
      });

      storageMode = 'mongo';
      await seedMongoIfEmpty();
      isInitialized = true;
      return storageMode;
    } catch (error) {
      console.warn(`MongoDB unavailable, falling back to file storage: ${error.message}`);
    }
  }

  await ensureFileStore();
  storageMode = 'file';
  isInitialized = true;
  return storageMode;
}

async function getReviewSummary() {
  if (storageMode === 'mongo' && mongoose.connection.readyState === 1) {
    const reviews = await Review.find().sort({ createdAt: -1 }).lean();
    return {
      storageMode,
      ...buildSummary(reviews)
    };
  }

  const reviews = await readFileStore();

  return {
    storageMode,
    ...buildSummary(reviews)
  };
}

async function createReview(values) {
  if (storageMode === 'mongo' && mongoose.connection.readyState === 1) {
    const savedReview = await Review.create(values);

    return {
      storageMode,
      review: toPublicReview(savedReview.toObject())
    };
  }

  const reviews = await readFileStore();
  const review = {
    id: crypto.randomUUID(),
    ...values,
    createdAt: new Date().toISOString()
  };

  reviews.unshift(review);
  await writeFileStore(reviews);

  return {
    storageMode,
    review
  };
}

module.exports = {
  initializeReviewStore,
  getReviewSummary,
  createReview
};