// back-end/routes/users.js
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth');
const {
    getAllUsers,
    getUser,
    updateUserRole,
    deleteUser,
    getUserStats
} = require('../controllers/userController');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// Routes
router.get('/stats', getUserStats);
router.get('/', getAllUsers);
router.get('/:id', getUser);
router.put('/:id/role',
    body('role').isIn(['customer', 'staff', 'manager', 'admin']).withMessage('Invalid role'),
    updateUserRole
);
router.delete('/:id', deleteUser);

module.exports = router;