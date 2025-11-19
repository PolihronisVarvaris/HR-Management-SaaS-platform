import { Request, Response } from 'express';
import { prisma } from '../lib/db';
import { FileStorageService } from '../services/fileStorage';
import { AuthRequest } from '../types/auth';
import { CreateCandidateProfile, UpdateCandidateProfile, CreateApplication, UpdateApplicationStatus, CandidateFilters } from '../types/candidate';
import { UserRole, ApplicationStatus, CV } from '@prisma/client';

export const getCandidateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const candidate = await prisma.candidate.findUnique({
      where: { email: req.user.email },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                department: true,
                location: true,
              }
            },
            formResponse: true,
            interviews: {
              include: {
                participants: {
                  include: {
                    user: {
                      select: {
                        profile: true
                      }
                    }
                  }
                }
              }
            },
            notes: {
              where: {
                type: 'PUBLIC'
              },
              include: {
                author: {
                  select: {
                    profile: true
                  }
                }
              }
            }
          }
        },
        cvs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    res.json({ candidate });
  } catch (error) {
    console.error('Get candidate profile error:', error);
    res.status(500).json({ error: 'Failed to get candidate profile' });
  }
};

export const updateCandidateProfile = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { firstName, lastName, phone, source }: UpdateCandidateProfile = req.body;

    const candidate = await prisma.candidate.update({
      where: { email: req.user.email },
      data: {
        firstName,
        lastName,
        phone,
        source,
      }
    });

    res.json({ candidate });
  } catch (error) {
    console.error('Update candidate profile error:', error);
    res.status(500).json({ error: 'Failed to update candidate profile' });
  }
};

export const uploadCV = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Validate file type
    const allowedMimeTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Only PDF and Word documents are allowed' });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({ error: 'File size must be less than 5MB' });
    }

    try {
      // Upload to file storage
      const uploadResult = await FileStorageService.uploadCV(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Save to database
      const cv = await prisma.cV.create({
        data: {
          filename: uploadResult.filename,
          fileUrl: uploadResult.fileUrl,
          fileSize: uploadResult.fileSize,
          mimeType: req.file.mimetype,
          candidate: {
            connect: { email: req.user.email }
          }
        }
      });

      res.status(201).json({ cv });
    } catch (fileError) {
      console.error('File storage error:', fileError);
      return res.status(503).json({ error: 'File storage service unavailable. Please try again later.' });
    }

  } catch (error) {
    console.error('CV upload error:', error);
    res.status(500).json({ error: 'Failed to upload CV' });
  }
};

export const getCVs = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const cvs = await prisma.cV.findMany({
      where: {
        candidate: {
          email: req.user.email
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Generate signed URLs for each CV
    const cvsWithUrls = await Promise.all(
      cvs.map(async (cv) => ({
        ...cv,
        downloadUrl: await FileStorageService.getCVUrl(cv.fileUrl)
      }))
    );

    res.json({ cvs: cvsWithUrls });
  } catch (error) {
    console.error('Get CVs error:', error);
    res.status(500).json({ error: 'Failed to get CVs' });
  }
};

export const applyForJob = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { jobId, formResponse }: CreateApplication = req.body;

    // Check if job exists and is published
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: 'PUBLISHED'
      }
    });

    if (!job) {
      return res.status(404).json({ error: 'Job not found or not published' });
    }

    // Check if already applied
    const existingApplication = await prisma.application.findFirst({
      where: {
        candidate: { email: req.user.email },
        jobId: jobId
      }
    });

    if (existingApplication) {
      return res.status(409).json({ error: 'Already applied to this job' });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        candidate: {
          connect: { email: req.user.email }
        },
        job: {
          connect: { id: jobId }
        },
        formResponse: formResponse ? {
          create: {
            form: {
              connect: { jobId: jobId }
            },
            answers: formResponse
          }
        } : undefined
      },
      include: {
        job: {
          select: {
            title: true,
            department: true,
            location: true
          }
        }
      }
    });

    // TODO: Send application confirmation email

    res.status(201).json({ application });
  } catch (error) {
    console.error('Job application error:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
};

export const getApplications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const applications = await prisma.application.findMany({
      where: {
        candidate: { email: req.user.email }
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            status: true
          }
        },
        interviews: {
          orderBy: {
            startTime: 'asc'
          },
          include: {
            participants: {
              include: {
                user: {
                  select: {
                    profile: true
                  }
                }
              }
            }
          }
        },
        notes: {
          where: {
            type: 'PUBLIC'
          },
          include: {
            author: {
              select: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
};

// HR-only endpoints
export const getCandidates = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== UserRole.HR_EMPLOYEE && req.user.role !== UserRole.RECRUITMENT_ADMIN)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { search, status, stage, jobId, page = 1, limit = 20 }: CandidateFilters = req.query;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const applicationsWhere: any = {};
    if (status) applicationsWhere.status = status;
    if (stage) applicationsWhere.stage = stage;
    if (jobId) applicationsWhere.jobId = jobId;

    if (Object.keys(applicationsWhere).length > 0) {
      where.applications = {
        some: applicationsWhere
      };
    }

    const [candidates, total] = await Promise.all([
      prisma.candidate.findMany({
        where,
        include: {
          applications: {
            include: {
              job: {
                select: {
                  title: true
                }
              }
            }
          },
          cvs: {
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          },
          _count: {
            select: {
              applications: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc'
        }
      }),
      prisma.candidate.count({ where })
    ]);

    res.json({
      candidates,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ error: 'Failed to get candidates' });
  }
};

export const getCandidateById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || (req.user.role !== UserRole.HR_EMPLOYEE && req.user.role !== UserRole.RECRUITMENT_ADMIN)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const { id } = req.params;

    const candidate = await prisma.candidate.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                department: true,
                location: true
              }
            },
            interviews: {
              include: {
                participants: {
                  include: {
                    user: {
                      select: {
                        profile: true
                      }
                    }
                  }
                }
              }
            },
            notes: {
              include: {
                author: {
                  select: {
                    profile: true
                  }
                }
              }
            }
          }
        },
        cvs: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    res.json({ candidate });
  } catch (error) {
    console.error('Get candidate by ID error:', error);
    res.status(500).json({ error: 'Failed to get candidate' });
  }
};