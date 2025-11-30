const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const upload = require('./middleware/upload');
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
      select: { id: true, email: true, name: true, role: true, roomNumber: true, block: true, phoneNumber: true, createdAt: true},
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
    const role = req.user.role;

    if (role === 'WARDEN') {
      const [totalCount, resolvedCount, pendingCount] = await Promise.all([
        prisma.issue.count(),
        prisma.issue.count({ where: { status: 'COMPLETED' } }),
        prisma.issue.count({ where: { status: { in: ['PENDING', 'IN_PROGRESS', 'ASSIGNED'] } } })
      ]);
      return res.json({
        reported: totalCount,
        resolved: resolvedCount,
        pending: pendingCount
      });
    } else if (role === 'STAFF' || role === 'TECHNICIAN') {
      const [assignedCount, completedCount, inProgressCount] = await Promise.all([
        prisma.issue.count({ where: { assignedToId: userId } }),
        prisma.issue.count({ where: { assignedToId: userId, status: 'COMPLETED' } }),
        prisma.issue.count({ where: { assignedToId: userId, status: { in: ['IN_PROGRESS', 'ASSIGNED'] } } })
      ]);
      return res.json({
        reported: assignedCount,
        resolved: completedCount,
        pending: inProgressCount
      });
    } else {
      const [reportedCount, resolvedCount, pendingCount] = await Promise.all([
        prisma.issue.count({ where: { reportedById: userId } }),
        prisma.issue.count({ where: { reportedById: userId, status: 'COMPLETED' } }),
        prisma.issue.count({ where: { reportedById: userId, status: { in: ['PENDING', 'IN_PROGRESS', 'ASSIGNED'] } } })
      ]);
      return res.json({
        reported: reportedCount,
        resolved: resolvedCount,
        pending: pendingCount
      });
    }
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ message: 'Failed to fetch user statistics', error: error.message })
  }
})

app.post('/api/reports', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, description, location, category = 'OTHER', priority = 'LOW' } = req.body;
    const userId = req.user.id;

    const validCategories = ['PLUMBING', 'ELECTRICAL', 'FURNITURE', 'WIFI', 'OTHER'];
    const issueCategory = validCategories.includes(category.toUpperCase()) ? category.toUpperCase() : 'OTHER'

    const priorityMap = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3 };
    const issuePriority = priorityMap[priority.toUpperCase()] || 1;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { roomNumber: true, block: true }
    })

    const issue = await prisma.issue.create({
      data: {
        title, description, category: issueCategory, status: 'PENDING',
        priority: issuePriority, roomNumber: location, block: user.block || 'UNKNOWN', reportedBy: { connect: { id: userId } },
        images: {
          create: req.files?.map(file => ({ url: file.path })) || []
        }
      },
      include: {
        reportedBy: { select: { id: true, name: true, email: true, roomNumber: true, block: true } },
        images: true
      }
    })

    res.status(201).json({ issue });
  } catch (error) {
    console.error('Error creating report:', error)
    res.status(500).json({ message: 'Failed to submit report', error: error.message })
  }
})

app.get('/api/reports', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const issues = await prisma.issue.findMany({
      where: { reportedById: userId },
      orderBy: { createdAt: 'desc' },
      include: { reportedBy: { select: { name: true, email: true } } }
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
      where: { roomNumber: user.roomNumber, block: user.block },
      orderBy: { createdAt: 'desc' },
      include: { reportedBy: { select: { name: true, email: true } } }
    })

    res.json({ roomNumber: user.roomNumber, block: user.block, issues })
  } catch (error) {
    console.error('Error fetching room issues:', error);
    res.status(500).json({
      message: 'Failed to fetch room issues',
      error: error.message
    });
  }
})

app.get('/api/warden/issues', authenticateToken, async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        reportedBy: { select: { name: true, roomNumber: true, block: true } },
        assignedTo: { select: { name: true } },
        images: true
      }
    });
    res.json(issues);
  } catch (error) {
    console.error('Error fetching all issues:', error);
    res.status(500).json({ message: 'Failed to fetch issues' });
  }
});

