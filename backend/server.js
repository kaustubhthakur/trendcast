const express = require('express')
require('dotenv').config();
const authrouter = require('./routes/auth')
const userrouter = require('./routes/users')
const matchrouter = require('./routes/matches')
const cors = require('cors')
const pool = require('./db')
const PORT = 8081;
const app = express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());

app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});
app.use(express.json());
app.use(cors());

app.use('/auth',authrouter);
app.use('/user',userrouter);
app.use('/match',matchrouter);
app.listen(PORT, () => { console.log(`server is running on port ${PORT}...`) })   