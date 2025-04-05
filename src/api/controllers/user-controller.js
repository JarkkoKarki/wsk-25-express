import {
  addUser,
  findUserById,
  listAllUsers,
  removeUser,
} from '../models/user-model.js';
import bcrypt from 'bcrypt';
import {updateUserById} from '../models/user-model.js';
import {validationResult} from 'express-validator';

const getUser = async (req, res, next) => {
  try {
    const users = await listAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error in getUser:', error);
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await findUserById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      const error = new Error('User not found');
      error.status = 404;
      next(error);
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    next(error);
  }
};

const postUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error('Validation failed');
      error.status = 400;
      error.details = errors.array();
      return next(error);
    }

    req.body.password = bcrypt.hashSync(req.body.password, 10);
    const result = await addUser(req.body);
    if (result && result.user_id) {
      res.status(201).json({message: 'New user added.', result});
    } else {
      const error = new Error('Failed to add user');
      error.status = 400;
      next(error);
    }
  } catch (error) {
    console.error('Error in postUser:', error);
    next(error);
  }
};

const putUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const loggedInUserId = parseInt(res.locals.user.user_id, 10);
    const {role} = res.locals.user;

    if (userId !== loggedInUserId && role !== 'admin') {
      const error = new Error('You are not authorized to update this user');
      error.status = 403;
      return next(error);
    }

    const {email, password, name} = req.body;

    if (!email && !password && !name) {
      const error = new Error(
        'At least one field (email, password, or name) is required'
      );
      error.status = 400;
      return next(error);
    }

    const user = await findUserById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      return next(error);
    }

    const updatedUser = {email, name};
    if (password) {
      updatedUser.password = bcrypt.hashSync(password, 10);
    }

    const result = await updateUserById(userId, updatedUser, role);

    if (result) {
      res.status(200).json({message: 'User updated successfully', updatedUser});
    } else {
      const error = new Error('Failed to update user');
      error.status = 400;
      next(error);
    }
  } catch (error) {
    console.error('Error in putUser:', error);
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const loggedInUserId = parseInt(res.locals.user.user_id, 10);
    const {role} = res.locals.user;

    if (userId !== loggedInUserId && role !== 'admin') {
      const error = new Error('You are not authorized to delete this user');
      error.status = 403;
      return next(error);
    }

    const user = await findUserById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      return next(error);
    }

    const result = await removeUser(userId, role);

    if (result) {
      res.json({message: 'User deleted successfully.'});
    } else {
      const error = new Error('Failed to delete user');
      error.status = 400;
      next(error);
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    next(error);
  }
};

export {getUser, getUserById, postUser, putUser, deleteUser};
