const express = require('express')
const router  = express.Router();
const {createMatch,voteMatch} = require('../controllers/match');
const verifyToken =
  require("../middlewares/auth");
const { route } = require('./auth');
router.post('/matches',createMatch)
router.put('/matches/:id/vote', verifyToken,voteMatch);
module.exports =router;