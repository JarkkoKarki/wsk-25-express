import promisePool from '../../utils/database.js';

const listAllCats = async () => {
  const [rows] = await promisePool.execute(
    'SELECT wsk_cats.*, wsk_users.name as "owner_name" FROM wsk_cats JOIN wsk_users ON wsk_cats.owner = wsk_users.user_id'
  );
  console.log('rows', rows);
  return rows;
};

const findCatById = async (id) => {
  const [rows] = await promisePool.execute(
    'SELECT wsk_cats.*, wsk_users.name as "owner_name" FROM wsk_cats JOIN wsk_users ON wsk_cats.owner = wsk_users.user_id WHERE cat_id = ?',
    [id]
  );
  console.log('rows', rows);
  if (rows.length === 0) {
    return false;
  }
  return rows[0];
};
const addCat = async ({cat_name, weight, birthdate, owner, filename}) => {
  try {
    console.log('Adding cat with:', {
      cat_name,
      weight,
      birthdate,
      owner,
      filename,
    });

    const [result] = await promisePool.execute(
      'INSERT INTO wsk_cats (cat_name, weight, birthdate, owner, filename) VALUES (?, ?, ?, ?, ?)',
      [cat_name, weight, birthdate, owner, filename]
    );

    return result.affectedRows > 0;
  } catch (error) {
    console.error('Error in addCat:', error);
    throw error;
  }
};

const modifyCat = async (cat, id, role, loggedInUserId) => {
  let sql;
  const params = [];

  console.log('Modify Cat Input:', {cat, id, role, loggedInUserId});

  if (role === 'admin') {
    sql = `UPDATE wsk_cats SET cat_name = ?, weight = ?, owner = ?, birthdate = ?, filename = COALESCE(?, filename) WHERE cat_id = ?`;
    params.push(
      cat.cat_name || null,
      cat.weight || null,
      cat.owner || null,
      cat.birthdate || null,
      cat.filename, // Use COALESCE to retain the existing value if null
      id
    );
  } else {
    sql = `UPDATE wsk_cats SET cat_name = ?, weight = ?, owner = ?, birthdate = ?, filename = COALESCE(?, filename) WHERE cat_id = ? AND owner = ?`;
    params.push(
      cat.cat_name || null,
      cat.weight || null,
      cat.owner || null,
      cat.birthdate || null,
      cat.filename, // Use COALESCE to retain the existing value if null
      id,
      loggedInUserId
    );
  }

  console.log('SQL Query:', sql);
  console.log('Params:', params);

  try {
    const [result] = await promisePool.execute(sql, params);
    console.log('Result:', result);

    if (result.affectedRows === 0) {
      return false;
    }
    return {message: 'success'};
  } catch (error) {
    console.error('Error in modifyCat:', error);
    throw error;
  }
};
const removeCat = async (id, role, loggedInUserId) => {
  let sql;

  if (role === 'admin') {
    sql = `DELETE FROM wsk_cats WHERE cat_id = ?`;
  } else {
    sql = `DELETE FROM wsk_cats WHERE cat_id = ? AND owner = ?`;
  }

  const [result] = await promisePool.execute(
    sql,
    role === 'admin' ? [id] : [id, loggedInUserId]
  );
  console.log('SQL Query:', sql);
  console.log('Result:', result);

  if (result.affectedRows === 0) {
    return false;
  }
  return {message: 'success'};
};

const findCatByOwnerId = async (ownerId) => {
  const [rows] = await promisePool.execute(
    'SELECT * FROM wsk_cats WHERE owner = ?',
    [ownerId]
  );
  console.log('rows', rows);
  if (rows.length === 0) {
    return false;
  }
  return rows;
};

export {
  listAllCats,
  findCatById,
  addCat,
  modifyCat,
  removeCat,
  findCatByOwnerId,
};
