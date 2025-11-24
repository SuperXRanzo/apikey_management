require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  API_KEY_PREFIX: 'sk_',
  TOKEN_EXPIRY: '24h'
};