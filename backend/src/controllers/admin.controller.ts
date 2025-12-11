import { Response } from 'express';
import { prisma } from '../lib/db';
import { UserRole, NotificationType } from '@prisma/client';
import { AuthRequest } from '../types/auth';

export const adminController = {
  // Get system statistics
  async getSystemStats(req: AuthRequest, res: Response) {
    try {
      const [
        totalUsers,
        totalCandidates,
        totalJobs,
        totalApplications,
        totalInterviews,
        userStats,
        jobStats,
        applicationStats,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.candidate.count(),
        prisma.job.count(),
        prisma.application.count(),
        prisma.interview.count(),
        prisma.user.groupBy({
          by: ['role'],
          _count: {
            id: true,
          },
        }),
        prisma.job.groupBy({
          by: ['status'],
          _count: {
            id: true,
          },
        }),
        prisma.application.groupBy({
          by: ['status'],
          _count: {
            id: true,
          },
        }),
      ]);

      res.json({
        overview: {
          totalUsers,
          totalCandidates,
          totalJobs,
          totalApplications,
          totalInterviews,
        },
        userStats,
        jobStats,
        applicationStats,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch system statistics' });
    }
  },

  // Get all users with pagination
  async getUsers(req: AuthRequest, res: Response) {
    try {
      const { role, page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(role && { role: role as UserRole }),
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          include: {
            profile: true,
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Create a new user
  async createUser(req: AuthRequest, res: Response) {
    try {
      const { email, password, role, firstName, lastName, phone, avatar } = req.body;

      // In real application, hash the password before saving
      const user = await prisma.user.create({
        data: {
          email,
          password, // Should be hashed
          role: role as UserRole,
          profile: {
            create: {
              firstName,
              lastName,
              phone,
              avatar,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  // Update user role
  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      const user = await prisma.user.update({
        where: { id },
        data: {
          role: role as UserRole,
        },
        include: {
          profile: true,
        },
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  },

  // Delete user
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },

  // Get audit logs
  async getAuditLogs(req: AuthRequest, res: Response) {
    try {
      const { 
        resource, 
        userId, 
        startDate, 
        endDate, 
        page = 1, 
        limit = 50 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(resource && { resource: resource as string }),
        ...(userId && { userId: userId as string }),
        ...(startDate || endDate) && {
          createdAt: {
            ...(startDate && { gte: new Date(startDate as string) }),
            ...(endDate && { lte: new Date(endDate as string) }),
          },
        },
      };

      const [auditLogs, total] = await Promise.all([
        prisma.auditLog.findMany({
          where,
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.auditLog.count({ where }),
      ]);

      res.json({
        auditLogs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
  },

  // Get notifications
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      const { 
        type, 
        read, 
        userId, 
        candidateId,
        page = 1, 
        limit = 20 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      // Fix: Properly handle NotificationType enum
      const where: any = {
        ...(read !== undefined && { read: read === 'true' }),
        ...(userId && { userId: userId as string }),
        ...(candidateId && { candidateId: candidateId as string }),
      };

      // Handle type filtering with enum validation
      if (type) {
        const validTypes = Object.values(NotificationType);
        if (validTypes.includes(type as NotificationType)) {
          where.type = type as NotificationType;
        }
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          include: {
            user: {
              include: {
                profile: true,
              },
            },
            candidate: true,
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.notification.count({ where }),
      ]);

      res.json({
        notifications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notifications' });
    }
  },

  // Mark notification as read
  async markNotificationAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const notification = await prisma.notification.update({
        where: { id },
        data: {
          read: true,
        },
      });

      res.json(notification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark notification as read' });
    }
  },
};