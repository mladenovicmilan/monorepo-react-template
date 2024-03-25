import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user'; // Adjust the path as per your project structure

const router = express.Router();

// Signup route
router.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 12);

  const user = new User({
    username,
    email,
    password: hashedPassword,
  });

  await user.save();
  res.status(201).send('User created successfully');
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).send('Unauthorized');
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).send('Internal server error');
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

  res.status(200).json({ token });
});

export default router;
