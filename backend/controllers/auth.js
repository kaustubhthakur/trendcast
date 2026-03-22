const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User")

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingEmail = await userModel.findUserByEmail(email);
    const existingUsername = await userModel.findUserByUsername(username);

    if (existingEmail) {
      return res.status(400).json({ error: "Email already exists" });
    }

    if (existingUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.createUser(
      username,
      email,
      hashed
    );

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findUserByEmail(email);

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

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = {register,login}