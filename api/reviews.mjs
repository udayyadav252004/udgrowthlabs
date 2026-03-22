import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { initializeReviewStore, getReviewSummary, createReview } = require('../src/services/reviewStore');
const { validateReviewInput } = require('../src/utils/sanitize');

let initializationPromise;

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'cache-control': 'no-store',
      'content-type': 'application/json; charset=utf-8'
    }
  });
}

async function ensureReviewStore() {
  if (!initializationPromise) {
    initializationPromise = initializeReviewStore();
  }

  return initializationPromise;
}

export async function GET() {
  try {
    await ensureReviewStore();
    const summary = await getReviewSummary();

    return jsonResponse({
      success: true,
      ...summary
    });
  } catch (error) {
    console.error('Failed to fetch reviews:', error);
    return jsonResponse(
      {
        success: false,
        message: 'Something went wrong. Please try again shortly.'
      },
      500
    );
  }
}

export async function POST(request) {
  try {
    await ensureReviewStore();

    let payload;

    try {
      payload = await request.json();
    } catch {
      return jsonResponse(
        {
          success: false,
          message: 'Invalid JSON payload.'
        },
        400
      );
    }

    const { errors, isSpam, values } = validateReviewInput(payload);

    if (isSpam) {
      return jsonResponse(
        {
          success: true,
          message: 'Thanks for your review.'
        },
        202
      );
    }

    if (Object.keys(errors).length > 0) {
      return jsonResponse(
        {
          success: false,
          errors
        },
        400
      );
    }

    await createReview(values);
    const summary = await getReviewSummary();

    return jsonResponse(
      {
        success: true,
        message: 'Thanks for sharing your experience.',
        summary
      },
      201
    );
  } catch (error) {
    console.error('Failed to create review:', error);
    return jsonResponse(
      {
        success: false,
        message: 'Something went wrong. Please try again shortly.'
      },
      500
    );
  }
}
