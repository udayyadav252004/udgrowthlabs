const path = require('path');
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const config = require('./config');
const { createReview, getReviewSummary, initializeReviewStore } = require('./services/reviewStore');
const { validateReviewInput } = require('./utils/sanitize');

const app = express();
const publicPath = path.join(process.cwd(), 'public');

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        formAction: ["'self'", 'https://wa.me'],
        imgSrc: ["'self'", 'data:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", 'https://fonts.googleapis.com']
      }
    },
    crossOriginEmbedderPolicy: false
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please slow down and try again shortly.'
  }
});

const reviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'You have reached the review limit for now. Please try again later.'
  }
});

app.use('/api', apiLimiter);
app.use(express.static(publicPath, { extensions: ['html'], maxAge: '1h' }));

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Service is healthy.'
  });
});

app.get('/api/site-config', (_req, res) => {
  res.json({
    success: true,
    site: config.publicSite
  });
});

app.get('/api/reviews', async (_req, res, next) => {
  try {
    const summary = await getReviewSummary();
    res.json({ success: true, ...summary });
  } catch (error) {
    next(error);
  }
});

app.post('/api/reviews', reviewLimiter, async (req, res, next) => {
  try {
    const { errors, isSpam, values } = validateReviewInput(req.body);

    if (isSpam) {
      return res.status(202).json({
        success: true,
        message: 'Thanks for your review.'
      });
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        errors
      });
    }

    await createReview(values);
    const summary = await getReviewSummary();

    return res.status(201).json({
      success: true,
      message: 'Thanks for sharing your experience.',
      summary
    });
  } catch (error) {
    return next(error);
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again shortly.'
  });
});

async function start() {
  try {
    const mode = await initializeReviewStore();

    app.listen(config.port, () => {
      console.log(`UD Growth Labs website running on http://localhost:${config.port} (${mode} storage)`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();