const express = require('express');
const userController = require('../controllers/usersController');
const authController = require('../controllers/authController');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.route('/').get(authController.protect, userController.getAllUser);
router.route('/:id').get(userController.getOneUser);
// router.route('/:id').delete(authController.protect, authController.restrictTo('admin'), userController.deleteUser);
router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetpassword/:token').post(authController.resetPassword);


//update Me

router.route('/updateMyPassword').patch(authController.protect, authController.updatePassword);

router.route('/updateMe').patch(authController.protect, userController.updateMe);
router.route('/deleteMe').delete(authController.protect, userController.deleteMe);

module.exports = router;