import { Router } from 'express';
import { registerUser, validatePassword } from '../services/auth/registration';
import { generateToken } from '../services/auth/jwt';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { user, token } = await registerUser(req.body);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await validatePassword(user, password))) {
      throw new Error();
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (error) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Get user profile
router.get('/profile', auth, async (req: any, res) => {
  res.json(req.user);
});

export default router;
