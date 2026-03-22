# UD Growth Labs Website

A production-ready digital growth agency website built with a static frontend and a review API that works locally through Express and in production through Vercel serverless functions.

## Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express for local development
- Production API: Vercel serverless functions in `api/`
- Database: MongoDB when `MONGODB_URI` is configured
- Local fallback: JSON file persistence for instant local setup

## Features

- Premium single-page business website with mobile-first responsive design
- Sticky navigation, smooth scrolling, and reveal-on-scroll motion
- WhatsApp-first conversion flow with multiple CTA points and plan-specific pre-filled messages
- Review system with clickable 1 to 5 star rating, validation, sanitization, honeypot protection, and latest-first rendering
- SEO-ready metadata and fast static delivery

## Project Structure

```text
.
|-- api/
|   |-- health.mjs
|   |-- reviews.mjs
|   `-- site-config.mjs
|-- data/
|   `-- reviews.json
|-- public/
|   |-- app.js
|   |-- favicon.svg
|   |-- index.html
|   |-- robots.txt
|   |-- social-preview.svg
|   |-- styles.css
|   `-- UD_Logo.png
|-- src/
|   |-- data/
|   |   `-- seedReviews.js
|   |-- models/
|   |   `-- Review.js
|   |-- services/
|   |   `-- reviewStore.js
|   |-- utils/
|   |   `-- sanitize.js
|   |-- config.js
|   `-- server.js
|-- .env.example
|-- package.json
|-- README.md
`-- vercel.json
```

## Run Locally

1. Install dependencies.

```bash
npm install
```

2. Create an environment file.

```bash
copy .env.example .env
```

3. Start the development server.

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

## API

- `GET /api/health`
- `GET /api/site-config`
- `GET /api/reviews`
- `POST /api/reviews`

### Review Payload

```json
{
  "name": "Aarav Khanna",
  "business": "Khanna Dental Studio",
  "rating": 5,
  "reviewText": "The reels and offer creatives brought in WhatsApp enquiries within the first week.",
  "startedAt": 1732579200000,
  "companyWebsite": ""
}
```

## Vercel Deployment

1. Import the repository into Vercel.
2. Keep the project root as this repository root.
3. Add `MONGODB_URI` in the Vercel environment variables if you want persistent review storage in production.
4. Deploy.

Notes:
- `public/` is served as the frontend and `api/` contains the serverless functions.
- If `MONGODB_URI` is not set on Vercel, the app falls back to temporary file storage in the function runtime. That fallback is useful for smoke tests, but MongoDB is the correct production setup for persistent reviews.
- Pricing buttons preserve plan-specific WhatsApp messages and generate safe encoded URLs in the browser.

## Deployment Notes

- Update `.env` with your actual business details before launch if needed.
- The seeded reviews populate MongoDB automatically when the collection starts empty.
- Local development continues to run through `src/server.js`, while Vercel production uses the root `api/` handlers.
