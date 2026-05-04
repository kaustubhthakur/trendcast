const pool = require("../db");

const CreateMatch = async({ teama,teamb , }) =>{
  const res = await pool.query(
    "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
    [username, email, password] 
  );
  return res.rows[0];
}