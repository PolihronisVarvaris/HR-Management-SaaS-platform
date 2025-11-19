import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { ParticipantRole } from '@prisma/client';

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
      applicationId,
      title,
      description,
      startTime,
      endTime,
      location,
      participantIds = [], // Array of user IDs for interviewers/observers
    } = req.body;

    // Validate required fields
    if (!applicationId || !title || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields: applicationId, title, startTime, endTime' });
    }

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        candidate: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        job: {
          select: {
            title: true,
            department: true,
          },
        },
      },
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify participants exist if provided
    let participants: any[] = [];
    if (participantIds.length > 0) {
      participants = await prisma.user.findMany({
        where: {
          id: { in: participantIds },
        },
        include: {
          profile: true,
        },
      });

      if (participants.length !== participantIds.length) {
        return res.status(404).json({ error: 'One or more participants not found' });
      }
    }

    // Prepare participant data for creation
    const participantData: any[] = [
      // Add candidate as participant
      {
        candidateId: application.candidateId,
        role: ParticipantRole.CANDIDATE, // Use enum directly
      }
    ];

    // Add other participants as interviewers
    if (participants.length > 0) {
      participantData.push(
        ...participants.map(user => ({
          userId: user.id,
          role: ParticipantRole.INTERVIEWER as ParticipantRole, // Use enum with type assertion
        }))
      );
    }

    // Create the interview with participants
    const interview = await prisma.interview.create({
      data: {
        applicationId,
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        status: 'SCHEDULED',
        participants: {
          create: participantData,
        },
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
      candidateId: application.candidateId,
      candidateName: `${application.candidate.firstName} ${application.candidate.lastName}`,
      candidateEmail: application.candidate.email,
      applicationId: interview.applicationId,
      position: application.job?.title || 'N/A',
      department: application.job?.department || 'N/A',
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

    res.status(201).json({ data: formattedInterview });
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