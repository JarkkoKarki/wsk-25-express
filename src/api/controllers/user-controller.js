import {addUser, findUserById, listAllUsers} from '../models/user-model.js';

const getUser = (req, res) => {
  res.json(listAllUsers());
};

const getUserById = (req, res) => {
  const user = findUserById(req.params.id);
  if (user) {
    res.json(user);
  } else {
    res.sendStatus(404);
  }
};
const postUser = (req, res) => {
  const result = addUser(req.body);
  if (result.user_id) {
    res.status(201);
    res.json({message: 'New user added.', result});
  } else {
    res.sendStatus(400);
  }
};
const putUser = (req, res) => {
  res.sendStatus(200);
  const {name, username, email, role, password} = req.body;
  const user = findUserById(req.params.id);
  if (user) {
    user.name = name;
    user.username = username;
    user.email = email;
    user.role = role;
    user.password = password;
    res.json({message: 'User item updated.', user});
  } else {
    res.sendStatus(404);
  }
};
const deleteUser = (req, res) => {
  const user = findUserById(req.params.id);
  if (user) {
    res.sendStatus(200);
    const index = listAllUsers().indexOf(user);

    listAllUsers().splice(index, 1);
    res.json({message: 'User item deleted.'});
  } else {
    res.sendStatus(404);
  }
};

export {getUser, getUserById, postUser, putUser, deleteUser};
