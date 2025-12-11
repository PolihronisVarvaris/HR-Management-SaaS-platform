import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { CreateFormInput, UpdateFormInput } from '../types/forms';

export const FormController = {
  // Get all forms (with pagination)
  async getForms(req: Request, res: Response) {
    try {
      const { page = 1, limit = 10, jobId } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const where = {
        ...(jobId && { jobId: jobId as string }),
        isActive: true
      };

      const [forms, total] = await Promise.all([
        prisma.form.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            job: {
              select: {
                title: true
              }
            },
            _count: {
              select: {
                formResponses: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.form.count({ where })
      ]);

      res.json({
        forms,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch forms' });
    }
  },

  // Get form by ID
  async getForm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const form = await prisma.form.findUnique({
        where: { id },
        include: {
          job: {
            select: {
              title: true
            }
          }
        }
      });

      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }

      res.json(form);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch form' });
    }
  },

  // Create new form
  async createForm(req: Request, res: Response) {
    try {
      const { title, description, jobId, fields }: CreateFormInput = req.body;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Check if job already has a form
      if (jobId) {
        const existingForm = await prisma.form.findUnique({
          where: { jobId }
        });

        if (existingForm) {
          return res.status(400).json({ error: 'Job already has a form' });
        }
      }

      const form = await prisma.form.create({
        data: {
          title,
          description,
          jobId,
          fields,
          createdBy: userId
        }
      });

      res.status(201).json(form);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create form' });
    }
  },

  // Update form
  async updateForm(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates: UpdateFormInput = req.body;

      const form = await prisma.form.update({
        where: { id },
        data: updates
      });

      res.json(form);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update form' });
    }
  },

  // Delete form (soft delete)
  async deleteForm(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.form.update({
        where: { id },
        data: { isActive: false }
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete form' });
    }
  },

  // Submit form response
  async submitResponse(req: Request, res: Response) {
    try {
      const { formId } = req.params;
      const { answers, applicationId, candidateId } = req.body;

      const formResponse = await prisma.formResponse.create({
        data: {
          formId,
          answers,
          applicationId,
          candidateId
        }
      });

      res.status(201).json(formResponse);
    } catch (error) {
      res.status(500).json({ error: 'Failed to submit form response' });
    }
  },

  // Get form responses
  async getFormResponses(req: Request, res: Response) {
    try {
      const { formId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [responses, total] = await Promise.all([
        prisma.formResponse.findMany({
          where: { formId },
          skip,
          take: Number(limit),
          include: {
            application: {
              include: {
                candidate: true,
                job: {
                  select: {
                    title: true
                  }
                }
              }
            },
            candidate: true
          },
          orderBy: { submittedAt: 'desc' }
        }),
        prisma.formResponse.count({ where: { formId } })
      ]);

      res.json({
        responses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch form responses' });
    }
  }
};