const express = require('express');
const router = express.Router();
const { verifyAdminToken, verifyApiKey } = require('../middleware/authTemp');
const { 
  createApiKey, 
  listApiKeys, 
  deactivateApiKey 
} = require('../controllers/apikeyController');

router.post('/users/:userId/apikeys', verifyAdminToken, createApiKey);
router.get('/users/:userId/apikeys', verifyAdminToken, listApiKeys);
router.delete('/apikeys/:keyId', verifyAdminToken, deactivateApiKey);

router.get('/data', verifyApiKey, (req, res) => {
  res.json({
    message: 'Akses berhasil!',
    user: {
      id: req.user.id,
      email: req.user.email,
      firstname: req.user.firstname,
      lastname: req.user.lastname
    },
    data: {
      example: 'Ini adalah data yang dilindungi oleh API Key',
      timestamp: new Date()
    }
  });
});

router.get('/profile', verifyApiKey, (req, res) => {
  // Log untuk debugging
  console.log('API Key Info:', req.apiKey);
  
  res.json({
    profile: {
      id: req.user.id,
      email: req.user.email,
      firstname: req.user.firstname,
      lastname: req.user.lastname,
      created_at: req.user.created_at
    },
    apiKeyInfo: {
      name: req.apiKey.name,
      lastUsed: req.apiKey.last_used,   
      expiresAt: req.apiKey.expires_at   
    }
  });
});

module.exports = router;