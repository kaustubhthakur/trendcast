const pool = require("../db");

exports.createUser = async ({ username, email, password }) => {
  const res = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, password] // ✅ correct
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
exports.getUser = async (id) => {
  const result = await pool.query(
    "SELECT id, username, email, created_at FROM users WHERE id = $1",
    [id]
  );
  return result.rows[0];
};
exports.getAllUsers = async () => {
  const result = await pool.query(
    "SELECT id, username, email, created_at FROM users"
  );
  return result.rows;
};
exports.findUserByUsername = async (username) => {
  const res = await pool.query(
    "SELECT * FROM users WHERE username=$1",
    [username]
  );
  return res.rows[0];
};