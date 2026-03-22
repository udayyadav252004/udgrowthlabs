const sanitizeHtml = require('sanitize-html');

const MAX_NAME_LENGTH = 80;
const MAX_BUSINESS_LENGTH = 100;
const MAX_REVIEW_LENGTH = 600;
const MIN_REVIEW_LENGTH = 25;
const MIN_FORM_AGE_MS = 2500;
const MAX_FORM_AGE_MS = 1000 * 60 * 60 * 24;

function cleanText(value, maxLength) {
  const normalized = String(value || '')
    .replace(/\s+/g, ' ')
    .trim();

  return sanitizeHtml(normalized, {
    allowedTags: [],
    allowedAttributes: {}
  }).slice(0, maxLength);
}

function validateReviewInput(payload = {}) {
  const name = cleanText(payload.name, MAX_NAME_LENGTH);
  const business = cleanText(payload.business, MAX_BUSINESS_LENGTH);
  const reviewText = cleanText(payload.reviewText, MAX_REVIEW_LENGTH);
  const rating = Number.parseInt(payload.rating, 10);
  const companyWebsite = cleanText(payload.companyWebsite, 255);
  const startedAt = Number.parseInt(payload.startedAt, 10);
  const age = Date.now() - startedAt;
  const errors = {};

  if (!name || name.length < 2) {
    errors.name = 'Please enter your name.';
  }

  if (business && business.length < 2) {
    errors.business = 'Business name should be at least 2 characters.';
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Please choose a rating from 1 to 5.';
  }

  if (!reviewText || reviewText.length < MIN_REVIEW_LENGTH) {
    errors.reviewText = `Please enter at least ${MIN_REVIEW_LENGTH} characters.`;
  }

  if (!Number.isFinite(startedAt) || age < MIN_FORM_AGE_MS || age > MAX_FORM_AGE_MS) {
    errors.startedAt = 'Please take a moment before submitting your review.';
  }

  return {
    values: {
      name,
      business,
      rating,
      reviewText
    },
    errors,
    isSpam: Boolean(companyWebsite)
  };
}

module.exports = {
  validateReviewInput
};