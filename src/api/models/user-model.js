import promisePool from '../../utils/database.js';

const listAllUsers = async () => {
  const [rows] = await promisePool.execute('SELECT * FROM wsk_users');
  console.log('rows', rows);
  return rows;
};

const findUserById = async (id) => {
  const [rows] = await promisePool.execute(
    'SELECT * FROM wsk_users WHERE user_id = ?',
    [id]
  );
  console.log('rows', rows);
  if (rows.length === 0) {
    return false;
  }
  return rows[0];
};

const addUser = async (user) => {
  const {name, username, password, email} = user;
  const sql = `INSERT INTO wsk_users (name, username, password, email)
               VALUES (?, ?, ?, ?)`;
  const params = [name, username, password, email];
  const rows = await promisePool.execute(sql, params);
  console.log('rows', rows);
  if (rows[0].affectedRows === 0) {
    return false;
  }
  return {user_id: rows[0].insertId};
};

const modifyUser = async (user, id, role, loggedInUserId) => {
  const sql = promisePool.format(
    `UPDATE wsk_users SET ? WHERE user_id = ? ${
      role !== 'admin' ? 'AND user_id = ?' : ''
    }`,
    role === 'admin' ? [user, id] : [user, id, loggedInUserId]
  );

  const [result] = await promisePool.execute(sql);
  console.log('SQL Query:', sql);
  console.log('Result:', result);

  if (result.affectedRows === 0) {
    return false;
  }
  return {message: 'success'};
};
const removeUser = async (id, role) => {
  let sql;
  const values = [id];

  if (role === 'admin') {
    sql = `DELETE FROM wsk_users WHERE user_id = ?`;
  } else {
    sql = `DELETE FROM wsk_users WHERE user_id = ? AND user_id = ?`;
    values.push(id);
  }
  const [result] = await promisePool.execute(sql, values);
  return result.affectedRows > 0;
};
const login = async (user) => {
  const sql = `SELECT * FROM wsk_users WHERE username = ?`;

  const [rows] = await promisePool.execute(sql, [user]);
  console.log('rows', rows);
  if (rows.length === 0) {
    return false;
  }
  return rows[0];
};
const createUser = async ({name, username, email, password}) => {
  try {
    // Check if the username or email already exists
    const [existingUser] = await promisePool.execute(
      'SELECT * FROM wsk_users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUser.length > 0) {
      console.log('User already exists:', existingUser);
      return {error: 'Username or email already exists'};
    }

    // Insert the new user
    const [result] = await promisePool.execute(
      'INSERT INTO wsk_users (name, username, email, password) VALUES (?, ?, ?, ?)',
      [name, username, email, password] // Include the 'name' field
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in createUser:', error);
    return false;
  }
};
const updateUserById = async (id, user, role) => {
  const fields = [];
  const values = [];

  if (user.email) {
    fields.push('email = ?');
    values.push(user.email);
  }

  if (user.password) {
    fields.push('password = ?');
    values.push(user.password);
  }

  if (user.name) {
    fields.push('name = ?');
    values.push(user.name);
  }

  values.push(id);

  let sql;
  if (role === 'admin') {
    sql = `UPDATE wsk_users SET ${fields.join(', ')} WHERE user_id = ?`;
  } else {
    sql = `UPDATE wsk_users SET ${fields.join(
      ', '
    )} WHERE user_id = ? AND user_id = ?`;
    values.push(id);
  }

  const [result] = await promisePool.execute(sql, values);

  return result.affectedRows > 0;
};

export {
  listAllUsers,
  findUserById,
  addUser,
  modifyUser,
  removeUser,
  login,
  createUser,
  updateUserById,
};
