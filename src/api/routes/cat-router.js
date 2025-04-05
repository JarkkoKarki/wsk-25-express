import {
  getCat,
  getCatById,
  postCat,
  putCat,
  deleteCat,
  getCatByOwnerId,
} from '../controllers/cat-controller.js';
import {upload} from '../../middlewares.js';
import express from 'express';
import {
  createThumbnail,
  authenticateToken,
  checkCatOwnership,
} from '../../middlewares.js';

const catRouter = express.Router();

catRouter
  .route('/')
  .get(getCat)
  .post(authenticateToken, upload.single('file'), createThumbnail, postCat);

catRouter
  .route('/:id')
  .get(getCatById)
  .put(authenticateToken, upload.single('file'), checkCatOwnership, putCat)
  .delete(authenticateToken, checkCatOwnership, deleteCat);

catRouter.route('/owner/:id').get(getCatByOwnerId);

export default catRouter;
