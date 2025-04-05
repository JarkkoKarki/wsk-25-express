/* eslint-disable no-undef */
import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import {findCatById} from './api/models/cat-model.js';

dotenv.config();
export const createThumbnail = async (req, res, next) => {
  try {
    if (!req.file) {
      console.error('No file uploaded'); // Debug log
      return next('No file uploaded');
    }

    console.log('Uploaded file path:', req.file.path); // Debug log

    let extension = 'jpg'; // Default to jpg
    if (req.file.mimetype === 'image/png') {
      extension = 'png';
    }

    const thumbnailPath = `${req.file.path}_thumb.${extension}`;
    await sharp(req.file.path).resize(100, 100).toFile(thumbnailPath);

    console.log('Thumbnail created at:', thumbnailPath); // Debug log
    next();
  } catch (error) {
    console.error('Error in createThumbnail:', error);
    next(error);
  }
};
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({error: 'Unauthorized: No token provided'});
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({error: 'Forbidden: Invalid token'});
    }
    res.locals.user = user; // Set the decoded user in res.locals
    console.log('Decoded User:', user); // Debug log
    next();
  });
};

export const checkCatOwnership = async (req, res, next) => {
  try {
    const loggedInUserId = res.locals.user?.user_id; // Safely access user_id
    const {role} = res.locals.user || {}; // Safely access role

    if (!loggedInUserId) {
      return res.status(500).json({error: 'User not authenticated'});
    }

    const catId = parseInt(req.params.id, 10);

    // Fetch the cat from the database
    const cat = await findCatById(catId);

    if (!cat) {
      return res.status(404).json({error: 'Cat not found'});
    }

    // Allow only the owner or an admin to proceed
    if (role !== 'admin' && cat.owner !== loggedInUserId) {
      return res
        .status(403)
        .json({error: 'You are not authorized to access this resource'});
    }

    next();
  } catch (error) {
    console.error('Error in checkCatOwnership:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

export const checkUserOwnership = (req, res, next) => {
  const userId = parseInt(req.params.id, 10); // Convert to integer
  const loggedInUserId = res.locals.user?.user_id; // Safely access user_id
  const {role} = res.locals.user || {};
  if (!loggedInUserId) {
    return res.status(500).json({error: 'User not authenticated'});
  }

  if (userId !== loggedInUserId && role !== 'admin') {
    return res
      .status(403)
      .json({error: 'You are not authorized to access this resource'});
  }

  next();
};
