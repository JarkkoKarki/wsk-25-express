import {authUser, registerUser} from '../controllers/auth-controller.js';
import {authenticateToken} from '../../middlewares.js';
import express from 'express';

const authRouter = express.Router();

authRouter.route('/').post(registerUser);

authRouter.route('/login').post(authUser);

authRouter.get('/me', authenticateToken, (req, res) => {
  res.json(res.locals.user);
});

authRouter.get('/logout', (req, res, next) => {
  try {
    res.status(200).json({message: 'Logged out successfully'});
  } catch (error) {
    next(error);
  }
});

export default authRouter;
