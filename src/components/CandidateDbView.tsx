/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Edit, 
  Eye, 
  Star, 
  Tag, 
  Download, 
  ChevronRight, 
  FileText, 
  Sparkles, 
  CheckCircle,
  TrendingUp,
  X,
  Plus,
  AlertCircle,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { Candidate, Application, Job } from '../types';

interface CandidateDbProps {
  candidates: Candidate[];
  applications: Application[];
  jobs: Job[];
  onUpdateCandidate: (candId: string, updates: Partial<Candidate>) => Promise<void>;
  onDeleteCandidate: (candId: string) => Promise<void>;
  onUpdateApplicationStatus: (candId: string, jobId: string, newStatus: string) => Promise<void>;
}

export default function CandidateDbView({ 
  candidates, 
  applications, 
  jobs,
  onUpdateCandidate, 
  onDeleteCandidate,
  onUpdateApplicationStatus
}: CandidateDbProps) {
  
  // Search parameters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filterFavorite, setFilterFavorite] = useState(false);

  // Selected candidate state for Detail Inspector modal
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [newTag, setNewTag] = useState('');

  // Copy states
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  const getResolvedProfileUrl = (name: string, originalUrl?: string) => {
    if (!originalUrl) return '';
    if (!originalUrl.includes('-mock')) {
      return originalUrl;
    }
    
    if (originalUrl.includes('linkedin.com')) {
      return `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(name)}`;
    }
    if (originalUrl.includes('github.com')) {
      return `https://github.com/search?q=${encodeURIComponent(name)}&type=users`;
    }
    if (originalUrl.includes('facebook.com')) {
      return `https://www.facebook.com/search/top/?q=${encodeURIComponent(name)}`;
    }
    return `https://www.google.com/search?q=${encodeURIComponent(name)}`;
  };

  // 1. Filter database matching criteria
  const filteredCandidates = candidates.filter(cand => {
    const query = searchTerm.toLowerCase();
    const nameMatch = cand.name.toLowerCase().includes(query);
    const skillMatch = cand.skills?.some(s => s.toLowerCase().includes(query)) || false;
    const tagMatch = cand.tags?.some(t => t.toLowerCase().includes(query)) || false;
    
    const matchesSearch = nameMatch || skillMatch || tagMatch;
    const matchesTag = selectedTag ? cand.tags?.includes(selectedTag) : true;
    const matchesFav = filterFavorite ? cand.isFavorite : true;

    return matchesSearch && matchesTag && matchesFav;
  });

  // Extract unique tags present in candidates database
  const allTags = Array.from(new Set(candidates.flatMap(c => c.tags || [])));

  // Find linked application for details scoring
  const getCandidateApplication = (candidateId: string): Application | undefined => {
    // Return latest application referencing this candidate
    return applications.find(a => a.candidateId === candidateId);
  };

  const handleToggleFavorite = async (cand: Candidate) => {
    await onUpdateCandidate(cand.candidateId, {
      isFavorite: !cand.isFavorite
    });
  };

  const handleAddTag = async (cand: Candidate) => {
    if (!newTag.trim()) return;
    const existingTags = cand.tags || [];
    if (!existingTags.includes(newTag.trim())) {
      const updated = [...existingTags, newTag.trim()];
      await onUpdateCandidate(cand.candidateId, { tags: updated });
    }
    setNewTag('');
  };

  const handleRemoveTag = async (cand: Candidate, tagToRemove: string) => {
    const existingTags = cand.tags || [];
    const updated = existingTags.filter(t => t !== tagToRemove);
    await onUpdateCandidate(cand.candidateId, { tags: updated });
  };

  const currentApp = selectedCandidate ? getCandidateApplication(selectedCandidate.candidateId) : undefined;
  const currentJob = currentApp ? jobs.find(j => j.jobId === currentApp.jobId) : undefined;

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in bg-slate-50 min-h-screen">
      
      {/* Header controls and filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Quản lý Hồ sơ Ứng viên (ATS Talent Table)</h3>
          <p className="text-xs text-slate-400">Xem lý lịch trích ngang, điểm matching, gắn nhãn phân đoạn ứng viên.</p>
        </div>

        {/* Global searching controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm theo tên, kỹ năng, nhãn..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none w-64 shadow-xs"
            />
          </div>

          <button
            type="button"
            onClick={() => setFilterFavorite(!filterFavorite)}
            className={`px-4 py-2.5 border rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
              filterFavorite ? 'border-amber-500 bg-amber-50/50 text-amber-600' : 'border-slate-200 bg-white text-slate-600'
            }`}
          >
            <Star className={`w-4 h-4 ${filterFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>Starred Favorites</span>
          </button>
        </div>
      </div>

      {/* Tags chips filter row */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> Lọc nhanh nhãn:</span>
          <button
            type="button"
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full transition ${!selectedTag ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
          >
            Tất cả
          </button>
          {allTags.map((t, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedTag(t)}
              className={`px-3 py-1 rounded-full transition ${selectedTag === t ? 'bg-indigo-600 text-white' : 'bg-white border border-slate-200 hover:bg-slate-50'}`}
            >
              #{t}
            </button>
          ))}
        </div>
      )}

      {/* Main Database Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50">
                <th className="p-4 w-12 text-center">Fav</th>
                <th className="p-4">Ứng viên / Liên hệ</th>
                <th className="p-4">Địa điểm</th>
                <th className="p-4">Kỹ năng đặc chủng</th>
                <th className="p-4">Điểm Matching</th>
                <th className="p-4">Vị trí đối sánh</th>
                <th className="p-4">Trạng thái tuyển</th>
                <th className="p-4 text-center">Tác vụ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCandidates.length > 0 ? (
                filteredCandidates.map((cand) => {
                  const linkedApp = getCandidateApplication(cand.candidateId);
                  return (
                    <tr key={cand.candidateId} className="hover:bg-slate-50/50 transition">
                      {/* Star Favorite */}
                      <td className="p-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleFavorite(cand)}
                          className="p-1 rounded-lg hover:bg-slate-100 transition"
                        >
                          <Star className={`w-4 h-4 ${cand.isFavorite ? 'fill-amber-500 text-amber-500' : 'text-slate-300'}`} />
                        </button>
                      </td>

                      {/* Name Details */}
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${cand.name}`} 
                            alt={cand.name} 
                            className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex-shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-950 block hover:text-indigo-600 cursor-pointer text-sm" onClick={() => setSelectedCandidate(cand)}>
                              {cand.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{cand.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-4 font-normal text-slate-500">{cand.address || 'Hải ngoại / Remote'}</td>

                      {/* Skills Tags */}
                      <td className="p-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {cand.skills?.slice(0, 4).map((sk, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-50/50 text-indigo-700 font-medium whitespace-nowrap">
                              {sk}
                            </span>
                          ))}
                          {(cand.skills?.length || 0) > 4 && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                              +{(cand.skills?.length || 0) - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* AI Score */}
                      <td className="p-4 font-mono font-bold text-center">
                        {linkedApp ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                              linkedApp.matchingScore >= 85 ? 'bg-indigo-600 text-white' :
                              linkedApp.matchingScore >= 70 ? 'bg-emerald-500 text-white' :
                              'bg-amber-500 text-white'
                            }`}>
                              {linkedApp.matchingScore}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-300 text-[10px] font-medium">— N/A</span>
                        )}
                      </td>

                      {/* Match Job */}
                      <td className="p-4 font-bold text-slate-700 truncate max-w-[130px]" title={linkedApp?.jobTitle}>
                        {linkedApp?.jobTitle || 'Chưa Sourcing'}
                      </td>

                      {/* Status select dropdown */}
                      <td className="p-4">
                        {linkedApp ? (
                          <select
                            value={linkedApp.status}
                            onChange={(e) => onUpdateApplicationStatus(cand.candidateId, linkedApp.jobId, e.target.value)}
                            className={`p-1 text-[10px] font-bold rounded-lg border focus:outline-none ${
                              linkedApp.status === 'Hired' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                              linkedApp.status === 'Interviewing' ? 'bg-indigo-50 border-indigo-200 text-indigo-800' :
                              linkedApp.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                              'bg-amber-50 border-amber-200 text-amber-800'
                            }`}
                          >
                            <option value="Sourced">Sourced</option>
                            <option value="Interviewing">Interviewing</option>
                            <option value="Offered">Offered</option>
                            <option value="Hired">Hired (Đồng Ý)</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">Chưa đối khớp</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedCandidate(cand)}
                            id={`btn-view-cand-${cand.candidateId}`}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                            title="Lý lịch chi tiết & CO-PILOT"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteCandidate(cand.candidateId)}
                            className="p-1 rounded bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                            title="Xóa ứng viên"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400 bg-white">
                    Không tìm thấy ứng viên tương hợp nào với bộ tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* IMMERSIVE CO-PILOT PROFILE ANALYTICS MODAL */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center space-x-3">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedCandidate.name}`} 
                  alt="avatar" 
                  className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100"
                />
                <div>
                  <h4 className="text-lg font-bold text-slate-900 flex items-center gap-1.5">
                    {selectedCandidate.name} 
                    {selectedCandidate.isFavorite && <Star className="w-4 h-4 fill-amber-500 text-amber-500" />}
                  </h4>
                  <p className="text-xs text-slate-500">Hồ sơ ứng viên | Mã lưu vết: {selectedCandidate.candidateId}</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedCandidate(null)}
                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Body Panel */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold">
              
              {/* Left Column: Traditional CV Extract */}
              <div className="space-y-6">
                
                {/* Contact information card */}
                <div className="space-y-3">
                  <h5 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold border-b border-slate-150 pb-1.5">Thông tin Lý lịch & Liên hệ</h5>
                  <div className="grid grid-cols-2 gap-4 text-slate-600">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Email</p>
                      <div className="flex items-center gap-2 mt-0.5 group">
                        <p className="font-sans font-medium text-slate-800 break-all">{selectedCandidate.email}</p>
                        <button
                          type="button"
                          onClick={() => handleCopyEmail(selectedCandidate.email)}
                          className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition cursor-pointer flex-shrink-0"
                          title="Sao chép Email"
                        >
                          {copiedEmail ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Số điện thoại</p>
                      <div className="flex items-center gap-2 mt-0.5 group">
                        <p className="font-sans font-medium text-slate-800">{selectedCandidate.phone || 'Không cung cấp'}</p>
                        {selectedCandidate.phone && (
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(selectedCandidate.phone)}
                            className="p-1 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 active:scale-95 transition cursor-pointer flex-shrink-0"
                            title="Sao chép Số điện thoại"
                          >
                            {copiedPhone ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Nơi ở hiện tại (Address)</p>
                      <p className="font-sans font-medium text-slate-800">{selectedCandidate.address || 'Hồ Chí Minh, Việt Nam'}</p>
                    </div>
                    {selectedCandidate.profileUrl && (
                      <div className="col-span-2 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex flex-col gap-1.5 justify-between">
                        <div>
                          <p className="text-[10px] text-indigo-500 uppercase font-extrabold flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            Trang cá nhân nguồn tuyển dụng
                          </p>
                          <a 
                            href={getResolvedProfileUrl(selectedCandidate.name, selectedCandidate.profileUrl)} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="font-sans font-black text-xs text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1.5 mt-1"
                            title={`Tìm kiếm trực tiếp hồ sơ '${selectedCandidate.name}' trên hệ thống`}
                          >
                            {selectedCandidate.profileUrl}
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        {selectedCandidate.profileUrl.includes('-mock') && (
                          <div className="text-[10.5px] text-amber-700 bg-amber-50/70 border border-amber-100 p-2 rounded-xl mt-1 leading-normal font-semibold">
                            ⚠️ <strong>Ghi chú Demo:</strong> Vì đây là môi trường mô phỏng (Sandbox) chưa có API Key doanh nghiệp chính thức, liên kết được tự động cấu hình để <strong>Tìm kiếm trực tiếp ứng viên '{selectedCandidate.name}'</strong> thực tế trên nền tảng nguồn nhằm giúp bạn tra cứu nhanh chóng.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience & Education */}
                <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-150">
                  <span className="font-bold font-mono text-[9px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">ATS Parser extraction Summary</span>
                  
                  <div className="space-y-3 mt-2 text-slate-600">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Nền tảng kinh nghiệm (Experience Extract)</p>
                      <p className="font-sans font-normal text-slate-700 leading-relaxed mt-1">{selectedCandidate.experience || 'Chưa trích xuất đầy đủ.'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Đào tạo học vấn (Education Extract)</p>
                      <p className="font-sans font-normal text-slate-700 leading-relaxed mt-1">{selectedCandidate.education || 'Đại học chuyển ngành Công nghệ.'}</p>
                    </div>
                  </div>
                </div>

                {/* Manual Tags Editor */}
                <div className="space-y-3">
                  <h5 className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">Nhãn Nhận diện của Recruiter</h5>
                  <div className="flex flex-wrap gap-2 items-center">
                    {selectedCandidate.tags?.map((t, tid) => {
                      const isPlatform = ['linkedin', 'facebook', 'github', 'twitter', 'sourced'].includes(t.toLowerCase());
                      const hasLink = isPlatform && selectedCandidate.profileUrl;

                      if (hasLink) {
                        return (
                          <span key={tid} className="flex items-center gap-1.5 text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100/80 border-indigo-200 text-indigo-700 pl-2.5 pr-1 py-1 rounded-full border transition duration-150 shadow-xs" title={selectedCandidate.profileUrl?.includes('-mock') ? `Tìm kiếm nhanh: ${selectedCandidate.name}` : `Đi tới liên kết: ${selectedCandidate.profileUrl}`}>
                            <a 
                              href={getResolvedProfileUrl(selectedCandidate.name, selectedCandidate.profileUrl)} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="hover:underline flex items-center gap-1 text-indigo-700 cursor-pointer"
                            >
                              #{t}
                              <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTag(selectedCandidate, t)} 
                              className="text-indigo-400 hover:text-indigo-900 font-black ml-1 cursor-pointer w-4 h-4 rounded-full flex items-center justify-center hover:bg-indigo-200 bg-transparent text-xs"
                              title="Xóa nhãn"
                            >
                              ×
                            </button>
                          </span>
                        );
                      }

                      return (
                        <span key={tid} className="flex items-center gap-1 text-[10px] font-bold bg-indigo-50 text-indigo-700 pl-2 pr-1 py-1 rounded-full border border-indigo-100 shadow-xs">
                          #{t}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTag(selectedCandidate, t)} 
                            className="text-indigo-400 hover:text-indigo-900 font-bold ml-1 cursor-pointer"
                            title="Xóa nhãn"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <input 
                      type="text" 
                      placeholder="Thêm nhãn, ví dụ: Intern, React, Hot Candidate..." 
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => { if(e.key === 'Enter') handleAddTag(selectedCandidate); }}
                      className="p-2 border border-slate-200 rounded-lg text-[11px] font-semibold text-slate-700 focus:outline-none flex-1"
                    />
                    <button 
                      type="button" 
                      onClick={() => handleAddTag(selectedCandidate)}
                      className="bg-slate-800 text-white rounded-lg p-2 text-[10px] font-bold"
                    >
                      Thêm
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Dynamic AI Co-Pilot Evaluation Analysis */}
              <div className="space-y-6 md:border-l md:pl-6 md:border-slate-100">
                <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                  <h5 className="text-[11px] uppercase tracking-wider text-indigo-600 font-bold flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                    Báo cáo Phân tích AI Gemini Co-Pilot
                  </h5>
                  {currentApp && (
                    <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200 px-1.5 py-0.5 rounded font-mono">
                      RECOMMENDATION: {currentApp.recommendation}
                    </span>
                  )}
                </div>

                {currentApp ? (
                  <div className="space-y-5">
                    
                    {/* Score Rings distributions */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-center text-[10px] font-mono leading-tight">
                      <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 text-indigo-800">
                        <p className="font-bold text-lg">{currentApp.matchingScore}%</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Matching</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded-xl border border-purple-100 text-purple-800">
                        <p className="font-bold text-lg">{currentApp.skillsMatch || 80}%</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Skills Fit</p>
                      </div>
                      <div className="p-2 bg-sky-50 rounded-xl border border-sky-100 text-sky-800">
                        <p className="font-bold text-lg">{currentApp.experienceMatch || 80}%</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">Experience</p>
                      </div>
                      <div className="p-2 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800">
                        <p className="font-bold text-lg">{currentApp.recommendation === 'Excellent' ? 'EX' : 'GD'}</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">AI Rating</p>
                      </div>
                    </div>

                    {/* AI Executive Summary */}
                    <div className="space-y-1.5 text-slate-600">
                      <p className="text-[10px] text-slate-450 uppercase font-black">AI Executive Summary</p>
                      <p className="font-sans text-xs text-slate-600 leading-relaxed font-medium">{currentApp.summary}</p>
                    </div>

                    {/* Strengths & Weaknesses list bullet */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="space-y-1.5 text-slate-600">
                        <p className="text-[10px] text-indigo-700 uppercase font-black">Điểm mạnh nổi bật (Strengths)</p>
                        <ul className="list-disc pl-3.5 space-y-1 font-sans text-xs">
                          {currentApp.strengths?.map((str, i) => (
                            <li key={i}>{str}</li>
                          )) || <li>Ứng viên có kỹ năng xử lý hệ thống tốt.</li>}
                        </ul>
                      </div>

                      <div className="space-y-1.5 text-slate-600">
                        <p className="text-[10px] text-rose-700 uppercase font-black">Góc rủi ro hạn chế (Weaknesses)</p>
                        <ul className="list-disc pl-3.5 space-y-1 font-sans text-xs text-slate-500">
                          {currentApp.weaknesses?.map((weak, i) => (
                            <li key={i}>{weak}</li>
                          )) || <li>Cần phỏng vấn thêm về kiến thức hạ tầng cloud.</li>}
                        </ul>
                      </div>

                    </div>

                    {/* Missing Skills tags */}
                    {currentApp.missingSkills && currentApp.missingSkills.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[10px] text-amber-700 uppercase font-black">Hố khuyết kỹ năng cần bù đắp (Missing Skills)</p>
                        <div className="flex flex-wrap gap-1 pt-1">
                          {currentApp.missingSkills.map((m, id) => (
                            <span key={id} className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-50 border border-amber-100 text-amber-800">
                              ✖ {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Targeted Interview script questions */}
                    {currentApp.interviewQuestions && currentApp.interviewQuestions.length > 0 && (
                      <div className="space-y-2 p-4 bg-slate-50 rounded-xl border border-slate-150">
                        <p className="text-[10px] text-slate-700 uppercase font-black">Bộ Câu Hỏi Phỏng Vấn Đặc Thù</p>
                        <p className="text-[9px] text-slate-400 font-sans italic leading-tight">Yêu cầu phỏng vấn viên dùng bộ câu hỏi hành vi dưới đây:</p>
                        <ol className="list-decimal pl-4 space-y-2 font-sans text-xs text-slate-700 sm:font-medium leading-relaxed mt-2">
                          {currentApp.interviewQuestions.map((q, qid) => (
                            <li key={qid} className="marker:text-indigo-600 marker:font-bold">{q}</li>
                          ))}
                        </ol>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-slate-300" />
                    <h6 className="text-[11px] font-bold text-slate-700">Chưa đối sánh Sourcing</h6>
                    <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">Hãy chuyển qua tab "Radar Sourcing" phía trước để thêm ứng viên này vào chiến dịch phỏng vấn của vị trí JD tương ứng trước khi Gemini tính toán báo cáo Co-Pilot.</p>
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
