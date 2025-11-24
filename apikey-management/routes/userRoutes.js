const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../middleware/authTemp');
const { 
  createUser, 
  listUsers, 
  getUserDetail 
} = require('../controllers/userController');

router.post('/', verifyAdminToken, createUser);
router.get('/', verifyAdminToken, listUsers);
router.get('/:id', verifyAdminToken, getUserDetail);

module.exports = router;