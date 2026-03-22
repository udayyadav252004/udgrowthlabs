const reviewForm = document.querySelector('#review-form');
const starButtons = Array.from(document.querySelectorAll('.star-button'));
const ratingInput = document.querySelector('#rating');
const startedAtInput = document.querySelector('#startedAt');
const formStatus = document.querySelector('#form-status');
const reviewList = document.querySelector('#review-list');
const averageRating = document.querySelector('#average-rating');
const averageRatingStars = document.querySelector('#average-rating-stars');
const totalReviews = document.querySelector('#total-reviews');
const storageMode = document.querySelector('#storage-mode');
const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('#site-nav');
const siteHeader = document.querySelector('.site-header');
const dashboardWindow = document.querySelector('#dashboard-window');

const FILLED_STAR = String.fromCharCode(9733);
const EMPTY_STAR = String.fromCharCode(9734);
const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const DEFAULT_WHATSAPP_NUMBER = '917909970679';

const PLAN_WHATSAPP_MESSAGES = {
  starter: 'Hi, I want to try the Starter Spark plan. It is Rs 199 one-time trial. Can you guide me?',
  growth: 'Hi, I am interested in the Growth Kickstart plan. It is Rs 1499 per month. Please share the details.',
  boost: 'Hi, I want to go with the Business Boost plan. It is Rs 2499 per month. What is the next step?',
  dominator: 'Hi, I am interested in the Brand Dominator plan. It is Rs 4999 per month. Let us get started.'
};

let currentWhatsAppNumber = DEFAULT_WHATSAPP_NUMBER;

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric'
});

function setCurrentYear() {
  const yearNode = document.querySelector('#current-year');

  if (yearNode) {
    yearNode.textContent = new Date().getFullYear();
  }
}

function getWhatsAppNumber() {
  return String(currentWhatsAppNumber || DEFAULT_WHATSAPP_NUMBER).replace(/\D+/g, '');
}

