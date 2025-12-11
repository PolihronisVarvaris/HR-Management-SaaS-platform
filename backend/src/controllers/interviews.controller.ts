import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { ParticipantRole } from '@prisma/client';
import { addMinutes } from 'date-fns';

export const getInterviews = async (req: Request, res: Response) => {
  try {
    const { date, status, interviewerId, candidateId } = req.query;
    
    const where: any = {};

    if (status) {
      where.status = status;
    }

    // Filter by interviewer (through participants)
    if (interviewerId) {
      where.participants = {
        some: {
          userId: interviewerId,
          role: 'INTERVIEWER'
        }
      };
    }

    // Filter by candidate (through participants OR application)
    if (candidateId) {
      where.OR = [
        {
          participants: {
            some: {
              candidateId: candidateId,
              role: 'CANDIDATE'
            }
          }
        },
        {
          application: {
            candidateId: candidateId
          }
        }
      ];
    }

    // Date filtering
    if (date) {
      const startDate = new Date(date as string);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      
      where.startTime = {
        gte: startDate,
        lt: endDate
      };
    }

    const interviews = await prisma.interview.findMany({
      where,
      include: {
        participants: {
          include: {
            candidate: {
              select: {
                id: true, // Added id
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            user: {
              include: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        application: {
          include: {
            job: {
              select: {
                title: true,
                department: true,
              },
            },
            candidate: {
              select: {
                id: true, // Added id
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Format the response to include all participants
    const formattedInterviews = interviews.map(interview => {
      // Get candidate from application (primary source)
      const applicationCandidate = interview.application?.candidate;
      
      // Find interviewer participants (users)
      const interviewers = interview.participants
        .filter(p => p.role === 'INTERVIEWER' && p.user)
        .map(p => ({
          id: p.user?.id,
          name: p.user?.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : 'Unknown User',
          email: p.user?.email,
          role: p.user?.role,
        }));

      // Find observer participants
      const observers = interview.participants
        .filter(p => p.role === 'OBSERVER' && p.user)
        .map(p => ({
          id: p.user?.id,
          name: p.user?.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : 'Unknown User',
          email: p.user?.email,
          role: p.user?.role,
        }));

      // Find candidate participant (if exists)
      const candidateParticipant = interview.participants.find(p => p.role === 'CANDIDATE');

      return {
        id: interview.id,
        title: interview.title,
        description: interview.description,
        startTime: interview.startTime,
        endTime: interview.endTime,
        status: interview.status,
        location: interview.location,
        createdAt: interview.createdAt,
        updatedAt: interview.updatedAt,
        
        // Candidate information (from application)
        candidateId: applicationCandidate?.id,
        candidateName: applicationCandidate 
          ? `${applicationCandidate.firstName} ${applicationCandidate.lastName}`
          : 'N/A',
        candidateEmail: applicationCandidate?.email || 'N/A',
        candidatePhone: applicationCandidate?.phone || 'N/A',
        
        // Application information
        applicationId: interview.applicationId,
        position: interview.application?.job?.title || 'N/A',
        department: interview.application?.job?.department || 'N/A',
        
        // Participants
        interviewers,
        observers,
        allParticipants: interview.participants.map(p => ({
          id: p.id,
          role: p.role,
          response: p.response,
          user: p.user ? {
            id: p.user.id,
            name: p.user.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : 'Unknown User',
            email: p.user.email,
            role: p.user.role,
          } : null,
          candidate: p.candidate ? {
            id: p.candidate.id,
            name: `${p.candidate.firstName} ${p.candidate.lastName}`,
            email: p.candidate.email,
          } : null,
        })),
      };
    });

    res.json({
      data: formattedInterviews,
      meta: {
        total: formattedInterviews.length,
      },
    });
  } catch (error) {
    console.error('Get interviews error:', error);
    res.status(500).json({ error: 'Failed to fetch interviews' });
  }
};

export const scheduleInterview = async (req: Request, res: Response) => {
  try {
    const {
      candidateId, // <--- Added: Frontend sends this
      applicationId,
      title, // Frontend sends "type" (e.g., VIDEO, PHONE), we can map to title
      description, // Frontend sends "notes"
      startTime, // We will construct this if date/time is sent
      endTime,
      date, // Frontend sends this
      time, // Frontend sends this
      duration, // Frontend sends this (int)
      participantIds = [],
      type, // Frontend sends 'VIDEO', 'PHONE', etc.
      location,
      meetingLink
    } = req.body;

    // 1. CALCULATE DATES
    // If frontend sends date/time/duration instead of ISO objects
    let finalStartTime: Date;
    let finalEndTime: Date;

    if (date && time && duration) {
      finalStartTime = new Date(`${date}T${time}:00`);
      finalEndTime = addMinutes(finalStartTime, duration);
    } else {
      finalStartTime = new Date(startTime);
      finalEndTime = new Date(endTime);
    }

    // 2. RESOLVE APPLICATION ID
    // If we only have candidateId, find their active application
    let finalApplicationId = applicationId;

    if (!finalApplicationId && candidateId) {
      const activeApplication = await prisma.application.findFirst({
        where: {
          candidateId: candidateId,
          status: { notIn: ['REJECTED', 'WITHDRAWN'] } // Find active app
        },
        orderBy: { createdAt: 'desc' }
      });

      if (!activeApplication) {
        return res.status(404).json({ error: 'No active application found for this candidate.' });
      }
      finalApplicationId = activeApplication.id;
    }

    if (!finalApplicationId) {
      return res.status(400).json({ error: 'Could not determine Application ID.' });
    }

    // 3. PREPARE PARTICIPANTS
    // Fetch users to ensure they exist
    let participants: any[] = [];
    if (participantIds.length > 0) {
      participants = await prisma.user.findMany({
        where: { id: { in: participantIds } }
      });
    }

    const participantData: any[] = [
      {
        candidateId: candidateId, // Use the candidateId resolved above
        role: 'CANDIDATE',
      }
    ];

    if (participants.length > 0) {
        participantData.push(
          ...participants.map(user => ({
            userId: user.id,
            role: 'INTERVIEWER',
          }))
        );
    }

    // 4. CREATE INTERVIEW
    // Map frontend "type" to title if title is missing
    const finalTitle = title || `${type} Interview`;
    
    // Combine location or meeting link
    const finalLocation = meetingLink || location || type;

    const interview = await prisma.interview.create({
      data: {
        applicationId: finalApplicationId,
        title: finalTitle,
        description: description || '',
        startTime: finalStartTime,
        endTime: finalEndTime,
        location: finalLocation,
        status: 'SCHEDULED',
        participants: {
          create: participantData,
        },
      },
      // ... existing include logic ...
    });

    res.status(201).json({ data: interview });
  } catch (error) {
    console.error('Schedule interview error:', error);
    res.status(500).json({ error: 'Failed to schedule interview' });
  }
};

export const getInterviewById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: { id },
      include: {
        participants: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
            user: {
              include: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        application: {
          include: {
            job: {
              select: {
                title: true,
                department: true,
                location: true,
              },
            },
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Format the response
    const formattedInterview = {
      id: interview.id,
      candidateId: interview.application?.candidateId,
      candidateName: interview.application?.candidate 
        ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`
        : 'N/A',
      candidateEmail: interview.application?.candidate?.email || 'N/A',
      candidatePhone: interview.application?.candidate?.phone || 'N/A',
      applicationId: interview.applicationId,
      position: interview.application?.job?.title || 'N/A',
      department: interview.application?.job?.department || 'N/A',
      jobLocation: interview.application?.job?.location || 'N/A',
      title: interview.title,
      description: interview.description,
      startTime: interview.startTime,
      endTime: interview.endTime,
      status: interview.status,
      location: interview.location,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      participants: interview.participants.map(p => ({
        id: p.id,
        role: p.role,
        response: p.response,
        user: p.user ? {
          id: p.user.id,
          name: p.user.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : 'Unknown User',
          email: p.user.email,
          role: p.user.role,
        } : null,
        candidate: p.candidate ? {
          id: p.candidate.id,
          name: `${p.candidate.firstName} ${p.candidate.lastName}`,
          email: p.candidate.email,
          phone: p.candidate.phone,
        } : null,
      })),
    };

    res.json({ data: formattedInterview });
  } catch (error) {
    console.error('Get interview by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch interview' });
  }
};

export const updateInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if interview exists
    const existingInterview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!existingInterview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Update the interview
    const interview = await prisma.interview.update({
      where: { id },
      data: updates,
      include: {
        participants: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            user: {
              include: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        application: {
          include: {
            job: {
              select: {
                title: true,
                department: true,
              },
            },
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedInterview = {
      id: interview.id,
      candidateId: interview.application?.candidateId,
      candidateName: interview.application?.candidate 
        ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`
        : 'N/A',
      candidateEmail: interview.application?.candidate?.email || 'N/A',
      applicationId: interview.applicationId,
      position: interview.application?.job?.title || 'N/A',
      department: interview.application?.job?.department || 'N/A',
      title: interview.title,
      description: interview.description,
      startTime: interview.startTime,
      endTime: interview.endTime,
      status: interview.status,
      location: interview.location,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      participants: interview.participants.map(p => ({
        id: p.id,
        role: p.role,
        response: p.response,
        user: p.user ? {
          id: p.user.id,
          name: p.user.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : 'Unknown User',
          email: p.user.email,
          role: p.user.role,
        } : null,
        candidate: p.candidate ? {
          id: p.candidate.id,
          name: `${p.candidate.firstName} ${p.candidate.lastName}`,
          email: p.candidate.email,
        } : null,
      })),
    };

    res.json({ data: formattedInterview });
  } catch (error) {
    console.error('Update interview error:', error);
    res.status(500).json({ error: 'Failed to update interview' });
  }
};

export const cancelInterview = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Check if interview exists
    const existingInterview = await prisma.interview.findUnique({
      where: { id },
    });

    if (!existingInterview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Update the interview status to CANCELLED
    const interview = await prisma.interview.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        description: existingInterview.description 
          ? `${existingInterview.description}\n\nCancelled: ${reason || 'No reason provided'}`
          : `Cancelled: ${reason || 'No reason provided'}`,
      },
      include: {
        participants: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            user: {
              include: {
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
        application: {
          include: {
            job: {
              select: {
                title: true,
                department: true,
              },
            },
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });

    // Format the response
    const formattedInterview = {
      id: interview.id,
      candidateId: interview.application?.candidateId,
      candidateName: interview.application?.candidate 
        ? `${interview.application.candidate.firstName} ${interview.application.candidate.lastName}`
        : 'N/A',
      candidateEmail: interview.application?.candidate?.email || 'N/A',
      applicationId: interview.applicationId,
      position: interview.application?.job?.title || 'N/A',
      department: interview.application?.job?.department || 'N/A',
      title: interview.title,
      description: interview.description,
      startTime: interview.startTime,
      endTime: interview.endTime,
      status: interview.status,
      location: interview.location,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
      participants: interview.participants.map(p => ({
        id: p.id,
        role: p.role,
        response: p.response,
        user: p.user ? {
          id: p.user.id,
          name: p.user.profile ? `${p.user.profile.firstName} ${p.user.profile.lastName}` : 'Unknown User',
          email: p.user.email,
          role: p.user.role,
        } : null,
        candidate: p.candidate ? {
          id: p.candidate.id,
          name: `${p.candidate.firstName} ${p.candidate.lastName}`,
          email: p.candidate.email,
        } : null,
      })),
    };

    res.json({ data: formattedInterview });
  } catch (error) {
    console.error('Cancel interview error:', error);
    res.status(500).json({ error: 'Failed to cancel interview' });
  }
};