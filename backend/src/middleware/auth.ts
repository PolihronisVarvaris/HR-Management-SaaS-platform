import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { AuthRequest } from '../types/auth';
import { prisma } from '../lib/db';



export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = verifyAccessToken(token);
      
      // Verify user still exists in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        include: { profile: true }
      });

      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      req.user = {
        userId: user.id,
        email: user.email,
        role: user.role
      };

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: allowedRoles,
        current: req.user.role
      });
    }

    next();
  };
};

// Specific role middlewares for convenience
export const requireHR = requireRole(['HR_EMPLOYEE', 'RECRUITMENT_ADMIN']);
export const requireAdmin = requireRole(['RECRUITMENT_ADMIN']);
export const requireHiringManager = requireRole(['HIRING_MANAGER', 'HR_EMPLOYEE', 'RECRUITMENT_ADMIN']);