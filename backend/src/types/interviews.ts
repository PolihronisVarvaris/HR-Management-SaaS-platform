export interface Interview {
  id: string;
  applicationId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  status: InterviewStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface InterviewWithParticipants extends Interview {
  participants: InterviewParticipant[];
  application: {
    job: {
      title: string;
      department: string;
      location?: string;
    };
    candidate: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
  };
}

export interface InterviewParticipant {
  id: string;
  interviewId: string;
  userId?: string;
  candidateId?: string;
  role: ParticipantRole;
  response?: InterviewResponse;
  user?: {
    id: string;
    email: string;
    role: string;
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
  candidate?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface CreateInterviewData {
  applicationId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  participantIds?: string[]; // User IDs for interviewers/observers
}

export interface UpdateInterviewData {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  location?: string;
  status?: InterviewStatus;
}

export interface FormattedInterview {
  id: string;
  candidateId?: string;
  candidateName: string;
  candidateEmail: string;
  candidatePhone?: string;
  applicationId: string;
  position: string;
  department: string;
  jobLocation?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  status: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
  interviewers: Array<{
    id?: string;
    name: string;
    email?: string;
    role?: string;
  }>;
  observers: Array<{
    id?: string;
    name: string;
    email?: string;
    role?: string;
  }>;
  allParticipants: Array<{
    id: string;
    role: string;
    response?: string;
    user: any;
    candidate: any;
  }>;
}

export enum InterviewStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum ParticipantRole {
  INTERVIEWER = 'INTERVIEWER',
  CANDIDATE = 'CANDIDATE',
  OBSERVER = 'OBSERVER',
}

export enum InterviewResponse {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  TENTATIVE = 'TENTATIVE',
}