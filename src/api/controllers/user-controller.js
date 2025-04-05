import {
  addUser,
  findUserById,
  listAllUsers,
  removeUser,
} from '../models/user-model.js';
import bcrypt from 'bcrypt';
import {updateUserById} from '../models/user-model.js';

const getUser = async (req, res) => {
  try {
    const users = await listAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error in getUser:', error);
    res.status(500).json({error: 'Server error'});
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await findUserById(req.params.id);
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({error: 'User not found'});
    }
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({error: 'Server error'});
  }
};

const postUser = async (req, res) => {
  try {
    req.body.password = bcrypt.hashSync(req.body.password, 10);
    const result = await addUser(req.body);
    if (result && result.user_id) {
      res.status(201).json({message: 'New user added.', result});
    } else {
      res.status(400).json({error: 'Failed to add user'});
    }
  } catch (error) {
    console.error('Error in postUser:', error);
    res.status(500).json({error: 'Server error'});
  }
};

const putUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10); // Convert to integer
    const loggedInUserId = parseInt(res.locals.user.user_id, 10); // Get logged-in user ID
    const {role} = res.locals.user; // Get user role from token

    if (userId !== loggedInUserId && role !== 'admin') {
      console.log('Authorization failed:', {userId, loggedInUserId, role});
      return res
        .status(403)
        .json({error: 'You are not authorized to update this user'});
    }

    const {email, password, name} = req.body;

    if (!email && !password && !name) {
      return res.status(400).json({
        error: 'At least one field (email, password, or name) is required',
      });
    }

    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    const updatedUser = {email, name};
    if (password) {
      updatedUser.password = bcrypt.hashSync(password, 10);
    }

    const result = await updateUserById(userId, updatedUser, role);

    if (result) {
      res.status(200).json({message: 'User updated successfully', updatedUser});
    } else {
      res.status(400).json({error: 'Failed to update user'});
    }
  } catch (error) {
    console.error('Error in putUser:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const loggedInUserId = parseInt(res.locals.user.user_id, 10);
    const {role} = res.locals.user;
    if (userId !== loggedInUserId && role !== 'admin') {
      return res.status(403).json({error: 'cannot delete other users'});
    }

    const user = await findUserById(userId, role);

    if (!user) {
      return res.status(404).json({error: 'User not found'});
    }

    const result = await removeUser(userId, role);

    if (result) {
      res.json({message: 'User deleted successfully.'});
    } else {
      res.status(400).json({error: 'Failed to delete user'});
    }
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({error: 'Server error'});
  }
};

export {getUser, getUserById, postUser, putUser, deleteUser};
