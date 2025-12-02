const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  changeRoleSchema,
  blockUserSchema
} = require('../validations/user.validation');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// User management routes
router.get('/', userController.getAllUsers);
router.get('/:id', validate(getUserSchema), userController.getUserById);
router.post('/', validate(createUserSchema), userController.createUser);
router.put('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', validate(getUserSchema), userController.deleteUser);

// Special actions
router.patch('/:id/role', validate(changeRoleSchema), userController.changeUserRole);
router.patch('/:id/block', validate(blockUserSchema), userController.toggleBlockUser);

module.exports = router;
