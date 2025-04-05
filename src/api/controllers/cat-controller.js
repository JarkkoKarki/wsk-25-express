import {
  addCat,
  findCatById,
  listAllCats,
  findCatByOwnerId,
  modifyCat,
  removeCat,
} from '../models/cat-model.js';

const getCat = async (req, res, next) => {
  try {
    const cats = await listAllCats();
    res.json(cats);
  } catch (error) {
    next(error);
  }
};

const getCatByOwnerId = async (req, res, next) => {
  try {
    const cats = await findCatByOwnerId(req.params.id);
    if (cats.length > 0) {
      res.json(cats);
    } else {
      const error = new Error('No cats found for this owner');
      error.status = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

const getCatById = async (req, res, next) => {
  try {
    const cat = await findCatById(req.params.id);
    if (cat) {
      res.json(cat);
    } else {
      const error = new Error('Cat not found');
      error.status = 404;
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

const postCat = async (req, res, next) => {
  try {
    const {cat_name, weight, birthdate} = req.body;
    const owner = res.locals.user?.user_id;
    const filename = req.file?.filename;

    if (!cat_name || !weight || !birthdate || !owner || !filename) {
      const error = new Error('All fields are required');
      error.status = 400;
      return next(error);
    }

    const result = await addCat({cat_name, weight, birthdate, owner, filename});

    if (result) {
      res.status(201).json({message: 'Cat added successfully'});
    } else {
      const error = new Error('Failed to add cat');
      error.status = 500;
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

const putCat = async (req, res, next) => {
  try {
    const {cat_name, weight, birthdate, owner} = req.body;
    const catId = parseInt(req.params.id, 10);

    console.log('Request Body:', req.body);
    console.log('res.locals.user:', res.locals.user);

    if (!cat_name || !weight || !birthdate || !owner) {
      const error = new Error(
        'All fields (cat_name, weight, birthdate, owner) are required'
      );
      error.status = 400;
      return next(error);
    }

    const updatedCat = {
      cat_name,
      weight,
      birthdate,
      owner,
      filename: req.file?.filename || null, // Handle file upload
    };

    console.log('Updated Cat Object:', updatedCat);

    const result = await modifyCat(
      updatedCat,
      catId,
      res.locals.user.role,
      res.locals.user.user_id
    );

    if (result) {
      res.status(200).json({message: 'Cat updated successfully', updatedCat});
    } else {
      const error = new Error('Failed to update cat');
      error.status = 400;
      return next(error);
    }
  } catch (error) {
    console.error('Error in putCat:', error);
    next(error);
  }
};

const deleteCat = async (req, res, next) => {
  try {
    const cat = await findCatById(req.params.id);

    if (!cat) {
      const error = new Error('Cat not found');
      error.status = 404;
      return next(error);
    }

    const loggedInUserId = parseInt(res.locals.user.user_id, 10);
    const {role} = res.locals.user;

    if (cat.owner !== loggedInUserId && role !== 'admin') {
      const error = new Error('You are not authorized to delete this cat');
      error.status = 403;
      return next(error);
    }

    const result = await removeCat(req.params.id, role, loggedInUserId);

    if (result) {
      res.status(200).json({message: 'Cat item deleted.'});
    } else {
      const error = new Error('Failed to delete cat');
      error.status = 400;
      next(error);
    }
  } catch (error) {
    next(error);
  }
};

export {getCat, getCatById, postCat, putCat, deleteCat, getCatByOwnerId};
