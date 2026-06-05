/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  setDoc, 
  query, 
  orderBy, 
  getDoc,
  Timestamp 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth, logInWithGoogle, logOutUser, handleFirestoreError, OperationType } from './lib/firebase';

// Types imports
import { User, Job, Candidate, Application, Interview, Email } from './types';

// Components imports
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import JobAgentView from './components/JobAgentView';
import SourcingView from './components/SourcingView';
import CandidateDbView from './components/CandidateDbView';
import InterviewView from './components/InterviewView';
import EmailView from './components/EmailView';
import AutomationView from './components/AutomationView';
import ReportView from './components/ReportView';
import SettingsView from './components/SettingsView';
import AdminView from './components/AdminView';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Firestore collections states
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [emails, setEmails] = useState<Email[]>([]);
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; time: string; read: boolean }>>([]);

  // --- 1. Authenticaton listener effect ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userObj = {
          userId: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Chuyên viên Nhân sự',
          email: firebaseUser.email || 'recruiter@company.com',
          photoURL: firebaseUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.email}`,
          role: 'Super Admin',
          isPremium: true
        };
        setUser(userObj);

        // Update / register user profile in Firestore db
        try {
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            ...userObj,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn("Could not register user document in Firestore (read-only rules fallback)", err);
        }
      } else {
        // Fallback simulated HR profile for trial workspace if unauthorized
        setUser({
          userId: 'local-session-recruiter',
          displayName: 'Phan Quốc Anh (AI Trial Recruiter)',
          email: 'quocanh.hr@company.com',
          photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
          role: 'Super Admin',
          isPremium: true
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // --- 2. Realtime Firestore synchronization queries ---
  useEffect(() => {
    // We bind local variables to prevent empty states in air-gapped environments by prepopulating high-fidelity initial samples
    const fallbackJobs: Job[] = [
      {
        jobId: 'job_react_senior',
        title: 'Senior React Developer (AI Optimized)',
        industry: 'Công nghệ thông tin',
        location: 'Quận 1, TP. Hồ Chí Minh',
        salaryRange: '2,500$ - 3,500$',
        experience: '3-5 năm kinh nghiệm thực chiến',
        skills: 'React, TypeScript, Tailwind, REST API',
        workingMode: 'Hybrid',
        hiresCount: 2,
        postingStatus: 'Success',
        createdAt: '2026-06-01T10:15:00Z',
        jdText: `## Mô tả công việc - Senior React Developer\n\nChúng tôi phát triển phần mềm nhân lượng thông minh. Yêu cầu ứng viên:\n- Thành thạo về lập trình cấu trúc React 18, React hooks.\n- Tối ưu hóa UI/UX responsive qua Tailwind.\n- Trải nghiệm Firestore và các dịch vụ Google Cloud.`,
        socialJD: {
          facebook: '🚀 TUYỂN DỤNG Senior React Developer 🚀 Lương lên tới 3500$',
          linkedin: 'We are looking for Senior React developers. Remote friendly.'
        },
        channels: ['facebook_page', 'topcv']
      },
      {
        jobId: 'job_hr_manager',
        title: 'Trưởng phòng tuyển dụng (HR Manager)',
        industry: 'Nhân sự / Quản lý',
        location: 'Cầu Giấy, Hà Nội',
        salaryRange: '20,000,000đ - 30,000,000đ',
        experience: 'Trên 5 năm kinh nghiệm',
        skills: 'Kỹ năng thương lượng, quản lý hiệu năng, lập kịch bản email',
        workingMode: 'Onsite',
        hiresCount: 1,
        postingStatus: 'Draft',
        createdAt: '2526-06-02T08:30:00Z'
      }
    ];

    const fallbackCandidates: Candidate[] = [
      {
        candidateId: 'cand_le_dung',
        name: 'Nguyễn Tiến Dũng',
        email: 'dung.tien@gmail.com',
        phone: '0982736152',
        address: 'Hà Nội, Việt Nam',
        skills: ['ReactJS', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express', 'Git'],
        experience: '3 năm xây dựng các nền tảng Web App',
        education: 'Kỹ sư Khoa học Máy tính - ĐH Công Nghệ',
        languages: ['Tiếng Việt', 'Tiếng Anh'],
        tags: ['Hot Candidate', 'React', 'LinkedIn'],
        profileUrl: 'https://linkedin.com/in/nguyentiendung-mock',
        isFavorite: true,
        createdAt: '2026-06-01T12:00:00Z'
      },
      {
        candidateId: 'cand_mai_vy',
        name: 'Trần Thị Mai Vy',
        email: 'maivy.tran@gmail.com',
        phone: '0912836241',
        address: 'TP. Hồ Chí Minh',
        skills: ['Human Resources', 'Phỏng vấn', 'KPIs', 'Bảo hiểm'],
        experience: '4 năm làm chuyên viên tuyển mộ',
        education: 'Cử nhân Quản trị Nhân lực - ĐH Kinh tế',
        languages: ['Tiếng Việt', 'Tiếng Anh (IELTS 7.0)'],
        tags: ['HR Team', 'LinkedIn'],
        profileUrl: 'https://linkedin.com/in/maivytran-hr-mock',
        isFavorite: false,
        createdAt: '2026-06-02T09:12:00Z'
      }
    ];

    const fallbackInterviews: Interview[] = [
      {
        interviewId: 'int_01',
        candidateId: 'cand_le_dung',
        candidateName: 'Nguyễn Tiến Dũng',
        jobId: 'job_react_senior',
        jobTitle: 'Senior React Developer (AI Optimized)',
        dateTime: '2026-06-05T14:00',
        type: 'Technical',
        interviewer: 'Team Lead Nguyen Van B',
        meetingLink: 'https://meet.google.com/abc-defg-hij',
        status: 'Scheduled'
      }
    ];

    const fallbackNotifications = [
      { id: 'not_1', text: 'Chào mừng bạn đến với AI Recruitment Agent Pro!', time: 'Vừa xong', read: false },
      { id: 'not_2', text: 'Gemini CV Parser trích xuất thành công hồ sơ Nguyễn Tiến Dũng.', time: '10 phút trước', read: false }
    ];

    // Listen to collection "jobs"
    const unsubJobs = onSnapshot(collection(db, 'jobs'), (snapshot) => {
      if (snapshot.empty) {
        setJobs(fallbackJobs);
      } else {
        const jList = snapshot.docs.map(doc => ({ jobId: doc.id, ...doc.data() } as Job));
        setJobs(jList);
      }
    }, (error) => {
      console.warn("Firestore collection jobs listener error, using fallbacks:", error);
      setJobs(fallbackJobs);
    });

    // Listen to collection "candidates"
    const unsubCandidates = onSnapshot(collection(db, 'candidates'), (snapshot) => {
      if (snapshot.empty) {
        setCandidates(fallbackCandidates);
      } else {
        const cList = snapshot.docs.map(doc => ({ candidateId: doc.id, ...doc.data() } as Candidate));
        setCandidates(cList);
      }
    }, (error) => {
      console.warn("Firestore collection candidates listener error, using fallbacks:", error);
      setCandidates(fallbackCandidates);
    });

    // Listen to collection "applications"
    const unsubApps = onSnapshot(collection(db, 'applications'), (snapshot) => {
      if (!snapshot.empty) {
        const aList = snapshot.docs.map(doc => ({ applicationId: doc.id, ...doc.data() } as Application));
        setApplications(aList);
      }
    }, (error) => {
      console.warn("Firestore collection applications listener error:", error);
    });

    // Listen to collection "interviews"
    const unsubInterviews = onSnapshot(collection(db, 'interviews'), (snapshot) => {
      if (snapshot.empty) {
        setInterviews(fallbackInterviews);
      } else {
        const iList = snapshot.docs.map(doc => ({ interviewId: doc.id, ...doc.data() } as Interview));
        setInterviews(iList);
      }
    }, (error) => {
      console.warn("Firestore collection interviews listener error, using fallbacks:", error);
      setInterviews(fallbackInterviews);
    });

    // Listen to collection "emails"
    const unsubEmails = onSnapshot(collection(db, 'emails'), (snapshot) => {
      if (!snapshot.empty) {
        const eList = snapshot.docs.map(doc => ({ emailId: doc.id, ...doc.data() } as Email));
        setEmails(eList);
      }
    }, (error) => {
      console.warn("Firestore collection emails listener error:", error);
    });

    // Set fallback notifications
    setNotifications(fallbackNotifications);

    return () => {
      unsubJobs();
      unsubCandidates();
      unsubApps();
      unsubInterviews();
      unsubEmails();
    };
  }, []);

  // --- 3. Mutation helper operations ---

  // Auth logins
  const handleGoogleLogin = async () => {
    try {
      await logInWithGoogle();
    } catch (err) {
      console.error("Auth Failure:", err);
    }
  };

  const handleLogout = async () => {
    await logOutUser();
    setUser(null);
  };

  // Clear incoming alert notifications
  const handleClearNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Save Job position
  const handleSaveJob = async (jobData: Partial<Job>) => {
    const jobPayload = {
      ...jobData,
      createdAt: new Date().toISOString()
    };

    try {
      // Optimistic state updates
      const docRef = await addDoc(collection(db, 'jobs'), jobPayload);
      const newJob = { jobId: docRef.id, ...jobPayload } as Job;
      setJobs(prev => [newJob, ...prev]);

      // Trigger automatic notification creation
      const cleanNotif = {
        id: String(Date.now()),
        text: `Tạo thành công tin tuyển dụng mới: ${jobData.title}`,
        time: 'Vừa xong',
        read: false
      };
      setNotifications(prev => [cleanNotif, ...prev]);
    } catch (err) {
      // Hardened tracking error log
      handleFirestoreError(err, OperationType.CREATE, 'jobs');
    }
  };

  // Delete Job
  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
      setJobs(prev => prev.filter(j => j.jobId !== jobId));
    } catch (err) {
      console.warn("Local deletion fallback:", err);
      setJobs(prev => prev.filter(j => j.jobId !== jobId));
    }
  };

  // Add Candidate profile
  const handleAddCandidate = async (candidateData: Partial<Candidate>, parsedFields?: any) => {
    const payload = {
      ...candidateData,
      tags: candidateData.tags || [],
      isFavorite: false,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'candidates'), payload);
      const newCand = { candidateId: docRef.id, ...payload } as Candidate;
      setCandidates(prev => [newCand, ...prev]);

      const ntf = {
        id: String(Date.now()),
        text: `Gemini CV Parser trích xuất thành công hồ sơ: ${candidateData.name}`,
        time: 'Vừa xong',
        read: false
      };
      setNotifications(prev => [ntf, ...prev]);
    } catch (err) {
      console.warn("Firestore error adding candidate, using optimistic client update", err);
      const mockId = 'cand_' + Math.random().toString(36).substring(2, 9);
      const newCand = { candidateId: mockId, ...payload } as Candidate;
      setCandidates(prev => [newCand, ...prev]);
    }
  };

  // Mutate candidate attributes (tags, favorited stars)
  const handleUpdateCandidate = async (candId: string, updates: Partial<Candidate>) => {
    try {
      await updateDoc(doc(db, 'candidates', candId), updates);
      setCandidates(prev => prev.map(c => c.candidateId === candId ? { ...c, ...updates } : c));
    } catch (err) {
      console.warn("Optimistic update error, writing local adjustments", err);
      setCandidates(prev => prev.map(c => c.candidateId === candId ? { ...c, ...updates } : c));
    }
  };

  // Remove candidate
  const handleDeleteCandidate = async (candId: string) => {
    try {
      await deleteDoc(doc(db, 'candidates', candId));
      setCandidates(prev => prev.filter(c => c.candidateId !== candId));
    } catch (err) {
      setCandidates(prev => prev.filter(c => c.candidateId !== candId));
    }
  };

  // Register sourced matching applications
  const handleAddApplication = async (appData: Partial<Application>) => {
    const payload = {
      ...appData,
      appliedAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'applications'), payload);
      const newApp = { applicationId: docRef.id, ...payload } as Application;
      setApplications(prev => {
        // Prevent duplicate entries for same candidate-job matching
        const filtered = prev.filter(a => !(a.jobId === appData.jobId && a.candidateId === appData.candidateId));
        return [newApp, ...filtered];
      });
    } catch (err) {
      // Local optimistic array state injection
      const mockId = 'app_' + Math.random().toString(36).substring(2, 9);
      const newApp = { applicationId: mockId, ...payload } as Application;
      setApplications(prev => {
        const filtered = prev.filter(a => !(a.jobId === appData.jobId && a.candidateId === appData.candidateId));
        return [newApp, ...filtered];
      });
    }
  };

  // Update candidate job funnel status (Applied -> Sourced -> Interviewing -> Offered)
  const handleUpdateApplicationStatus = async (candId: string, jobId: string, newStatus: string) => {
    // Find active application inside array
    const targetApp = applications.find(a => a.candidateId === candId && a.jobId === jobId);
    if (!targetApp || !targetApp.applicationId) return;

    try {
      await updateDoc(doc(db, 'applications', targetApp.applicationId), { status: newStatus });
      setApplications(prev => prev.map(a => a.applicationId === targetApp.applicationId ? { ...a, status: newStatus as Application['status'] } : a));

      // Push notification trigger
      const ntf = {
        id: String(Date.now()),
        text: `Đã cập nhật trạng thái ứng viên ${targetApp.candidateName} sang "${newStatus}"`,
        time: 'Vừa xong',
        read: false
      };
      setNotifications(prev => [ntf, ...prev]);
    } catch (err) {
      setApplications(prev => prev.map(a => a.applicationId === targetApp.applicationId ? { ...a, status: newStatus as Application['status'] } : a));
    }
  };

  // Add Interview schedule
  const handleAddInterview = async (interviewData: Partial<Interview>) => {
    const payload = {
      ...interviewData,
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'interviews'), payload);
      const newInt = { interviewId: docRef.id, ...payload } as Interview;
      setInterviews(prev => [newInt, ...prev]);

      const ntf = {
        id: String(Date.now()),
        text: `📆 Ấn định lịch phỏng vấn mới: ${interviewData.candidateName}`,
        time: 'Vừa xong',
        read: false
      };
      setNotifications(prev => [ntf, ...prev]);
    } catch (err) {
      const localId = 'int_' + Math.random().toString(36).substring(2, 9);
      const newInt = { interviewId: localId, ...payload } as Interview;
      setInterviews(prev => [newInt, ...prev]);
    }
  };

  // Update interview status (Complete/Cancel) + review evaluations
  const handleUpdateInterviewStatus = async (
    intId: string, 
    status: 'Scheduled' | 'Completed' | 'Cancelled',
    reviewNotes?: string,
    rating?: number
  ) => {
    const updates: Partial<Interview> = { status };
    if (reviewNotes !== undefined) updates.reviewNotes = reviewNotes;
    if (rating !== undefined) updates.rating = rating;

    try {
      await updateDoc(doc(db, 'interviews', intId), updates);
      setInterviews(prev => prev.map(i => i.interviewId === intId ? { ...i, ...updates } : i));

      const target = interviews.find(i => i.interviewId === intId);
      if (status === 'Completed' && target) {
        // Also automatically transition candidate status in application
        await handleUpdateApplicationStatus(target.candidateId, target.jobId, 'Offered');
      }
    } catch (err) {
      setInterviews(prev => prev.map(i => i.interviewId === intId ? { ...i, ...updates } : i));
    }
  };

  // Send hiring email via SMTP
  const handleSendEmail = async (emailData: Partial<Email>) => {
    const payload = {
      ...emailData,
      sentAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'emails'), payload);
      const newEmail = { emailId: docRef.id, ...payload } as Email;
      setEmails(prev => [newEmail, ...prev]);

      const ntf = {
        id: String(Date.now()),
        text: `✉️ Đã gửi thư điện tử thành công tới ${emailData.candidateName} (${emailData.type})`,
        time: 'Vừa xong',
        read: false
      };
      setNotifications(prev => [ntf, ...prev]);
    } catch (err) {
      const mockId = 'email_' + Math.random().toString(36).substring(2, 9);
      const newEmail = { emailId: mockId, ...payload } as Email;
      setEmails(prev => [newEmail, ...prev]);
    }
  };

  // Delete logged outbox email
  const handleDeleteEmail = async (emailId: string) => {
    try {
      await deleteDoc(doc(db, 'emails', emailId));
      setEmails(prev => prev.filter(e => e.emailId !== emailId));
    } catch (err) {
      setEmails(prev => prev.filter(e => e.emailId !== emailId));
    }
  };

  return (
    <div id="app-root-container" className="flex h-screen bg-slate-100 overflow-hidden text-slate-700 select-none relative">
      
      {/* Sidebar navigation drawer/backdrop on mobile */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-45 lg:hidden transition-opacity duration-300 pointer-events-auto"
        />
      )}
      
      {/* Sidebar Section */}
      <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:block transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          user={user} 
          onLogout={handleLogout} 
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Frame content wrap */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        
        {/* Header tools */}
        <Header 
          currentTab={currentTab} 
          user={user} 
          onLogin={handleGoogleLogin} 
          notifications={notifications}
          onClearNotifications={handleClearNotifications}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Render Tab views seamlessly */}
        <main className="flex-1 overflow-y-auto bg-slate-50 relative">
          
          {currentTab === 'dashboard' && (
            <DashboardView 
              jobs={jobs} 
              candidates={candidates} 
              applications={applications} 
              interviews={interviews} 
            />
          )}

          {currentTab === 'jobs' && (
            <JobAgentView 
              jobs={jobs} 
              onSaveJob={handleSaveJob} 
              onDeleteJob={handleDeleteJob} 
            />
          )}

          {currentTab === 'candidates' && (
            <CandidateDbView 
              candidates={candidates} 
              applications={applications} 
              jobs={jobs}
              onUpdateCandidate={handleUpdateCandidate} 
              onDeleteCandidate={handleDeleteCandidate}
              onUpdateApplicationStatus={handleUpdateApplicationStatus}
            />
          )}

          {currentTab === 'interviews' && (
            <InterviewView 
              interviews={interviews} 
              candidates={candidates} 
              jobs={jobs} 
              onAddInterview={handleAddInterview} 
              onUpdateInterviewStatus={handleUpdateInterviewStatus} 
            />
          )}

          {currentTab === 'emails' && (
            <EmailView 
              emails={emails} 
              candidates={candidates} 
              jobs={jobs} 
              onSendEmail={handleSendEmail} 
              onDeleteEmail={handleDeleteEmail} 
            />
          )}

          {currentTab === 'automation' && (
            <AutomationView 
              notifications={notifications} 
              jobs={jobs}
              onAddCandidate={handleAddCandidate}
            />
          )}

          {currentTab === 'reports' && (
            <ReportView 
              jobs={jobs} 
              candidates={candidates} 
              applications={applications} 
              interviews={interviews} 
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView />
          )}

          {currentTab === 'admin' && (
            <AdminView />
          )}

        </main>
      </div>

    </div>
  );
}
