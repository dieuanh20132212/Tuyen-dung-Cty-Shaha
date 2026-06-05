/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserProfile {
  userId: string;
  email: string;
  displayName?: string;
  role: 'Super Admin' | 'Admin' | 'Recruiter' | 'HR Staff';
  photoURL?: string;
  createdAt?: string;
}

export interface Job {
  jobId: string;
  title: string;
  industry: string;
  location: string;
  salaryRange: string;
  experience: string;
  skills: string; // Comma separated raw skills
  workingMode: 'Onsite' | 'Remote' | 'Hybrid';
  hiresCount: number;
  jdText?: string; // Generated markdown full Job Description
  socialJD?: {
    facebook?: string;
    linkedin?: string;
    vietnamworks?: string;
    topcv?: string;
    seo?: string;
  };
  channels?: string[]; // Selected channels
  postingStatus: 'Draft' | 'Pending' | 'Success' | 'Failed';
  createdAt: string;
  createdBy?: string;
}

export interface Candidate {
  candidateId: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  languages?: string[];
  isFavorite?: boolean;
  tags?: string[];
  cvUrl?: string;
  cvName?: string;
  profileUrl?: string;
  createdAt: string;
}

export interface Application {
  applicationId: string;
  jobId: string;
  jobTitle?: string;
  candidateId: string;
  candidateName?: string;
  status: 'Applied' | 'Sourced' | 'Interviewing' | 'Offered' | 'Hired' | 'Rejected';
  matchingScore: number; // 0-100
  skillsMatch?: number;  // 0-100
  experienceMatch?: number; // 0-100
  salaryMatch?: number; // 0-100
  locationMatch?: number; // 0-100
  summary?: string;
  strengths?: string[];
  weaknesses?: string[];
  missingSkills?: string[];
  interviewQuestions?: string[];
  recommendation?: 'Excellent' | 'Good' | 'Average' | 'Poor';
  updatedAt: string;
}

export interface Interview {
  interviewId: string;
  jobId: string;
  jobTitle?: string;
  candidateId: string;
  candidateName: string;
  recruiterId?: string;
  date?: string;
  time?: string;
  dateTime: string;
  type: 'HR' | 'Technical' | 'Culture' | 'Final';
  interviewer: string;
  meetingLink?: string;
  platform?: 'Google Meet' | 'Microsoft Teams' | 'Zoom' | 'Office Onsite';
  status: 'Scheduled' | 'Completed' | 'Cancelled';
  invitationEmail?: string;
  reminderEmail?: string;
  calendarSync?: boolean;
  createdAt?: string;
  reviewNotes?: string;
  rating?: number;
}

export interface EmailLog {
  emailId: string;
  candidateId?: string;
  candidateName?: string;
  candidateEmail: string;
  subject: string;
  body: string;
  type: 'Invitation' | 'Rejection' | 'Offer' | 'Follow-up';
  sentAt?: string;
  status: 'Draft' | 'Pending' | 'Sent' | 'Failed';
}

export type User = UserProfile;
export type Email = EmailLog;

export interface ReportRecruit {
  reportId: string;
  title: string;
  type: 'Recruitment Report PDF' | 'Recruitment Report Excel' | 'Candidate Report' | 'Hiring Report';
  summary?: string;
  stats?: Record<string, number>;
  createdAt: string;
}

export interface SystemSettings {
  settingsId: string;
  smtpHost?: string;
  smtpPort?: string;
  smtpUser?: string;
  googleLoginEnabled?: boolean;
  autoSourcing?: boolean;
  updatedAt: string;
}
