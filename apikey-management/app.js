const express = require('express');
const { PORT } = require('./config.js');

// Routes
const apiKeyRoutes = require('./routes/apiKeyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/admin', adminRoutes);
app.use('/admin/users', userRoutes);
app.use('/admin', apiKeyRoutes);
app.use('/api', apiKeyRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'API Key Management System',
    version: '1.0.0',
    endpoints: {
      admin: {
        login: 'POST /admin/login',
        createUser: 'POST /admin/users',
        listUsers: 'GET /admin/users',
        userDetail: 'GET /admin/users/:id',
        createApiKey: 'POST /admin/users/:userId/apikeys',
        listApiKeys: 'GET /admin/users/:userId/apikeys',
        deactivateKey: 'DELETE /admin/apikeys/:keyId'
      },
      public: {
        data: 'GET /api/data (requires x-api-key header)',
        profile: 'GET /api/profile (requires x-api-key header)'
      }
    }
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Terjadi kesalahan server' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`\n📝 Default Admin Credentials:`);
  console.log(`   Email: admin@example.com`);
  console.log(`   Password: admin123\n`);
});

module.exports = app;