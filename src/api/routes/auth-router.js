import {authUser} from '../controllers/auth-controller.js';
import express from 'express';

const authRouter = express.Router();

authRouter.route('/login').post(authUser);

export default authRouter;
