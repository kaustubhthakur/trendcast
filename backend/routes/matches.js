const express = require('express')
const router  = express.Router();
const {createMatch,voteMatch,getMatchesByLeague,getAllMatches} = require('../controllers/match');
const verifyToken =
  require("../middlewares/auth");
const { route } = require('./auth');
router.post('/matches',createMatch)
router.get('/matches', getAllMatches);  
router.put('/matches/:id/vote', verifyToken,voteMatch);
router.get("/matches/league/:league", getMatchesByLeague);
module.exports =router;