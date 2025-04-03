import {
  getCat,
  getCatById,
  postCat,
  putCat,
  deleteCat,
  getCatByOwnerId,
} from '../controllers/cat-controller.js';
import multer from 'multer';
import express from 'express';
import createThumbnail from '../../middlewares.js';

const catRouter = express.Router();

const upload = multer({dest: 'uploads/'});

catRouter
  .route('/')
  .get(getCat)
  .post(upload.single('file'), createThumbnail, postCat);

catRouter.route('/:id').get(getCatById).put(putCat).delete(deleteCat);

catRouter.route('/owner/:id').get(getCatByOwnerId);
/*
const findCatByOwner = async (ownerId) => {
  //todo:
};
*/
export default catRouter;
