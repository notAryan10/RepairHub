const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = 'repairhub-secret-key'; 

app.use(cors());
app.use(express.json());

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {id: true, email: true, name: true, role: true,roomNumber: true, block: true,},
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  console.log('Registration request body:', req.body); 
  try {
    const { name, email, password, role, roomNumber, block } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role.toUpperCase(), roomNumber, block },
      select: { id: true,email: true, name: true,role: true, roomNumber: true,block: true},
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },JWT_SECRET,{ expiresIn: '7d' }
    )

    res.json({ user, token })
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid password' })
    }

    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role },JWT_SECRET,{ expiresIn: '7d' }
    );
    const { password: _, ...userWithoutPassword } = user

    res.json({ user: userWithoutPassword, token })
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' })
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ isValid: true, user: req.user });
});

app.patch('/api/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phoneNumber, roomNumber, block } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, phoneNumber, roomNumber, block },
      select: { id: true, email: true, name: true, role: true, phoneNumber: true, roomNumber: true, block: true },
    });

    res.json({ user: updated });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Update failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});