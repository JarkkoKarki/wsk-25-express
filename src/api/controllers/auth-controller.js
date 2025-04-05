/* eslint-disable no-undef */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import {createUser, login} from '../models/user-model.js';

// Controller for user registration
const registerUser = async (req, res) => {
  try {
    console.log('Incoming registration request:', req.body);

    const {name, username, email, password} = req.body;

    // Validate input
    if (!name || !username || !email || !password) {
      return res.status(400).json({error: 'All fields are required'});
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the database
    const result = await createUser({
      name,
      username,
      email,
      password: hashedPassword,
    });

    if (result) {
      res.status(201).json({message: 'User registered successfully'});
    } else {
      res.status(500).json({error: 'Failed to register user'});
    }
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};
// Controller for user login
const authUser = async (req, res) => {
  try {
    console.log('Incoming login request:', req.body);

    const {username, password} = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({error: 'Username and password required'});
    }

    // Fetch user from database
    const result = await login(username);

    if (!result) {
      return res.status(404).json({error: 'User not found'});
    }

    // Validate password
    const passwordValid = await bcrypt.compare(password, result.password);

    if (!passwordValid) {
      return res.status(401).json({error: 'Invalid password'});
    }

    // Generate JWT token
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
    console.error('Error in authUser:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

export {registerUser, authUser};
