import {authUser, registerUser} from '../controllers/auth-controller.js';
import {authenticateToken} from '../../middlewares.js';
import express from 'express';

const authRouter = express.Router();

authRouter.route('/').post(registerUser);

authRouter.route('/login').post(authUser);

authRouter.route('/me').get(authenticateToken, (req, res) => {
  res.json(req.user);
});

authRouter.get('/logout', (req, res) => {
  res.status(200).json({message: 'Logged out successfully'});
});

export default authRouter;
