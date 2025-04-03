import authRouter from './routes/auth-router.js';
import catRouter from './routes/cat-router.js';
import express from 'express';
import userRouter from './routes/user-router.js';

const router = express.Router();

router.use('/cats', catRouter);

router.use('/users', userRouter);

router.use('/auth', authRouter);

export default router;
