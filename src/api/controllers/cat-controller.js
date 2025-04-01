import {addCat, findCatById, listAllCats} from '../models/cat-model.js';

const getCat = async (req, res) => {
  res.json(await listAllCats());
};

const getCatById = async (req, res) => {
  const cat = await findCatById(req.params.id);
  if (cat) {
    res.json(cat);
  } else {
    res.sendStatus(404);
  }
};

const postCat = async (req, res) => {
  req.body.filename = req.file.filename;
  const result = await addCat(req.body);
  if (result.cat_id) {
    res.status(201);
    res.json({message: 'New cat added.', result});
  } else {
    res.sendStatus(400);
  }
};

const putCat = async (req, res) => {
  res.sendStatus(200);
  const {cat_name, weight, owner, filename, birthdate} = req.body;
  const cat = await findCatById(req.params.id);
  if (cat) {
    cat.cat_name = cat_name;
    cat.weight = weight;
    cat.owner = owner;
    cat.filename = filename;
    cat.birthdate = birthdate;
    res.json({message: 'Cat item updated.', cat});
  } else {
    res.sendStatus(404);
  }
};

const deleteCat = async (req, res) => {
  const cat = await findCatById(req.params.id);
  if (cat) {
    res.sendStatus(200);
    const index = listAllCats().indexOf(cat);

    await listAllCats().splice(index, 1);
    res.json({message: 'Cat item deleted.'});
  } else {
    res.sendStatus(404);
  }
};

export {getCat, getCatById, postCat, putCat, deleteCat};
