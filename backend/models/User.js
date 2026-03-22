const pool = require("../db");

exports.createUser = async (username, email, password) => {
  const res = await pool.query(
    "INSERT INTO users(username, email, password) VALUES($1,$2,$3) RETURNING id, username, email",
    [username, email, password]
  );
  return res.rows[0];
};

exports.findUserByEmail = async (email) => {
  const res = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );
  return res.rows[0];
};

exports.findUserByUsername = async (username) => {
  const res = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );
  return res.rows[0];
};