function buildWhatsAppUrl(message = '') {
  const number = getWhatsAppNumber();

  if (!message) {
    return `https://wa.me/${number}`;
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function openWhatsApp(planName) {
  const message = PLAN_WHATSAPP_MESSAGES[planName] || '';
  const url = buildWhatsAppUrl(message);

  window.open(url, '_blank', 'noopener,noreferrer');
  return false;
}

window.openWhatsApp = openWhatsApp;

function setupWhatsAppLinks() {
  document.querySelectorAll('.plan-whatsapp').forEach((node) => {
    const planName = node.dataset.whatsappPlan;
    const message = PLAN_WHATSAPP_MESSAGES[planName] || '';

    node.href = buildWhatsAppUrl(message);
  });

  document.querySelectorAll('.whatsapp-link:not(.plan-whatsapp)').forEach((node) => {
    const message = node.dataset.whatsappMessage || '';
    node.href = buildWhatsAppUrl(message);
  });
}

function setupNavigation() {
  if (!navToggle || !siteNav) {
    return;
  }

  navToggle.addEventListener('click', () => {
    const isOpen = siteNav.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  siteNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      siteNav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function setupHeaderState() {
  if (!siteHeader) {
    return;
  }

  const syncHeader = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
  };

  syncHeader();
  window.addEventListener('scroll', syncHeader, { passive: true });
}

function setupRevealAnimations() {
  const revealNodes = Array.from(document.querySelectorAll('[data-reveal]'));

  revealNodes.forEach((node, index) => {
    const delayStep = index % 4;
    node.style.transitionDelay = `${delayStep * 90}ms`;
  });

  if (!('IntersectionObserver' in window) || REDUCED_MOTION) {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: '0px 0px -40px 0px'
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
}

function updateStarButtons(value) {
  starButtons.forEach((button) => {
    const starValue = Number.parseInt(button.dataset.value, 10);
    const isActive = starValue <= value;

    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-checked', String(starValue === value));
  });
}

function setRating(value) {
  ratingInput.value = String(value);
  clearFieldError('rating');
  updateStarButtons(value);
}

function setupStarPicker() {
  starButtons.forEach((button, index) => {
    button.setAttribute('role', 'radio');
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');

    button.addEventListener('click', () => {
      const value = Number.parseInt(button.dataset.value, 10);
      setRating(value);
      button.focus();
    });

    button.addEventListener('keydown', (event) => {
      const currentIndex = starButtons.indexOf(button);
      const keyMap = {
        ArrowRight: Math.min(currentIndex + 1, starButtons.length - 1),
        ArrowUp: Math.min(currentIndex + 1, starButtons.length - 1),
        ArrowLeft: Math.max(currentIndex - 1, 0),
        ArrowDown: Math.max(currentIndex - 1, 0),
        Home: 0,
        End: starButtons.length - 1
      };

      if (!(event.key in keyMap)) {
        return;
      }

      event.preventDefault();
      const nextButton = starButtons[keyMap[event.key]];
      const value = Number.parseInt(nextButton.dataset.value, 10);

      starButtons.forEach((star) => star.setAttribute('tabindex', '-1'));
      nextButton.setAttribute('tabindex', '0');
      nextButton.focus();
      setRating(value);
    });
  });
}

function setFormStatus(message, isError = false) {
  formStatus.textContent = message;
  formStatus.style.color = isError ? '#b42318' : '';
}

function clearFieldError(fieldName) {
  const fieldError = document.querySelector(`[data-error-for="${fieldName}"]`);

  if (fieldError) {
    fieldError.textContent = '';
  }
}

function clearErrors() {
  document.querySelectorAll('.field-error').forEach((node) => {
    node.textContent = '';
  });
}

function showErrors(errors = {}) {
  Object.entries(errors).forEach(([fieldName, message]) => {
    const fieldError = document.querySelector(`[data-error-for="${fieldName}"]`);

    if (fieldError) {
      fieldError.textContent = message;
    }
  });
}

function formatStarString(value) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  return `${FILLED_STAR.repeat(rounded)}${EMPTY_STAR.repeat(5 - rounded)}`;
}

function createReviewCard(review) {
  const article = document.createElement('article');
  article.className = 'review-item';

  const header = document.createElement('div');
  header.className = 'review-item-top';

  const identity = document.createElement('div');
  const title = document.createElement('h4');
  title.textContent = review.name;

  const business = document.createElement('p');
  business.textContent = review.business || 'Local business owner';

  identity.append(title, business);

  const rating = document.createElement('span');
  rating.className = 'review-rating';
  rating.textContent = FILLED_STAR.repeat(review.rating);
  rating.setAttribute('aria-label', `${review.rating} out of 5 stars`);

  header.append(identity, rating);

  const body = document.createElement('p');
  body.textContent = review.reviewText;

  const timestamp = document.createElement('time');
  timestamp.dateTime = review.createdAt;
  timestamp.textContent = dateFormatter.format(new Date(review.createdAt));

  article.append(header, body, timestamp);
  return article;
}

function renderReviewSummary(summary) {
  averageRating.textContent = Number(summary.averageRating || 0).toFixed(1);
  averageRatingStars.textContent = formatStarString(summary.averageRating || 0);
  averageRatingStars.setAttribute('aria-label', `Average rating is ${Number(summary.averageRating || 0).toFixed(1)} out of 5`);
  totalReviews.textContent = String(summary.totalReviews || 0);
  storageMode.textContent = summary.storageMode === 'mongo' ? 'MongoDB' : 'Local JSON';

  reviewList.innerHTML = '';

  if (!summary.reviews || summary.reviews.length === 0) {
    const emptyState = document.createElement('p');
    emptyState.textContent = 'No reviews yet. Be the first to share your experience.';
    reviewList.appendChild(emptyState);
    return;
  }

  summary.reviews.forEach((review) => {
    reviewList.appendChild(createReviewCard(review));
  });
}

async function loadReviews() {
  try {
    const response = await fetch('/api/reviews');
    const payload = await response.json();

    if (!response.ok || !payload.success) {
      throw new Error(payload.message || 'Could not load reviews.');
    }

    renderReviewSummary(payload);
  } catch (error) {
    setFormStatus('Reviews are temporarily unavailable. Please refresh in a moment.', true);
  }
}

function applySiteConfig(site) {
  currentWhatsAppNumber = String(site.whatsappNumber || currentWhatsAppNumber || DEFAULT_WHATSAPP_NUMBER).replace(/\D+/g, '');

  document.querySelectorAll('.company-name').forEach((node) => {
    node.textContent = site.companyName;
  });

  document.querySelectorAll('.phone-link').forEach((node) => {
    node.textContent = site.contactPhone;
    node.href = `tel:${site.contactPhone.replace(/\s+/g, '')}`;
  });

  document.querySelectorAll('.phone-action').forEach((node) => {
    node.href = `tel:${site.contactPhone.replace(/\s+/g, '')}`;
  });

  setupWhatsAppLinks();
}

async function loadSiteConfig() {
  try {
    const response = await fetch('/api/site-config');
    const payload = await response.json();

    if (response.ok && payload.success) {
      applySiteConfig(payload.site);
    }
  } catch {
    // Keep the default in-markup values if the config endpoint is unavailable.
  }
}

function getClientErrors(formData) {
  const errors = {};
  const rating = Number.parseInt(formData.get('rating'), 10);
  const name = String(formData.get('name') || '').trim();
  const reviewText = String(formData.get('reviewText') || '').trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    errors.rating = 'Please choose a rating from 1 to 5.';
  }

  if (name.length < 2) {
    errors.name = 'Please enter your name.';
  }

  if (reviewText.length < 25) {
    errors.reviewText = 'Please enter at least 25 characters.';
  }

  return errors;
}

function resetReviewForm() {
  reviewForm.reset();
  ratingInput.value = '';
  startedAtInput.value = String(Date.now());
  updateStarButtons(0);
  starButtons.forEach((button, index) => {
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');
  });
}

async function handleReviewSubmit(event) {
  event.preventDefault();
  clearErrors();
  setFormStatus('');

  const submitButton = reviewForm.querySelector('button[type="submit"]');
  const formData = new FormData(reviewForm);
  const clientErrors = getClientErrors(formData);

  if (Object.keys(clientErrors).length > 0) {
    showErrors(clientErrors);
    setFormStatus('Please fix the highlighted fields and try again.', true);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      showErrors(result.errors || {});
      throw new Error(result.message || 'Could not submit your review.');
    }

    if (result.summary) {
      renderReviewSummary(result.summary);
    }

    resetReviewForm();
    setFormStatus(result.message || 'Thanks for sharing your feedback.');
  } catch (error) {
    setFormStatus(error.message || 'Could not submit your review right now.', true);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Review';
  }
}

function setupReviewForm() {
  if (!reviewForm) {
    return;
  }

  startedAtInput.value = String(Date.now());
  reviewForm.addEventListener('submit', handleReviewSubmit);
}

function setupHeroTilt() {
  if (!dashboardWindow || REDUCED_MOTION || window.innerWidth < 900) {
    return;
  }

  dashboardWindow.addEventListener('pointermove', (event) => {
    const bounds = dashboardWindow.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;
    const tiltY = (x - 0.5) * 10;
    const tiltX = (0.5 - y) * 8;

    dashboardWindow.style.setProperty('--tilt-x', `${tiltX}deg`);
    dashboardWindow.style.setProperty('--tilt-y', `${tiltY}deg`);
  });

  dashboardWindow.addEventListener('pointerleave', () => {
    dashboardWindow.style.setProperty('--tilt-x', '0deg');
    dashboardWindow.style.setProperty('--tilt-y', '0deg');
  });
}

function init() {
  setCurrentYear();
  setupWhatsAppLinks();
  setupNavigation();
  setupHeaderState();
  setupRevealAnimations();
  setupStarPicker();
  setupReviewForm();
  setupHeroTilt();
  loadSiteConfig();
  loadReviews();
}

init();

