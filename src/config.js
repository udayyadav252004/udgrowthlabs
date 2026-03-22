const os = require('os');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const companyName = process.env.COMPANY_NAME || 'UD Growth Labs';
const whatsappNumber = process.env.WHATSAPP_NUMBER || '917909970679';
const isVercel = Boolean(process.env.VERCEL);
const dataDirectory = isVercel
  ? path.join(os.tmpdir(), 'ud-growth-labs')
  : path.join(process.cwd(), 'data');

const publicSite = {
  companyName,
  whatsappNumber,
  whatsappLink: `https://wa.me/${whatsappNumber}`,
  contactPhone: process.env.CONTACT_PHONE || '7909970679',
  city: process.env.CITY || 'India'
};

module.exports = {
  port: Number.parseInt(process.env.PORT || '3000', 10),
  mongoUri: process.env.MONGODB_URI?.trim(),
  dataFilePath: path.join(dataDirectory, 'reviews.json'),
  publicSite
};
