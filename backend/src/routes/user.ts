// backend/src/routes/users.ts
import express from 'express';
import { authenticate } from '../middleware/auth';
import { prisma } from '../lib/db';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', authenticate, async (req, res) => {
  try {
    console.log('Fetching all users...');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        password: false,
        role: true,
        profile: {
          select: {
            id:false,
            firstName:true, 
            lastName:true,
            phone:true,     
            avatar:false,    
            createdAt:false, 
            updatedAt:false
          }
        },
        createdAt: true,
        updatedAt: true,
        notes:false,
        interviews:false,
        auditLogs:false,
        notifications:false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`Found ${users.length} users`);
    
    res.json({ 
      data: users, 
      success: true,
      pagination: {
        total: users.length,
        page: 1,
        limit: users.length,
        pages: 1
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      error: 'Failed to fetch users',
      success: false 
    });
  }
});

// GET /api/users/count - Get users count only
router.get('/count', authenticate, async (req, res) => {
  try {
    const count = await prisma.user.count();
    
    res.json({ 
      data: { count },
      success: true 
    });
  } catch (error) {
    console.error('Error counting users:', error);
    res.status(500).json({ 
      error: 'Failed to count users',
      success: false 
    });
  }
});

export default router;