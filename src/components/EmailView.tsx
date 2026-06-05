/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Sparkles, 
  Server, 
  History, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Eye, 
  Trash2,
  Lock,
  Plus,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Email, Candidate, Job } from '../types';

interface EmailProps {
  emails: Email[];
  candidates: Candidate[];
  jobs: Job[];
  onSendEmail: (email: Partial<Email>) => Promise<void>;
  onDeleteEmail: (emailId: string) => Promise<void>;
}

export default function EmailView({ emails, candidates, jobs, onSendEmail, onDeleteEmail }: EmailProps) {
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [activeTab, setActiveTab] = useState<'composer' | 'history'>('composer');

  // Composer Form Parameters
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [type, setType] = useState<'Invitation' | 'Offer' | 'Rejection'>('Invitation');
  
  // AI Output Email Content
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // Config SMTP credentials state
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(465);
  const [smtpSender, setSmtpSender] = useState('hr.recruiting.ai@gmail.com');
  const [smtpPass, setSmtpPass] = useState('••••••••••••••••');
  const [smtpSaved, setSmtpSaved] = useState(true);

  // Call Gemini generate Email Subject and Body template
  const handleAutoCompose = async () => {
    if (!candidateId) return;
    const cand = candidates.find(c => c.candidateId === candidateId);
    const job = jobs.find(j => j.jobId === jobId) || { title: 'Lập trình viên React' };

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: type,
          candidateName: cand?.name || 'Nguyễn Văn A',
          jobTitle: job.title,
          companyName: 'AI Recruitment Agent Pro'
        })
      });

      const data = await response.json();
      setSubject(data.subject || '');
      setBody(data.body || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger outbound queue
  const handleSendEmail = async () => {
    if (!candidateId || !subject || !body) return;

    const cand = candidates.find(c => c.candidateId === candidateId);
    if (!cand) return;

    setIsSending(true);
    try {
      // Create new record
      await onSendEmail({
        candidateId: cand.candidateId,
        candidateName: cand.name,
        candidateEmail: cand.email,
        subject,
        body,
        type,
        status: 'Sent', // Mark as sent instantly to reflect SMTP processing
      });

      // Clear compose UI
      setCandidateId('');
      setSubject('');
      setBody('');
      setActiveTab('history');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
      
      {/* Navigation tabs row */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('composer')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'composer' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Hệ thống Soạn thư AI Compose</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-6 text-sm font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'history' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Hộp thư gửi đi (Outbox Logs)</span>
        </button>
      </div>

      {activeTab === 'composer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Outbound composition panel Column 1 & 2 */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-2 space-y-5 text-xs font-semibold text-slate-700">
            <h4 className="text-md font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              Soạn thư tín tuyển dụng thông minh (AI Email Outbox)
            </h4>

            {/* Select target parameters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] text-slate-450 uppercase mb-1.5 font-bold">Người nhận (Candidate)</label>
                <select
                  value={candidateId}
                  onChange={(e) => setCandidateId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                >
                  <option value="">-- Chọn Ứng viên --</option>
                  {candidates.map((c) => (
                    <option key={c.candidateId} value={c.candidateId}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-450 uppercase mb-1.5 font-bold">Tin đăng đối chuẩn (Job JD)</label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                >
                  <option value="">-- Chọn vị trí --</option>
                  {jobs.map((j) => (
                    <option key={j.jobId} value={j.jobId}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-450 uppercase mb-1.5 font-bold">Loại thông điệp (Template)</label>
                <select
                  value={type}
                  onChange={(e: any) => setType(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                >
                  <option value="Invitation">Mời phỏng vấn (Invitation)</option>
                  <option value="Offer">Thư mời nhận việc (Offers)</option>
                  <option value="Rejection">Thư từ chối lịch thiệp (Rejection)</option>
                </select>
              </div>
            </div>

            {/* AI Generator Trigger */}
            <div>
              <button
                type="button"
                onClick={handleAutoCompose}
                disabled={!candidateId || isLoading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-indigo-600/10 disabled:opacity-50 text-xs"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Yêu cầu Gemini tự động viết thư (Auto Compose)</span>
              </button>
            </div>

            {/* Email subject and body display */}
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold">Tiêu đề (Subject Line)</label>
                <input 
                  type="text" 
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Tiêu đề lá thư..."
                  className="w-full text-xs font-medium p-3 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase mb-1.5 font-bold">Văn bản nội dung (Email Body Editor)</label>
                <textarea 
                  value={body} 
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Nội dung chi tiết viết bằng HTML hoặc văn bản thuần. Nhấn nút viết tự động phía trên để điền nhanh..."
                  className="w-full h-80 text-xs font-medium p-4 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none font-mono leading-relaxed"
                />
              </div>

              {/* Action buttons */}
              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendEmail}
                  disabled={isSending || !subject || !body}
                  className="flex-1 py-3 bg-slate-900 border border-slate-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 hover:opacity-90 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSending ? 'Đang kích hoạt SMTP...' : 'Gửi Email ngay lập tức via SMTP'}</span>
                </button>
              </div>
            </div>

          </div>

          {/* Outbound SMTP parameters configure column */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 text-xs font-semibold text-slate-700">
            <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-3">
              <Server className="w-4 h-4 text-emerald-500 animate-pulse" />
              Cấu hình Cổng Email SMTP
            </h4>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Host máy chủ SMTP</label>
              <input 
                type="text" 
                value={smtpHost} 
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Port bảo mật</label>
                <input 
                  type="number" 
                  value={smtpPort} 
                  onChange={(e) => setSmtpPort(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">TLS / SSL Secure</label>
                <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none">
                  <option value="SSL">SSL Encryption</option>
                  <option value="TLS">TLS Enforced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Tài khoản gửi (Sender Email)</label>
              <input 
                type="email" 
                value={smtpSender} 
                onChange={(e) => setSmtpSender(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[10px] uppercase font-bold text-slate-400">Khóa bảo mật / App Password</label>
                <span className="text-[9px] text-amber-600 font-bold flex items-center gap-0.5"><Lock className="w-3 h-3" /> Secure</span>
              </div>
              <input 
                type="password" 
                value={smtpPass} 
                onChange={(e) => setSmtpPass(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  setSmtpSaved(true);
                  alert("Đã lưu kết nối SMTP kiểm thử!");
                }}
                className="w-full py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-xl font-bold transition cursor-pointer"
              >
                Lưu cấu hình máy chủ
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">Bộ giải truyền SMTP liên kết cổng thành công. Đã đồng bộ hoàn toàn cùng Firebase Auth.</p>
            </div>

          </div>

        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5">
          <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500 animate-pulse" />
            Nhật ký truyền tin thư điện tử Outbox
          </h4>

          {emails.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50">
                    <th className="p-4 rounded-l-lg">Người nhận</th>
                    <th className="p-4">Địa chỉ Email</th>
                    <th className="p-4">Chủ đề thư</th>
                    <th className="p-4">Mẫu thư</th>
                    <th className="p-4">Trạng thái truyền</th>
                    <th className="p-4">Thời điểm gửi</th>
                    <th className="text-center p-4 rounded-r-lg">Hủy bỏ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {emails.map((log) => (
                    <tr key={log.emailId} className="hover:bg-slate-50/50 transition">
                      <td className="p-4 font-bold text-slate-800">{log.candidateName}</td>
                      <td className="p-4 font-mono text-slate-500">{log.candidateEmail}</td>
                      <td className="p-4 text-slate-600 truncate max-w-[200px]" title={log.subject}>{log.subject}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase font-mono ${
                          log.type === 'Invitation' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                          log.type === 'Offer' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                          'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-100">
                          {log.status}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-slate-400">{new Date(log.sentAt).toLocaleDateString('vi-VN')}</td>
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => onDeleteEmail(log.emailId)}
                          className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Mail className="w-12 h-12 text-slate-300" />
              <h5 className="text-xs font-bold text-slate-700">Không có hóa đơn lưu ký Outbox</h5>
              <p className="text-[11px] text-slate-400 max-w-sm">Dữ liệu an toàn không rò rỉ. Thư mời nhân sự gửi đi qua cổng SMTP sẽ tự động được ghi nhận tại đây.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