app.get('/api/warden/stats/detailed', authenticateToken, async (req, res) => {
  try {
    const [byCategory, byStatus, byPriority] = await Promise.all([
      prisma.issue.groupBy({
        by: ['category'],
        _count: { category: true }
      }),
      prisma.issue.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.issue.groupBy({
        by: ['priority'],
        _count: { priority: true }
      })
    ]);

    res.json({
      byCategory: byCategory.map(item => ({ name: item.category, count: item._count.category })),
      byStatus: byStatus.map(item => ({ name: item.status, count: item._count.status })),
      byPriority: byPriority.map(item => ({ name: item.priority === 3 ? 'HIGH' : item.priority === 2 ? 'MEDIUM' : 'LOW', count: item._count.priority }))
    });
  } catch (error) {
    console.error('Error fetching detailed stats:', error);
    res.status(500).json({ message: 'Failed to fetch detailed stats' });
  }
});

app.get('/api/staff/list', authenticateToken, async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'TECHNICIAN'] } },
      select: { id: true, name: true, email: true, role: true }
    });
    res.json(staff);
  } catch (error) {
    console.error('Error fetching staff list:', error);
    res.status(500).json({ message: 'Failed to fetch staff list' });
  }
});

app.delete('/api/staff/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== 'WARDEN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ message: 'Failed to delete staff member' });
  }
});

app.patch('/api/staff/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;
    if (req.user.role !== 'WARDEN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedStaff = await prisma.user.update({
      where: { id },
      data: { name, email, role },
      select: { id: true, name: true, email: true, role: true }
    });

    res.json(updatedStaff);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ message: 'Failed to update staff member' });
  }
});

app.patch('/api/issues/:id/assign', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId } = req.body;

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        assignedToId: staffId,
        status: 'ASSIGNED'
      },
      include: {
        assignedTo: { select: { name: true } }
      }
    });

    res.json(issue);
  } catch (error) {
    console.error('Error assigning issue:', error);
    res.status(500).json({ message: 'Failed to assign issue' });
  }
});

app.patch('/api/issues/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: { status },
      include: {
        assignedTo: { select: { name: true } },
        reportedBy: { select: { name: true, email: true } }
      }
    });

    res.json(issue);
  } catch (error) {
    console.error('Error updating issue status:', error);
    res.status(500).json({ message: 'Failed to update issue status' });
  }
});

app.get('/api/staff/assigned-issues', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const issues = await prisma.issue.findMany({
      where: { assignedToId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        reportedBy: { select: { name: true, roomNumber: true, block: true } }
      }
    });
    res.json(issues);
  } catch (error) {
    console.error('Error fetching assigned issues:', error);
    res.status(500).json({ message: 'Failed to fetch assigned issues' });
  }
});

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
      data: { category, subject, message, rating: rating || null, userId },
      include: { user: { select: { id: true, name: true, email: true, role: true } } }
    })

    res.status(201).json({
      success: true, feedback,
      message: 'Feedback submitted successfully'
    })
  } catch (error) {
    console.error('Error submitting feedback:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message })
  }
})

app.get('/api/staff/available-issues', authenticateToken, async (req, res) => {
  try {
    const issues = await prisma.issue.findMany({
      where: { assignedToId: null, status: { in: ['PENDING'] } },
      orderBy: { createdAt: 'desc' },
      include: { reportedBy: { select: { name: true, roomNumber: true, block: true } } }
    });
    res.json(issues);
  } catch (error) {
    console.error('Error fetching available issues:', error);
    res.status(500).json({ message: 'Failed to fetch available issues' });
  }
});

app.patch('/api/issues/:id/schedule', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { scheduledDate } = req.body;

    if (!scheduledDate) {
      return res.status(400).json({ message: 'Scheduled date is required' });
    }

    const issue = await prisma.issue.update({
      where: { id },
      data: {
        scheduledDate: new Date(scheduledDate),
        status: 'ASSIGNED'
      },
      include: { assignedTo: { select: { name: true } } }
    });

    res.json(issue);
  } catch (error) {
    console.error('Error scheduling issue:', error);
    res.status(500).json({ message: 'Failed to schedule issue' });
  }
});

app.post('/api/parts-requests', authenticateToken, async (req, res) => {
  try {
    const { issueId, partName, quantity, description } = req.body;
    const userId = req.user.id;

    if (req.user.role !== 'TECHNICIAN') {
      return res.status(403).json({ message: 'Only technicians can request parts' });
    }

    const partsRequest = await prisma.partsRequest.create({
      data: { issueId, partName, quantity, description, requestedById: userId },
      include: {
        issue: { select: { title: true } },
        requestedBy: { select: { name: true } }
      }
    });

    res.status(201).json(partsRequest);
  } catch (error) {
    console.error('Error creating parts request:', error);
    res.status(500).json({ message: 'Failed to create parts request' });
  }
});

