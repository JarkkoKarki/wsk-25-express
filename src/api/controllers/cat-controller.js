import {
  addCat,
  findCatById,
  listAllCats,
  findCatByOwnerId,
  modifyCat,
  removeCat,
} from '../models/cat-model.js';

const getCat = async (req, res) => {
  try {
    const cats = await listAllCats();
    res.json(cats);
  } catch (error) {
    console.error('Error in getCat:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const getCatByOwnerId = async (req, res) => {
  try {
    const cats = await findCatByOwnerId(req.params.id);
    if (cats.length > 0) {
      res.json(cats);
    } else {
      res.status(404).json({error: 'No cats found for this owner'});
    }
  } catch (error) {
    console.error('Error in getCatByOwnerId:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const getCatById = async (req, res) => {
  try {
    const cat = await findCatById(req.params.id);
    if (cat) {
      res.json(cat);
    } else {
      res.status(404).json({error: 'Cat not found'});
    }
  } catch (error) {
    console.error('Error in getCatById:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const postCat = async (req, res) => {
  try {
    console.log('Incoming request body:', req.body); // Debug log
    console.log('Uploaded file:', req.file); // Debug log

    const {cat_name, weight, birthdate} = req.body;
    const owner = res.locals.user?.user_id; // Get the logged-in user's ID
    const filename = req.file?.filename; // Get the uploaded file's name

    // Validate input
    if (!cat_name || !weight || !birthdate || !owner || !filename) {
      console.error('Validation failed:', {
        cat_name,
        weight,
        birthdate,
        owner,
        filename,
      });
      return res.status(400).json({error: 'All fields are required'});
    }

    // Add the cat to the database
    const result = await addCat({cat_name, weight, birthdate, owner, filename});

    if (result) {
      res.status(201).json({message: 'Cat added successfully'});
    } else {
      res.status(500).json({error: 'Failed to add cat'});
    }
  } catch (error) {
    console.error('Error in postCat:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};
const putCat = async (req, res) => {
  try {
    const {cat_name, weight, owner, birthdate} = req.body;
    const file = req.file;

    // Fetch the existing cat from the database
    const existingCat = await findCatById(req.params.id);
    if (!existingCat) {
      return res.status(404).json({error: 'Cat not found'});
    }

    // Use the existing filename if no new file is uploaded
    const updatedCat = {
      cat_name,
      weight,
      owner,
      birthdate,
      filename: file ? file.filename : existingCat.filename, // Retain the old filename if no new file
    };

    // Update the cat in the database
    const result = await modifyCat(
      updatedCat,
      req.params.id,
      res.locals.user.role,
      res.locals.user.user_id
    );

    if (result) {
      res.status(200).json({message: 'Cat item updated.', updatedCat});
    } else {
      res.status(400).json({error: 'Failed to update cat'});
    }
  } catch (error) {
    console.error('Error in putCat:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

const deleteCat = async (req, res) => {
  try {
    const cat = await findCatById(req.params.id);

    if (!cat) {
      return res.status(404).json({error: 'Cat not found'});
    }

    const loggedInUserId = parseInt(res.locals.user.user_id, 10);
    const {role} = res.locals.user;

    if (cat.owner !== loggedInUserId && role !== 'admin') {
      return res
        .status(403)
        .json({error: 'You are not authorized to delete this cat'});
    }

    const result = await removeCat(req.params.id, role, loggedInUserId);

    if (result) {
      res.status(200).json({message: 'Cat item deleted.'});
    } else {
      res.status(400).json({error: 'Failed to delete cat'});
    }
  } catch (error) {
    console.error('Error in deleteCat:', error);
    res.status(500).json({error: 'Internal server error'});
  }
};

export {getCat, getCatById, postCat, putCat, deleteCat, getCatByOwnerId};
