import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { JobStatus } from '@prisma/client';

export const jobsController = {
  // Get all jobs with filtering and pagination
  async getJobs(req: Request, res: Response) {
    try {
      const { 
        status, 
        department, 
        location, 
        page = 1, 
        limit = 10 
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(status && { status: status as JobStatus }),
        ...(department && { department: department as string }),
        ...(location && { location: location as string }),
      };

      const [jobs, total] = await Promise.all([
        prisma.job.findMany({
          where,
          include: {
            applications: {
              select: {
                id: true,
                status: true,
              },
            },
            form: true,
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.job.count({ where }),
      ]);

      res.json({
        jobs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch jobs' });
    }
  },

  // Get job by ID
  async getJobById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          applications: {
            include: {
              candidate: true,
            },
          },
          form: true,
        },
      });

      if (!job) {
        return res.status(404).json({ error: 'Job not found' });
      }

      res.json(job);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job' });
    }
  },

  // Create a new job
  async createJob(req: Request, res: Response) {
    try {
      const { title, description, department, location, status } = req.body;

      const job = await prisma.job.create({
        data: {
          title,
          description,
          department,
          location,
          status: status || JobStatus.DRAFT,
        },
      });

      res.status(201).json(job);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create job' });
    }
  },

  // Update a job
  async updateJob(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description, department, location, status } = req.body;

      const job = await prisma.job.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(description && { description }),
          ...(department && { department }),
          ...(location && { location }),
          ...(status && { status }),
        },
      });

      res.json(job);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update job' });
    }
  },

  // Publish a job
  async publishJob(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const job = await prisma.job.update({
        where: { id },
        data: {
          status: JobStatus.PUBLISHED,
          publishedAt: new Date(),
        },
      });

      res.json(job);
    } catch (error) {
      res.status(500).json({ error: 'Failed to publish job' });
    }
  },

  // Close a job
  async closeJob(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const job = await prisma.job.update({
        where: { id },
        data: {
          status: JobStatus.CLOSED,
        },
      });

      res.json(job);
    } catch (error) {
      res.status(500).json({ error: 'Failed to close job' });
    }
  },

  // Delete a job
  async deleteJob(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.job.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete job' });
    }
  },

  // Get job statistics
  async getJobStats(req: Request, res: Response) {
    try {
      const stats = await prisma.job.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      });

      const totalApplications = await prisma.application.count();

      res.json({
        jobStats: stats,
        totalApplications,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch job statistics' });
    }
  },
};