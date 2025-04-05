/* eslint-disable no-undef */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {createUser, login} from '../models/user-model.js';

const registerUser = async (req, res, next) => {
  try {
    console.log('Incoming registration request:', req.body);

    const {name, username, email, password} = req.body;

    if (!name || !username || !email || !password) {
      const error = new Error('All fields are required');
      error.status = 400;
      return next(error);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await createUser({
      name,
      username,
      email,
      password: hashedPassword,
    });

    if (result) {
      res.status(201).json({message: 'User registered successfully'});
    } else {
      const error = new Error('Failed to register user');
      error.status = 500;
      next(error);
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    next(error);
  }
};

const authUser = async (req, res, next) => {
  try {
    const {username, password} = req.body;

    const result = await login(username);

    if (!result) {
      const error = new Error('User not found');
      error.status = 404;
      return next(error);
    }

    const passwordValid = await bcrypt.compare(password, result.password);

    if (!passwordValid) {
      const error = new Error('Invalid password');
      error.status = 401;
      return next(error);
    }

    const userWithNoPassword = {
      user_id: result.user_id,
      username: result.username,
      email: result.email,
      role: result.role,
    };

    const token = jwt.sign(userWithNoPassword, process.env.JWT_SECRET, {
      expiresIn: '24h',
    });

    res.json({user: userWithNoPassword, token});
  } catch (error) {
    next(error);
  }
};

export {registerUser, authUser};
