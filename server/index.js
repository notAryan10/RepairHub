const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const prisma = new PrismaClient()

const app = express();
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
      select: { id: true, email: true, name: true, role: true, roomNumber: true, block: true, },
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
  try {
    const { name, email, password, role, roomNumber, block, phoneNumber } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role.toUpperCase(), roomNumber, block, phoneNumber },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        roomNumber: true,
        block: true,
        phoneNumber: true,
        createdAt: true
      },
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' }
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
    const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' }
    );
    const { password: _, ...userWithoutPassword } = user
    res.json({ user: userWithoutPassword, token })
  } catch (error) {
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

app.get('/api/user/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const [reportedCount, resolvedCount, pendingCount] = await Promise.all([
      prisma.issue.count({
        where: { reportedById: userId }
      }),
      prisma.issue.count({
        where: {reportedById: userId,status: 'COMPLETED'}
      }),
      prisma.issue.count({
        where: {reportedById: userId,status: { in: ['PENDING', 'IN_PROGRESS'] }}
      })
    ])

    res.json({
      reported: reportedCount,
      resolved: resolvedCount,
      pending: pendingCount
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({message: 'Failed to fetch user statistics',error: error.message})
  }
})

app.post('/api/reports', authenticateToken, async (req, res) => {
  try {
    const { title, description, location, category = 'OTHER' } = req.body;
    const userId = req.user.id;

    const validCategories = ['PLUMBING', 'ELECTRICAL', 'FURNITURE', 'WIFI', 'OTHER'];
    const issueCategory = validCategories.includes(category.toUpperCase()) ? category.toUpperCase() : 'OTHER'
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { roomNumber: true, block: true }
    })

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        category: issueCategory,
        status: 'PENDING',
        roomNumber: location,
        block: user.block || 'UNKNOWN',
        reportedBy: { connect: { id: userId } }
      },
      include: {
        reportedBy: {select: {id: true,name: true,email: true,roomNumber: true, block: true}}
      }
    })

    res.status(201).json({ issue });
  } catch (error) {
    console.error('Error creating report:', error)
    res.status(500).json({message: 'Failed to submit report',error: error.message})
  }
})

app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const issues = await prisma.issue.findMany({
      where: {
        reportedById: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        reportedBy: {select: {name: true,email: true}}
      }
    })

    res.json({ issues });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({
      message: 'Failed to fetch reports',
      error: error.message
    })
  }
})

app.get('/api/room/issues', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { roomNumber: true, block: true }
    })

    if (!user.roomNumber || !user.block) {
      return res.status(400).json({ message: 'User room details not found' });
    }

    const issues = await prisma.issue.findMany({
      where: {
        roomNumber: user.roomNumber,
        block: user.block
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        reportedBy: {select: {name: true,email: true}}
      }
    })

    res.json({roomNumber: user.roomNumber,block: user.block,issues})
  } catch (error) {
    console.error('Error fetching room issues:', error);
    res.status(500).json({
      message: 'Failed to fetch room issues',
      error: error.message
    });
  }
})

app.post('/api/feedback', authenticateToken, async (req, res) => {
  try {
    const { category, subject, message, rating } = req.body
    const userId = req.user.id

    if (!category || !subject || !message) {
      return res.status(400).json({ message: 'Category, subject, and message are required' })
    }

    if (rating !== undefined && rating !== null && (rating < 1 || rating > 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }
    const feedback = await prisma.appFeedback.create({
      data: {category,subject,message,rating: rating || null,userId},
      include: {user: {select: {id: true,name: true,email: true,role: true}}}
    })

    res.status(201).json({
      success: true,feedback,
      message: 'Feedback submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting feedback:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({message: 'Failed to submit feedback',error: error.message})
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});