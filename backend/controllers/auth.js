const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User")

const register = async (req, res) => {
  try {
   const { username, email, password } = req.body;
    const existingEmail = await User.findUserByEmail(email);     
    const existingUsername = await User.findUserByUsername(username);

    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    // Create user
    const newUser = await User.createUser({ 
      username,
      email,
      password: hash,
    });

    res.status(201).json({ message: "User has been created", user: newUser });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({message:"user has been logged in"});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {register,login}