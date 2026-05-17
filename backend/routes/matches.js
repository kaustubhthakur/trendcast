const express = require('express')
const router  = express.Router();
const {createMatch,voteMatch,getAllMatches} = require('../controllers/match');
const verifyToken =
  require("../middlewares/auth");
const { route } = require('./auth');
router.post('/matches',createMatch)
router.get('/matches', getAllMatches);  
router.put('/matches/:id/vote', verifyToken,voteMatch);
module.exports =router;