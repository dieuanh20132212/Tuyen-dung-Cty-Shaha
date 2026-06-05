/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Video, 
  Plus, 
  User, 
  Briefcase, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Star,
  Users
} from 'lucide-react';
import { Interview, Candidate, Job } from '../types';

interface InterviewProps {
  interviews: Interview[];
  candidates: Candidate[];
  jobs: Job[];
  onAddInterview: (int: Partial<Interview>) => Promise<void>;
  onUpdateInterviewStatus: (intId: string, status: 'Scheduled' | 'Completed' | 'Cancelled', reviewNotes?: string, rating?: number) => Promise<void>;
}

export default function InterviewView({ 
  interviews, 
  candidates, 
  jobs, 
  onAddInterview, 
  onUpdateInterviewStatus 
}: InterviewProps) {
  
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form parameters
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [type, setType] = useState<'HR' | 'Technical' | 'Culture' | 'Final'>('Technical');
  const [interviewer, setInterviewer] = useState('');

  // Editing rating parameters
  const [selectedForReview, setSelectedForReview] = useState<Interview | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewRating, setReviewRating] = useState(8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateId || !jobId || !dateTime || !interviewer) return;

    const cand = candidates.find(c => c.candidateId === candidateId);
    const job = jobs.find(j => j.jobId === jobId);

    if (!cand || !job) return;

    // Simulated Google Meet generation code
    const mockMeetId = Math.random().toString(36).substring(2, 5) + '-' + 
                        Math.random().toString(36).substring(2, 6) + '-' + 
                        Math.random().toString(36).substring(2, 5);
    const mockMeetLink = `https://meet.google.com/${mockMeetId}`;

    await onAddInterview({
      candidateId,
      candidateName: cand.name,
      jobId,
      jobTitle: job.title,
      dateTime,
      type,
      interviewer,
      meetingLink: mockMeetLink,
      status: 'Scheduled',
    });

    // Resetting forms
    setShowAddForm(false);
    setCandidateId('');
    setJobId('');
    setDateTime('');
    setInterviewer('');
  };

  const handleSaveReview = async () => {
    if (!selectedForReview) return;
    await onUpdateInterviewStatus(
      selectedForReview.interviewId, 
      'Completed', 
      reviewNotes, 
      reviewRating
    );
    setSelectedForReview(null);
    setReviewNotes('');
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in bg-slate-50 min-h-screen">
      
      {/* Top Banner and triggers */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Quản lý Lịch phỏng vấn (Google Calendar Sync)</h3>
          <p className="text-xs text-slate-400">Lên kế hoạch, tự động sinh link Google Meet phỏng vấn ứng viên trực tuyến, chấm điểm tổng kết phỏng vấn.</p>
        </div>

        <button
          type="button"
          id="btn-trigger-add-interview-modal"
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Đặt lịch hẹn phỏng vấn</span>
        </button>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl max-w-md w-full text-xs font-semibold text-slate-700">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Lên lịch hẹn phỏng vấn mới
              </h4>
              <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Select candidate */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Chọn ứng viên phỏng vấn *</label>
                <select
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  required
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                >
                  <option value="">-- Click để chọn ứng viên --</option>
                  {candidates.map((c) => (
                    <option key={c.candidateId} value={c.candidateId}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Select job */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1">Mục tiêu vị trí đối sánh *</label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  required
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                >
                  <option value="">-- Vị trí tuyển dụng --</option>
                  {jobs.map((j) => (
                    <option key={j.jobId} value={j.jobId}>{j.title}</option>
                  ))}
                </select>
              </div>

              {/* Date time picker */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Thời gian hẹn (UTC+7) *</label>
                <input 
                  type="datetime-local" 
                  value={dateTime} 
                  required
                  onChange={(e) => setDateTime(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                />
              </div>

              {/* Interview Type */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Hình thức vòng đấu (Stage Type)</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                >
                  <option value="HR">Vòng 1 - HR Sàng lọc sơ bộ</option>
                  <option value="Technical">Vòng 2 - Technical Trực diện kỹ thuật</option>
                  <option value="Culture">Vòng 3 - Văn hóa doanh nghiệp</option>
                  <option value="Final">Vòng 4 - Đàm phán Offers</option>
                </select>
              </div>

              {/* Interviewer */}
              <div>
                <label className="block text-[10px] text-slate-400 tracking-widest mb-1 font-bold uppercase">Họ tên Phỏng vấn viên (Assignee interviewer) *</label>
                <input 
                  type="text" 
                  required
                  value={interviewer} 
                  onChange={(e) => setInterviewer(e.target.value)} 
                  placeholder="Ví dụ: Team Lead Nguyen Van B"
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex space-x-3">
                <button
                  type="submit"
                  id="btn-schedule-meeting"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-600/10 cursor-pointer"
                >
                  Tạo sự kiện & Auto Meet
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Timeline layout columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Scheduled appointments (timeline list approach) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-2 space-y-6">
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
            <Users className="w-5 h-5 text-indigo-500" />
            Lộ trình sự kiện phỏng vấn sắp diễn ra ({interviews.length} buổi)
          </h4>

          <div className="space-y-4">
            {interviews.length > 0 ? (
              interviews.map((int) => {
                const dateObj = new Date(int.dateTime);
                const isSched = int.status === 'Scheduled';
                const isComp = int.status === 'Completed';
                const isCanc = int.status === 'Cancelled';
                
                return (
                  <div 
                    key={int.interviewId} 
                    id={`interview-card-${int.interviewId}`}
                    className={`p-4 border rounded-2xl flex flex-col sm:flex-row justify-between gap-4 transition items-start sm:items-center ${
                      isComp ? 'bg-slate-50/50 border-slate-150' : 'bg-white border-slate-100 shadow-xs'
                    }`}
                  >
                    <div className="space-y-2 flex-1">
                      
                      {/* Meta stage indicator type */}
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                          int.type === 'Technical' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          int.type === 'HR' ? 'bg-pink-50 text-pink-700 border border-pink-100' :
                          int.type === 'Culture' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          'bg-emerald-50 text-emerald-700 border border-emerald-100'
                        }`}>
                          {int.type} Round
                        </span>
                        
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          isSched ? 'bg-sky-50 text-sky-700 border border-sky-100' :
                          isComp ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {isSched ? 'Chờ phỏng vấn' : isComp ? 'Đã hoàn tất' : 'Hủy bỏ'}
                        </span>
                      </div>

                      {/* Header core candidates detail */}
                      <div>
                        <h5 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {int.candidateName}
                        </h5>
                        <p className="text-xs text-slate-500 font-medium">Đối sánh: {int.jobTitle}</p>
                      </div>

                      {/* Time elements */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-500">
                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {dateObj.toLocaleDateString('vi-VN')} {dateObj.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-sans">
                          HR: {int.interviewer}
                        </span>
                      </div>

                      {/* Google Meet link generators */}
                      {isSched && int.meetingLink && (
                        <div className="pt-2">
                          <a 
                            href={int.meetingLink} 
                            target="_blank" 
                            rel="referrer"
                            className="inline-flex items-center space-x-1.5 text-indigo-600 hover:text-indigo-800 text-xs font-bold font-mono transition"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Truy cập Google Meet</span>
                          </a>
                        </div>
                      )}

                    </div>

                    {/* Left Actions controls (cancel/grade note cards) */}
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      {isSched && (
                        <>
                          <button
                            type="button"
                            onClick={() => setSelectedForReview(int)}
                            className="px-2.5 py-1.5 bg-slate-900 border border-slate-900 text-white rounded-lg hover:opacity-90 transition flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Chấm điểm</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateInterviewStatus(int.interviewId, 'Cancelled')}
                            className="p-1 px-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition text-xs"
                          >
                            Hủy lịch
                          </button>
                        </>
                      )}

                      {isComp && (
                        <div className="text-right p-2.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-1">
                          <div className="flex items-center space-x-1 justify-end text-amber-500">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span className="font-bold text-[11px] font-mono text-slate-800">{int.rating}/10 điểm</span>
                          </div>
                          <p className="text-[10px] text-slate-500 max-w-[200px] leading-snug line-clamp-2">{int.reviewNotes || 'Không có ghi chú'}</p>
                        </div>
                      )}
                    </div>

                  </div>
                )
              })
            ) : (
              <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Calendar className="w-12 h-12 text-slate-300" />
                <h5 className="text-xs font-bold text-slate-700">Chưa xếp lịch phỏng vấn nào</h5>
                <p className="text-[11px] text-slate-400 max-w-sm">Chọn bấm "Đặt lịch hẹn phỏng vấn" ở góc phải hàng đỉnh để tổ chức cuộc hẹn kỹ thuật cho ứng viên quan trọng.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Mini evaluation rating module builder */}
        <div id="interview-eval-column" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-500" />
              Tổng kết phỏng vấn (Review Console)
            </h4>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2 py-0.5 rounded font-mono">EVALUATOR</span>
          </div>

          {selectedForReview ? (
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-150">
                <p className="text-[10px] uppercase text-slate-400 mb-1">Ứng viên chấm phiếu</p>
                <p className="font-bold text-slate-800 text-sm">{selectedForReview.candidateName}</p>
                <p className="text-[11px] text-slate-500 font-medium">Buổi: {selectedForReview.type} | Phỏng vấn bởi: {selectedForReview.interviewer}</p>
              </div>

              {/* Slider for grading from 0-10 */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider mb-2 font-bold flex justify-between">
                  <span>Khảo thí điểm số phỏng vấn (Rating Score)</span>
                  <span className="text-indigo-600 font-mono">{reviewRating}/10</span>
                </label>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={reviewRating} 
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full accent-indigo-600 appearance-none bg-slate-200 h-1 rounded-lg"
                />
              </div>

              {/* Text notes */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Biên bản nhận xét phỏng vấn kỹ thuật (Notes)</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="Điểm mạnh gì? Đạt chỉ tiêu tuyển dụng không? Lưu ý gì trong vòng sau..."
                  className="w-full h-28 p-2.5 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={handleSaveReview}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition flex items-center justify-center gap-1 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <span>Phê duyệt biểu điểm</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedForReview(null)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg font-semibold"
                >
                  Hủy bỏ
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center p-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-350" />
              <h6 className="text-[11px] font-bold text-slate-700">Chưa khởi tạo phiếu đánh giá</h6>
              <p className="text-[10px] text-slate-450 leading-relaxed max-w-[200px] mx-auto">Chọn click vào nút "Chấm điểm" màu đen bên cạnh lịch hẹn ở danh sách trung tâm để tổng hợp ghi chú kỹ thuật cho ứng viên.</p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
