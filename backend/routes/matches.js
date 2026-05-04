const express = require('express')
const router  = express.Router();
const {createMatch,voteMatch} = require('../controllers/match');
const { route } = require('./auth');
router.post('/matches',createMatch)
router.put('/matches/:id/vote',voteMatch);
module.exports =router;