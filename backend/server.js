const express = require('express')
require('dotenv').config();
const authrouter = require('./routes/auth')
const cors = require('cors')

const PORT = 8081;
const app = express();

app.use(express.json());
app.use(cors());

app.use('/auth',authrouter);
app.listen(PORT, () => { console.log(`server is running on port ${PORT}...`) })