app.get('/api/parts-requests', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'WARDEN') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const partsRequests = await prisma.partsRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        issue: { select: { title: true, roomNumber: true, block: true } },
        requestedBy: { select: { name: true, email: true } }
      }
    });

    res.json(partsRequests);
  } catch (error) {
    console.error('Error fetching parts requests:', error);
    res.status(500).json({ message: 'Failed to fetch parts requests' });
  }
});

app.get('/api/parts-requests/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const partsRequests = await prisma.partsRequest.findMany({
      where: { requestedById: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        issue: { select: { title: true, roomNumber: true, block: true } }
      }
    });

    res.json(partsRequests);
  } catch (error) {
    console.error('Error fetching my parts requests:', error);
    res.status(500).json({ message: 'Failed to fetch parts requests' });
  }
});

app.patch('/api/parts-requests/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (req.user.role !== 'WARDEN') {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' })
    }

    const partsRequest = await prisma.partsRequest.update({
      where: { id },
      data: { status },
      include: { issue: { select: { title: true } }, requestedBy: { select: { name: true } } }
    })

    res.json(partsRequest)
  } catch (error) {
    console.error('Error updating parts request status:', error)
    res.status(500).json({ message: 'Failed to update parts request status' })
  }
});

app.post('/api/time-logs/start', authenticateToken, async (req, res) => {
  try {
    const { issueId } = req.body
    const userId = req.user.id

    if (req.user.role !== 'TECHNICIAN') {
      return res.status(403).json({ message: 'Only technicians can log time' })
    }

    const activeLog = await prisma.timeLog.findFirst({
      where: {
        technicianId: userId,
        endTime: null
      }
    });

    if (activeLog) {
      return res.status(400).json({ message: 'You already have an active time log. Please stop it first.' })
    }

    const timeLog = await prisma.timeLog.create({
      data: { issueId, technicianId: userId, startTime: new Date() },
      include: { issue: { select: { title: true } }}
    })

    res.status(201).json(timeLog)
  } catch (error) {
    console.error('Error starting time log:', error)
    res.status(500).json({ message: 'Failed to start time log' })
  }
})

app.patch('/api/time-logs/:id/stop', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params
    const { notes } = req.body
    const userId = req.user.id

    const timeLog = await prisma.timeLog.findUnique({
      where: { id }
    })

    if (!timeLog || timeLog.technicianId !== userId) {
      return res.status(404).json({ message: 'Time log not found' })
    }

    if (timeLog.endTime) {
      return res.status(400).json({ message: 'Time log already stopped' })
    }

    const endTime = new Date()
    const duration = Math.floor((endTime - new Date(timeLog.startTime)) / 60000)

    const updatedTimeLog = await prisma.timeLog.update({
      where: { id },
      data: { endTime, duration, notes },
      include: { issue: { select: { title: true } }}
    })

    res.json(updatedTimeLog)
  } catch (error) {
    console.error('Error stopping time log:', error)
    res.status(500).json({ message: 'Failed to stop time log' })
  }
})

app.get('/api/time-logs/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const timeLogs = await prisma.timeLog.findMany({
      where: { technicianId: userId },
      orderBy: { createdAt: 'desc' },
      include: { issue: { select: { title: true, roomNumber: true, block: true } }}
    })

    res.json(timeLogs)
  } catch (error) {
    console.error('Error fetching time logs:', error)
    res.status(500).json({ message: 'Failed to fetch time logs' })
  }
})

app.get('/api/time-logs/active', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const activeLog = await prisma.timeLog.findFirst({
      where: { technicianId: userId, endTime: null },
      include: { issue: { select: { title: true } } }
    })

    res.json(activeLog)
  } catch (error) {
    console.error('Error fetching active time log:', error)
    res.status(500).json({ message: 'Failed to fetch active time log' })
  }
})

app.get('/api/time-logs/issue/:issueId', authenticateToken, async (req, res) => {
  try {
    const { issueId } = req.params;

    const timeLogs = await prisma.timeLog.findMany({
      where: { issueId },
      orderBy: { createdAt: 'desc' },
      include: { technician: { select: { name: true } } }
    })

    const totalDuration = timeLogs.reduce((sum, log) => sum + (log.duration || 0), 0)

    res.json({ timeLogs, totalDuration })
  } catch (error) {
    console.error('Error fetching issue time logs:', error)
    res.status(500).json({ message: 'Failed to fetch issue time logs' })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})