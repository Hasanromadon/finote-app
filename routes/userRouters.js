const express = require('express');
const userController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);

router.route('/').get(userController.getAllUser);

module.exports = router;
