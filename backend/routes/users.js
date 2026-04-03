const express = require('express')
const router  = express.Router();
const {getUser,getUsers, updateUser} = require('../controllers/users');
router.get('/:id',getUser)
router.get('/',getUsers)
router.put('/update/:id',updateUser)
module.exports = router;