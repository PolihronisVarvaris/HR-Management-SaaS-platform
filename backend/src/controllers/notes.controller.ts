import { Response } from 'express';
import { prisma } from '../lib/db';
import { NoteType } from '@prisma/client';
import { AuthRequest } from '../types/auth';

export const notesController = {
  // Get all notes for a candidate
  async getCandidateNotes(req: AuthRequest, res: Response) {
    try {
      const { candidateId } = req.params;
      const { type, applicationId } = req.query;

      const notes = await prisma.note.findMany({
        where: {
          candidateId,
          ...(type && { type: type as NoteType }),
          ...(applicationId && { applicationId: applicationId as string }),
        },
        include: {
          author: {
            include: {
              profile: true,
            },
          },
          application: {
            include: {
              job: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.json(notes);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch notes' });
    }
  },

  // Create a new note
  async createNote(req: AuthRequest, res: Response) {
    try {
      const { content, type, candidateId, applicationId, rating } = req.body;
      
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const authorId = req.user.userId; // Use userId instead of id

      const note = await prisma.note.create({
        data: {
          content,
          type: type || NoteType.PRIVATE,
          authorId,
          candidateId,
          applicationId,
          rating,
        },
        include: {
          author: {
            include: {
              profile: true,
            },
          },
        },
      });

      res.status(201).json(note);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create note' });
    }
  },

  // Update a note
  async updateNote(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { content, type, rating } = req.body;

      const note = await prisma.note.update({
        where: { id },
        data: {
          ...(content && { content }),
          ...(type && { type }),
          ...(rating && { rating }),
        },
        include: {
          author: {
            include: {
              profile: true,
            },
          },
        },
      });

      res.json(note);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update note' });
    }
  },

  // Delete a note
  async deleteNote(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      await prisma.note.delete({
        where: { id },
      });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete note' });
    }
  },
};