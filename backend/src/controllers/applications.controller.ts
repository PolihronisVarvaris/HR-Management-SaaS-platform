import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { ApplicationStatus, ApplicationStage } from '@prisma/client';

export const applicationsController = {
  // Get all applications with filtering
  async getApplications(req: Request, res: Response) {
    try {
      const {
        status,
        stage,
        jobId,
        candidateId,
        page = 1,
        limit = 10,
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(status && { status: status as ApplicationStatus }),
        ...(stage && { stage: stage as ApplicationStage }),
        ...(jobId && { jobId: jobId as string }),
        ...(candidateId && { candidateId: candidateId as string }),
      };

      const [applications, total] = await Promise.all([
        prisma.application.findMany({
          where,
          include: {
            candidate: true,
            job: true,
            formResponse: true,
            notes: {
              include: {
                author: {
                  include: {
                    profile: true,
                  },
                },
              },
            },
            interviews: {
              include: {
                participants: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: {
            createdAt: 'desc',
          },
        }),
        prisma.application.count({ where }),
      ]);

      res.json({
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch applications' });
    }
  },

  // Get application by ID
  async getApplicationById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const application = await prisma.application.findUnique({
        where: { id },
        include: {
          candidate: true,
          job: true,
          formResponse: true,
          notes: {
            include: {
              author: {
                include: {
                  profile: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
          interviews: {
            include: {
              participants: {
                include: {
                  user: {
                    include: {
                      profile: true,
                    },
                  },
                  candidate: true,
                },
              },
            },
            orderBy: {
              startTime: 'asc',
            },
          },
        },
      });

      if (!application) {
        return res.status(404).json({ error: 'Application not found' });
      }

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch application' });
    }
  },

  // Create a new application
  async createApplication(req: Request, res: Response) {
    try {
      const { candidateId, jobId, status, stage } = req.body;

      // Check if application already exists
      const existingApplication = await prisma.application.findUnique({
        where: {
          candidateId_jobId: {
            candidateId,
            jobId,
          },
        },
      });

      if (existingApplication) {
        return res.status(400).json({ error: 'Application already exists' });
      }

      const application = await prisma.application.create({
        data: {
          candidateId,
          jobId,
          status: status || ApplicationStatus.APPLIED,
          stage: stage || ApplicationStage.APPLIED,
        },
        include: {
          candidate: true,
          job: true,
        },
      });

      res.status(201).json(application);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create application' });
    }
  },

  // Update application status
  async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, stage } = req.body;

      const application = await prisma.application.update({
        where: { id },
        data: {
          ...(status && { status }),
          ...(stage && { stage }),
        },
        include: {
          candidate: true,
          job: true,
        },
      });

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update application' });
    }
  },

  // Update application stage
  async updateApplicationStage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { stage } = req.body;

      const application = await prisma.application.update({
        where: { id },
        data: {
          stage,
        },
        include: {
          candidate: true,
          job: true,
        },
      });

      res.json(application);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update application stage' });
    }
  },

  // Delete application
  async deleteApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.application.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete application' });
    }
  },

  // Get application statistics
  async getApplicationStats(req: Request, res: Response) {
    try {
      const stats = await prisma.application.groupBy({
        by: ['status'],
        _count: {
          id: true,
        },
      });

      const stageStats = await prisma.application.groupBy({
        by: ['stage'],
        _count: {
          id: true,
        },
      });

      res.json({
        statusStats: stats,
        stageStats: stageStats,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch application statistics' });
    }
  },
};