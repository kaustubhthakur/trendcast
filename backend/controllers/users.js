const User = require("../models/User")

const getUser = async(req,res) => {
     try {
    const { id } = req.params;

    const user = await User.getUser(id)

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { profile_pic, favorite_team } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await User.updateUser(id, { profile_pic, favorite_team });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
const getUsers = async(req,res) =>{
    try {
         const users = await User.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
    console.log(error);   
    }
}
module.exports = {getUsers,getUser,updateUser}