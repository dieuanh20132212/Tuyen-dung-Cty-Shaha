/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Sparkles, 
  Save, 
  Send, 
  Globe, 
  Clock, 
  Briefcase, 
  FileText, 
  Share2, 
  Trash2, 
  ChevronRight, 
  Facebook, 
  Linkedin, 
  Send as TelegramIcon,
  Search,
  Check,
  AlertTriangle,
  Loader2,
  Download,
  Image
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Job } from '../types';

interface JobAgentProps {
  jobs: Job[];
  onSaveJob: (job: Partial<Job>) => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
}

export default function JobAgentView({ jobs, onSaveJob, onDeleteJob }: JobAgentProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [salaryRange, setSalaryRange] = useState('');
  const [experience, setExperience] = useState('');
  const [skills, setSkills] = useState('');
  const [workingMode, setWorkingMode] = useState<'Onsite' | 'Remote' | 'Hybrid'>('Onsite');
  const [hiresCount, setHiresCount] = useState(1);

  // AI Output states
  const [aiOutput, setAiOutput] = useState<{
    optimizedTitle?: string;
    jdText?: string;
    facebook?: string;
    linkedin?: string;
    vietnamworks?: string;
    topcv?: string;
    seo?: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'jd' | 'facebook' | 'linkedin' | 'boards' | 'seo' | 'banner'>('jd');
  const [bannerTheme, setBannerTheme] = useState<'indigo' | 'emerald' | 'slate' | 'rose'>('indigo');

  // Distribution channels selected
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduleTime, setScheduleTime] = useState('');

  const channelsList = [
    { id: 'facebook_page', name: 'Facebook Fanpage', icon: Facebook, color: 'bg-indigo-50 border-indigo-100 text-indigo-700' },
    { id: 'facebook_group', name: 'Facebook Groups (HR)', icon: Facebook, color: 'bg-blue-50 border-blue-100 text-blue-700' },
    { id: 'linkedin', name: 'LinkedIn Professional', icon: Linkedin, color: 'bg-sky-50 border-sky-100 text-sky-700' },
    { id: 'telegram', name: 'Telegram Job Channel', icon: TelegramIcon, color: 'bg-cyan-50 border-cyan-100 text-cyan-600' },
    { id: 'topcv', name: 'TopCV Vietnam', icon: Briefcase, color: 'bg-emerald-50 border-emerald-100 text-emerald-700' },
    { id: 'vietnamworks', name: 'VietnamWorks Agent', icon: Briefcase, color: 'bg-amber-50 border-amber-100 text-amber-700' }
  ];

  // Call backend to generate AI JD
  const handleGenerateJD = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          industry,
          location,
          salaryRange,
          experience,
          skills,
          workingMode,
          hiresCount
        })
      });

      const data = await response.json();
      setAiOutput(data);
      if (data.optimizedTitle) {
        setTitle(data.optimizedTitle); // Suggesting optimization
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleChannel = (chanId: string) => {
    if (selectedChannels.includes(chanId)) {
      setSelectedChannels(selectedChannels.filter(c => c !== chanId));
    } else {
      setSelectedChannels([...selectedChannels, chanId]);
    }
  };

  const handleSaveAndPublish = async (status: 'Draft' | 'Success') => {
    if (!title || !aiOutput) return;

    try {
      setIsLoading(true);
      await onSaveJob({
        title,
        industry,
        location,
        salaryRange,
        experience,
        skills,
        workingMode,
        hiresCount,
        jdText: aiOutput.jdText,
        socialJD: {
          facebook: aiOutput.facebook,
          linkedin: aiOutput.linkedin,
          vietnamworks: aiOutput.vietnamworks,
          topcv: aiOutput.topcv,
          seo: aiOutput.seo
        },
        channels: selectedChannels,
        postingStatus: status
      });

      // Reset
      setShowAddForm(false);
      setTitle('');
      setIndustry('');
      setSkills('');
      setSalaryRange('');
      setExperience('');
      setLocation('');
      setAiOutput(null);
      setSelectedChannels([]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPoster = () => {
    // 1. Create a dynamic canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to draw a rounded rect (compatible across all browsers)
    const drawRoundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
      c.beginPath();
      c.moveTo(x + r, y);
      c.lineTo(x + w - r, y);
      c.quadraticCurveTo(x + w, y, x + w, y + r);
      c.lineTo(x + w, y + h - r);
      c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      c.lineTo(x + r, y + h);
      c.quadraticCurveTo(x, y + h, x, y + h - r);
      c.lineTo(x, y + r);
      c.quadraticCurveTo(x, y, x + r, y);
      c.closePath();
    };

    // Helper to wrap text gracefully in canvas
    const wrapText = (c: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = c.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          c.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      c.fillText(line, x, currentY);
      return currentY;
    };

    // 2. Select Gradient Colors based on theme
    let grad = ctx.createLinearGradient(0, 0, 1200, 840);
    if (bannerTheme === 'indigo') {
      grad.addColorStop(0, '#1e1b4b'); // indigo-950
      grad.addColorStop(0.5, '#0f172a'); // slate-900
      grad.addColorStop(1, '#020617'); // slate-950
    } else if (bannerTheme === 'emerald') {
      grad.addColorStop(0, '#064e3b'); // emerald-950
      grad.addColorStop(0.5, '#022c22'); // stone-950
      grad.addColorStop(1, '#020617');
    } else if (bannerTheme === 'slate') {
      grad.addColorStop(0, '#0f172a'); // slate-900
      grad.addColorStop(0.5, '#1e293b'); // slate-800
      grad.addColorStop(1, '#020617');
    } else { // rose
      grad.addColorStop(0, '#881337'); // rose-950
      grad.addColorStop(0.5, '#4c0519'); // rose-900
      grad.addColorStop(1, '#020617');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 840);

    // 3. Grid design layout style
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 0; x < 1200; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 840);
      ctx.stroke();
    }
    for (let y = 0; y < 840; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1200, y);
      ctx.stroke();
    }

    // 4. Glowing Ambient Light Ball
    ctx.shadowBlur = 100;
    ctx.shadowColor = bannerTheme === 'indigo' ? '#6366f1' :
                     bannerTheme === 'emerald' ? '#10b981' :
                     bannerTheme === 'slate' ? '#94a3b8' :
                     '#f43f5e';
    ctx.fillStyle = bannerTheme === 'indigo' ? 'rgba(99, 102, 241, 0.15)' :
                    bannerTheme === 'emerald' ? 'rgba(16, 185, 129, 0.15)' :
                    bannerTheme === 'slate' ? 'rgba(148, 163, 184, 0.12)' :
                    'rgba(244, 63, 94, 0.15)';
    ctx.beginPath();
    ctx.arc(1000, 160, 180, 0, 2 * Math.PI);
    ctx.fill();
    ctx.shadowBlur = 0; // reset shadow

    // 5. Draw Header Badges
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    drawRoundRect(ctx, 80, 80, 220, 42, 8);
    ctx.fill();

    ctx.fillStyle = bannerTheme === 'indigo' ? '#a5b4fc' :
                    bannerTheme === 'emerald' ? '#6ee7b7' :
                    bannerTheme === 'slate' ? '#cbd5e1' :
                    '#fecdd3';
    ctx.font = 'bold 15px monospace';
    ctx.fillText('SHAHA RECRUITERS', 105, 106);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 13px system-ui, sans-serif';
    ctx.fillText('Hệ thống tuyển chọn nhân tài tự động', 80, 150);

    // Urgent recruitment card indicator on the right
    ctx.fillStyle = 'rgba(234, 179, 8, 0.14)';
    ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    drawRoundRect(ctx, 920, 80, 200, 42, 8);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 15px system-ui, sans-serif';
    ctx.fillText('🌟 TUYỂN DỤNG GẤP', 945, 106);

    // 6. Draw Content Title
    ctx.fillStyle = bannerTheme === 'indigo' ? '#818cf8' :
                    bannerTheme === 'emerald' ? '#34d399' :
                    bannerTheme === 'slate' ? '#94a3b8' :
                    '#fda4af';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('CHỨC DANH ĐANG SĂN TÌM', 80, 240);

    // Main Big Job Title Text
    const optimizedDisplayTitle = (aiOutput?.optimizedTitle || title || 'Vị trí mới').toUpperCase();
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px system-ui, sans-serif';
    wrapText(ctx, optimizedDisplayTitle, 80, 305, 1040, 62);

    // 7. Render dynamic metadata pills starting at Y=480
    const startY = 480;

    // Measure widths first
    const textLoc = `📍 Địa điểm: ${location || 'Hải văn / Toàn quốc'}`;
    const textMode = `💼 Chế độ: ${workingMode || 'Hybrid Office'}`;
    const textSal = `💰 Thu nhập: ${salaryRange || 'Lên tới 40M VND'}`;

    ctx.font = 'bold 16px system-ui, sans-serif';
    const locW = ctx.measureText(textLoc).width + 45;
    const modeW = ctx.measureText(textMode).width + 45;
    const salW = ctx.measureText(textSal).width + 45;

    // Draw pill backgrounds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    // Loc pill
    ctx.beginPath();
    drawRoundRect(ctx, 80, startY, locW, 46, 10);
    ctx.fill();

    // Mode pill
    ctx.beginPath();
    drawRoundRect(ctx, 80 + locW + 20, startY, modeW, 46, 10);
    ctx.fill();

    // Salary pill
    ctx.fillStyle = bannerTheme === 'emerald' ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255, 255, 255, 0.07)';
    ctx.beginPath();
    drawRoundRect(ctx, 80 + locW + 20 + modeW + 20, startY, salW, 46, 10);
    ctx.fill();

    // Write text inside pills
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(textLoc, 102, startY + 29);
    ctx.fillText(textMode, 80 + locW + 42, startY + 29);
    ctx.fillStyle = '#10b981'; // vibrant green
    if (bannerTheme === 'slate') ctx.fillStyle = '#cbd5e1';
    ctx.fillText(textSal, 80 + locW + 20 + modeW + 42, startY + 29);

    // 8. Draw horizontal line divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(80, 580);
    ctx.lineTo(1120, 580);
    ctx.stroke();

    // 9. Lower core technical requirements block
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('YÊU CẦU CỐT LÕI VỊ TRÍ', 80, 630);

    const skillsCleaned = skills || 'Tinh thần trách nhiệm cao, năng động, am hiểu quy trình nghiệp vụ chuyên môn.';
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 18px system-ui, sans-serif';
    wrapText(ctx, skillsCleaned, 80, 672, 700, 30);

    // 10. Bottom-right CTA Button
    const btnX = 840;
    const btnY = 625;
    ctx.fillStyle = bannerTheme === 'indigo' ? '#4f46e5' :
                    bannerTheme === 'emerald' ? '#059669' :
                    bannerTheme === 'slate' ? '#475569' :
                    '#e11d48';
    ctx.beginPath();
    drawRoundRect(ctx, btnX, btnY, 280, 64, 12);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('ỨNG TUYỂN NGAY  ✉', btnX + 40, btnY + 38);

    // Direct download action
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `Shaha_Poster_${(title || 'Viec_Lam').replace(/[^a-zA-Z0-9]/g, '_')}.png`;
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert("Xảy ra lỗi xuất file hình ảnh: " + e);
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in bg-slate-50 min-h-screen">
      {/* Search and Action Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-slate-800">Quản lý Tin Tuyển dụng (AI JD Assistant)</h3>
          <p className="text-xs text-slate-400">Xem danh sách, soạn thảo tin tuyển dụng tự động chuẩn SEO, chuẩn hóa mạng xã hội.</p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            id="btn-trigger-add-job-view"
            onClick={() => {
              setShowAddForm(true);
              setSelectedJob(null);
              setAiOutput(null);
            }}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tạo tin tuyển dụng (AI JD)</span>
          </button>
        )}
      </div>

      {showAddForm ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* Creation input form Column */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
            <h4 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-500" />
              Soạn thảo nhu cầu nhân lực
            </h4>
            
            <form onSubmit={handleGenerateJD} className="space-y-4 text-xs font-semibold text-slate-700">
              
              <div>
                <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Chức danh tuyển dụng (Job Title) *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required
                  placeholder="Ví dụ: Senior React Developer, Chuyên viên Content Marketing..."
                  className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Lĩnh vực (Industry)</label>
                  <input 
                    type="text" 
                    value={industry} 
                    onChange={(e) => setIndustry(e.target.value)} 
                    placeholder="Ví dụ: Công nghệ thông tin, HR, Marketing"
                    className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Địa điểm làm việc (Location)</label>
                  <input 
                    type="text" 
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)} 
                    placeholder="Ví dụ: Quận 1, Tp. Hồ Chí Minh"
                    className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Yêu cầu kinh nghiệm</label>
                  <input 
                    type="text" 
                    value={experience} 
                    onChange={(e) => setExperience(e.target.value)} 
                    placeholder="Ví dụ: 2-3 năm kinh nghiệm thực chiến"
                    className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Mức dung sai lương (Salary Bounds)</label>
                  <input 
                    type="text" 
                    value={salaryRange} 
                    onChange={(e) => setSalaryRange(e.target.value)} 
                    placeholder="Ví dụ: 15,000,000đ - 25,000,000đ"
                    className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Hình thức làm việc</label>
                  <select 
                    value={workingMode} 
                    onChange={(e: any) => setWorkingMode(e.target.value)}
                    className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  >
                    <option value="Onsite">Onsite (Tại văn phòng)</option>
                    <option value="Remote">Remote (Từ xa)</option>
                    <option value="Hybrid">Hybrid (Linh hoạt)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Chỉ tiêu tuyển (Headcount)</label>
                  <input 
                    type="number" 
                    value={hiresCount} 
                    onChange={(e) => setHiresCount(Number(e.target.value))} 
                    min={1}
                    className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider mb-1.5 font-bold">Tổng hợp kỹ năng cốt lõi</label>
                  <input 
                    type="text" 
                    value={skills} 
                    onChange={(e) => setSkills(e.target.value)} 
                    placeholder="ReactJS, Node.js, Git..."
                    className="w-full text-xs font-medium p-3 rounded-lg border border-slate-200 bg-slate-50 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  id="btn-job-agent-generate"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 hover:opacity-95 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{aiOutput ? 'Tạo lại văn bản (Regenerate)' : 'Yêu cầu AI viết JD'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="py-3 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Quay lại
                </button>
              </div>

            </form>

            {/* Step 2: Distribution channels selections */}
            {aiOutput && (
              <div className="border-t border-slate-100 pt-6 space-y-4">
                <h5 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-emerald-500" />
                  Kênh đăng tin và Xuất bản tự động
                </h5>
                <p className="text-[11px] text-slate-400">Chọn nhiều kênh tuyển dụng để AI gửi tự động nội dung tối ưu.</p>
                
                <div className="grid grid-cols-2 gap-3">
                  {channelsList.map((chan) => {
                    const isSel = selectedChannels.includes(chan.id);
                    const IconComp = chan.icon;
                    return (
                      <button
                        key={chan.id}
                        type="button"
                        onClick={() => handleToggleChannel(chan.id)}
                        className={`p-3 border rounded-xl flex items-center justify-between text-left transition text-xs font-semibold ${
                          isSel ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-500/10' : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComp className="w-4 h-4" />
                          <span>{chan.name}</span>
                        </div>
                        {isSel && <div className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[9px]"><Check className="w-3 h-3" /></div>}
                      </button>
                    );
                  })}
                </div>

                {/* Scheduling controls */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setIsScheduling(!isScheduling)}
                    className="flex items-center space-x-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition"
                  >
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Lên lịch tự động đăng bài?</span>
                  </button>
                  {isScheduling && (
                    <div className="mount-scheduler mt-2.5">
                      <input 
                        type="datetime-local" 
                        value={scheduleTime} 
                        onChange={(e) => setScheduleTime(e.target.value)}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}
                </div>

                {/* Submit distribution buttons */}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleSaveAndPublish('Success')}
                    id="btn-job-agent-publish"
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/10 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Xuất bản ngay lập tức</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSaveAndPublish('Draft')}
                    id="btn-job-agent-save-draft"
                    className="py-3 px-5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold flex items-center space-x-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu nháp</span>
                  </button>
                </div>

              </div>
            )}

          </div>

          {/* AI Output preview Column */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
            <h4 className="text-md font-bold text-slate-800 flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-pulse" />
              Kết quả tối ưu hóa đa kênh tin bởi Gemini AI
            </h4>

            {aiOutput ? (
              <div className="flex-1 flex flex-col overflow-hidden space-y-4">
                
                {/* Navigation inside tabs AI */}
                <div className="flex items-center overflow-x-auto whitespace-nowrap border-b border-slate-100 pb-1.5 gap-1 text-xs font-bold min-w-0">
                  <button
                    type="button"
                    onClick={() => setActiveTab('jd')}
                    className={`shrink-0 pb-2 px-3 border-b-2 transition ${activeTab === 'jd' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
                  >
                    Bản JD chuẩn
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('facebook')}
                    className={`shrink-0 pb-2 px-3 border-b-2 transition ${activeTab === 'facebook' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
                  >
                    Facebook Post
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('linkedin')}
                    className={`shrink-0 pb-2 px-3 border-b-2 transition ${activeTab === 'linkedin' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
                  >
                    LinkedIn Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('boards')}
                    className={`shrink-0 pb-2 px-3 border-b-2 transition ${activeTab === 'boards' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
                  >
                    VietnamWorks / TopCV
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className={`shrink-0 pb-2 px-3 border-b-2 transition ${activeTab === 'seo' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400'}`}
                  >
                    SEO version
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('banner')}
                    className={`shrink-0 pb-2 px-3 border-b-2 transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'banner' ? 'border-indigo-600 text-indigo-600 font-extrabold bg-indigo-50/50 rounded-t-lg' : 'border-transparent text-slate-400 hover:text-indigo-500'}`}
                  >
                    <Image className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                    <span className="text-indigo-600">✨ Ảnh tuyển dụng (Banner)</span>
                    <span className="text-[8px] bg-indigo-600 text-white px-1 py-0.2 rounded font-black uppercase tracking-wider scale-90">MỚI</span>
                  </button>
                </div>

                {/* Markdown renderer content box */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6 rounded-xl border border-slate-100 relative">
                  
                  {activeTab === 'jd' && (
                    <div className="prose prose-xs max-w-none text-slate-600 leading-relaxed font-sans scroll-smooth">
                      <div className="mb-4 pb-4 border-b border-slate-200">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-500 font-mono bg-rose-50 px-2 py-0.5 rounded border border-rose-100">AI Title Recommended</span>
                        <h1 className="text-lg font-extrabold text-slate-900 mt-1">{aiOutput.optimizedTitle}</h1>
                      </div>
                      <ReactMarkdown>{aiOutput.jdText || ""}</ReactMarkdown>
                    </div>
                  )}

                  {activeTab === 'facebook' && (
                    <div className="font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                      {aiOutput.facebook}
                    </div>
                  )}

                  {activeTab === 'linkedin' && (
                    <div className="font-sans text-xs text-slate-800 whitespace-pre-wrap leading-relaxed select-text">
                      {aiOutput.linkedin}
                    </div>
                  )}

                  {activeTab === 'boards' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <span className="font-mono font-bold text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">TOPCV LAYOUT</span>
                        <p className="text-xs text-slate-700 mt-2 whitespace-pre-wrap font-medium">{aiOutput.topcv}</p>
                      </div>
                      <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100">
                        <span className="font-mono font-bold text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">VIETNAMWORKS TEMPLATE</span>
                        <p className="text-xs text-slate-700 mt-2 whitespace-pre-wrap font-medium">{aiOutput.vietnamworks}</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'seo' && (
                    <div className="p-4 bg-slate-950 text-slate-100 rounded-xl font-mono text-xs whitespace-pre-wrap">
                      {aiOutput.seo}
                    </div>
                  )}

                  {activeTab === 'banner' && (
                    <div className="space-y-6 animate-fade-in text-slate-700">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div>
                          <h5 className="text-xs font-black text-slate-850 uppercase">Thiết kế quảng cáo tuyển dụng bởi Shaha AI</h5>
                          <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Một biểu mẫu banner hoàn thiện, tối ưu hóa màu sắc thương hiệu và thông số cấu hình.</p>
                        </div>
                        {/* Interactive toggle colors */}
                        <div className="flex gap-2 items-center">
                          <span className="text-[11px] text-slate-400 font-bold mr-1">Chủ đề:</span>
                          <button 
                            type="button"
                            onClick={() => setBannerTheme('indigo')}
                            className={`w-6 h-6 rounded-full bg-indigo-600 border-2 transition cursor-pointer ${bannerTheme === 'indigo' ? 'border-white ring-2 ring-indigo-500' : 'border-transparent'}`}
                            title="Xanh Indigo"
                          />
                          <button 
                            type="button"
                            onClick={() => setBannerTheme('emerald')}
                            className={`w-6 h-6 rounded-full bg-emerald-600 border-2 transition cursor-pointer ${bannerTheme === 'emerald' ? 'border-white ring-2 ring-emerald-500' : 'border-transparent'}`}
                            title="Xanh Lá"
                          />
                          <button 
                            type="button"
                            onClick={() => setBannerTheme('slate')}
                            className={`w-6 h-6 rounded-full bg-slate-900 border-2 transition cursor-pointer ${bannerTheme === 'slate' ? 'border-white ring-2 ring-slate-800' : 'border-transparent'}`}
                            title="Tối Slate"
                          />
                          <button 
                            type="button"
                            onClick={() => setBannerTheme('rose')}
                            className={`w-6 h-6 rounded-full bg-rose-600 border-2 transition cursor-pointer ${bannerTheme === 'rose' ? 'border-white ring-2 ring-rose-500' : 'border-transparent'}`}
                            title="Đỏ Rose"
                          />
                        </div>
                      </div>

                      {/* Actual Render Canvas Mockup box */}
                      <div 
                        id="recruitment-banner-canvas"
                        className={`max-w-lg mx-auto aspect-[1.4] rounded-2xl shadow-xl border p-8 flex flex-col justify-between text-white relative overflow-hidden transition-all duration-350 ${
                          bannerTheme === 'indigo' ? 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 border-indigo-800' :
                          bannerTheme === 'emerald' ? 'bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-950 border-emerald-800' :
                          bannerTheme === 'slate' ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-black border-slate-800' :
                          'bg-gradient-to-br from-rose-900 via-rose-950 to-slate-950 border-rose-800'
                        }`}
                      >
                        {/* Background subtle geometric decorations */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-x-12 -translate-y-12 blur-xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-x-12 translate-y-12 blur-2xl pointer-events-none" />

                        {/* Top Header */}
                        <div className="flex justify-between items-start z-10">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest font-mono font-black text-indigo-300 bg-white/10 px-2.5 py-1 rounded">
                              SHAHA RECRUITERS
                            </span>
                            <div className="text-[9px] text-slate-300 font-bold mt-1">Hệ thống tuyển chọn thông minh</div>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-yellow-300 bg-yellow-950/40 border border-yellow-500/30 px-2.5 py-1 rounded uppercase tracking-wider">
                            Tuyển dụng gấp 🌟
                          </span>
                        </div>

                        {/* Mid Title Details */}
                        <div className="space-y-3.5 z-10 my-4">
                          <p className="text-[10px] font-mono text-indigo-400 font-extrabold uppercase tracking-widest">CHỨC DANH ĐANG SĂN TÌM</p>
                          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight uppercase tracking-tight break-words drop-shadow-md">
                            {aiOutput.optimizedTitle || title || 'Vị trí trống'}
                          </h2>
                          <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-200 pt-1">
                            <span className="bg-white/10 border border-white/5 px-2.5 py-1 rounded-lg">📍 {location || 'Hành chính'}</span>
                            <span className="bg-white/10 border border-white/5 px-2.5 py-1 rounded-lg">💼 {workingMode || 'Hybrid'}</span>
                            <span className="bg-white/10 border border-white/5 px-2.5 py-1 rounded-lg text-emerald-300 font-black">💰 {salaryRange || 'Thỏa thuận'}</span>
                          </div>
                        </div>

                        {/* Requirements and Footer */}
                        <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 z-10">
                          <div>
                            <span className="text-[9px] text-slate-400 uppercase font-black tracking-widest block">YÊU CẦU CỐT LÕI VỊ TRÍ</span>
                            <p className="text-[10px] text-slate-200 font-semibold line-clamp-1 mt-0.5">
                              {skills || 'Sử dụng thuần thục các kỹ thuật chuyên môn.'}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-1.5 self-end sm:self-auto bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl border border-white/10 transition cursor-pointer text-xs font-black text-white whitespace-nowrap">
                            <Send className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Ứng tuyển ngay</span>
                          </div>
                        </div>
                      </div>

                      {/* Export tools */}
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button 
                          type="button"
                          onClick={handleDownloadPoster}
                          className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black px-5 py-2.5 rounded-xl transition shadow-md shadow-indigo-650/15 cursor-pointer flex items-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          <span>Tải ảnh Poster (PNG)</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => {
                            alert("Đã tạo đường dẫn mã nhúng chia sẻ trực tiếp tới ứng viên!");
                          }}
                          className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Share2 className="w-4 h-4 text-slate-400" />
                          <span>Mã nhúng nhúng CDN</span>
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                {isLoading ? (
                  <div className="space-y-3">
                    <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-slate-600">Gemini Agent đang trích xuất mục tiêu và tạo bản JD chuẩn tối ưu...</p>
                    <p className="text-[10px] text-slate-400 font-mono">Đồng phát triển cùng aistudio-build...</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-w-sm">
                    <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
                    <h5 className="text-xs font-bold text-slate-700">Chờ lệnh soạn thảo dữ liệu</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">Hãy điền các thuộc tính công việc từ panel bên trái và ấn nút "AI viết JD" để tự động soạn thảo tất cả biểu mẫu kênh phân phát tuyển dụng.</p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Job Posting Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <div 
                  key={job.jobId} 
                  id={`job-card-${job.jobId}`}
                  onClick={() => setSelectedJob(job)}
                  className={`bg-white rounded-2xl border transition duration-200 cursor-pointer p-6 flex flex-col h-64 justify-between relative ${
                    selectedJob?.jobId === job.jobId ? 'border-indigo-500 ring-2 ring-indigo-500/10' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        job.postingStatus === 'Success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {job.postingStatus === 'Success' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    <div>
                      <h4 className="text-md font-bold text-slate-800 line-clamp-1">{job.title}</h4>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <span>{job.industry}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-[10px] px-2 py-0.5 font-medium rounded bg-slate-100 text-slate-600 capitalize">
                        Model: {job.workingMode}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 font-medium rounded bg-indigo-50 text-indigo-700">
                        Lương: {job.salaryRange}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 font-medium rounded bg-violet-50 text-violet-700">
                        Chỉ tiêu: {job.hiresCount} người
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                    <div className="flex -space-x-1 overflow-hidden">
                      {job.channels?.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border border-white flex items-center justify-center text-[9px] text-slate-600 font-bold capitalize" title={c}>
                          {c.charAt(0)}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteJob(job.jobId);
                        if (selectedJob?.jobId === job.jobId) setSelectedJob(null);
                      }}
                      className="p-1.5 rounded bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      title="Xóa tin này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white border border-slate-200/90 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
                <Briefcase className="w-12 h-12 text-slate-300" />
                <h5 className="text-sm font-bold text-slate-700">Chưa có vị trí công việc nào được tạo</h5>
                <p className="text-xs text-slate-400 max-w-sm">Bấm "Tạo tin tuyển dụng" ở góc trên cùng bên phải để yêu cầu Gemini AI tư vấn JD chuẩn nghiệp vụ.</p>
              </div>
            )}
          </div>

          {/* Expanded Job Detail Sidebar Preview */}
          {selectedJob && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm animate-slide-up">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                <div>
                  <h4 className="text-md font-bold text-slate-800">{selectedJob.title}</h4>
                  <p className="text-xs text-slate-400">Xem văn bản phân phối đầy đủ vị trí</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedJob(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                >
                  Đóng lại
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-96 overflow-y-auto">
                <div className="prose prose-xs bg-slate-50 p-6 rounded-xl border border-slate-100">
                  <span className="font-bold font-mono text-[9px] px-2 py-0.5 rounded bg-slate-200 text-slate-600">JOB DESCRIPTION (JD TEXT)</span>
                  <div className="mt-3 text-xs text-slate-700 leading-relaxed">
                    <ReactMarkdown>{selectedJob.jdText || ""}</ReactMarkdown>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs">
                    <span className="font-bold text-[9px] text-indigo-700 uppercase font-mono">Facebook Distribution Post</span>
                    <p className="mt-2 whitespace-pre-wrap font-medium">{selectedJob.socialJD?.facebook || 'Không cấu hình'}</p>
                  </div>
                  <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs">
                    <span className="font-bold text-[9px] text-sky-700 uppercase font-mono">LinkedIn Channel Post</span>
                    <p className="mt-2 whitespace-pre-wrap font-medium">{selectedJob.socialJD?.linkedin || 'Không cấu hình'}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 1200;
                        canvas.height = 840;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;

                        const drawRoundRect = (c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
                          c.beginPath();
                          c.moveTo(x + r, y);
                          c.lineTo(x + w - r, y);
                          c.quadraticCurveTo(x + w, y, x + w, y + r);
                          c.lineTo(x + w, y + h - r);
                          c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                          c.lineTo(x + r, y + h);
                          c.quadraticCurveTo(x, y + h, x, y + h - r);
                          c.lineTo(x, y + r);
                          c.quadraticCurveTo(x, y, x + r, y);
                          c.closePath();
                        };

                        const wrapText = (c: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
                          const words = text.split(' ');
                          let line = '';
                          let currentY = y;
                          for (let n = 0; n < words.length; n++) {
                            const testLine = line + words[n] + ' ';
                            const metrics = c.measureText(testLine);
                            const testWidth = metrics.width;
                            if (testWidth > maxWidth && n > 0) {
                              c.fillText(line, x, currentY);
                              line = words[n] + ' ';
                              currentY += lineHeight;
                            } else {
                              line = testLine;
                            }
                          }
                          c.fillText(line, x, currentY);
                          return currentY;
                        };

                        let grad = ctx.createLinearGradient(0, 0, 1200, 840);
                        grad.addColorStop(0, '#1e1b4b');
                        grad.addColorStop(0.5, '#0f172a');
                        grad.addColorStop(1, '#020617');
                        ctx.fillStyle = grad;
                        ctx.fillRect(0, 0, 1200, 840);

                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
                        ctx.lineWidth = 1;
                        for (let lx = 0; lx < 1200; lx += 60) {
                          ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx, 840); ctx.stroke();
                        }
                        for (let ly = 0; ly < 840; ly += 60) {
                          ctx.beginPath(); ctx.moveTo(0, ly); ctx.lineTo(1200, ly); ctx.stroke();
                        }

                        ctx.shadowBlur = 100;
                        ctx.shadowColor = '#6366f1';
                        ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
                        ctx.beginPath(); ctx.arc(1000, 160, 180, 0, 2 * Math.PI); ctx.fill();
                        ctx.shadowBlur = 0;

                        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
                        drawRoundRect(ctx, 80, 80, 220, 42, 8); ctx.fill();
                        ctx.fillStyle = '#a5b4fc';
                        ctx.font = 'bold 15px monospace';
                        ctx.fillText('SHAHA RECRUITERS', 105, 106);

                        ctx.fillStyle = '#94a3b8';
                        ctx.font = '500 13px system-ui, sans-serif';
                        ctx.fillText('Hệ thống tuyển chọn nhân tài tự động', 80, 150);

                        ctx.fillStyle = 'rgba(234, 179, 8, 0.14)';
                        ctx.strokeStyle = 'rgba(234, 179, 8, 0.35)';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath(); drawRoundRect(ctx, 920, 80, 200, 42, 8); ctx.fill(); ctx.stroke();
                        ctx.fillStyle = '#facc15'; ctx.font = 'bold 15px system-ui, sans-serif';
                        ctx.fillText('🌟 TUYỂN DỤNG GẤP', 945, 106);

                        ctx.fillStyle = '#818cf8';
                        ctx.font = 'bold 16px monospace';
                        ctx.fillText('CHỨC DANH ĐANG SĂN TÌM', 80, 240);

                        ctx.fillStyle = '#ffffff';
                        ctx.font = '900 48px system-ui, sans-serif';
                        wrapText(ctx, selectedJob.title.toUpperCase(), 80, 305, 1040, 62);

                        const startY = 480;
                        const textLoc = `📍 Địa điểm: ${selectedJob.location || 'Hành chính'}`;
                        const textMode = `💼 Chế độ: ${selectedJob.workingMode || 'Hybrid'}`;
                        const textSal = `💰 Thu nhập: ${selectedJob.salaryRange || 'Thỏa thuận'}`;

                        ctx.font = 'bold 16px system-ui, sans-serif';
                        const locW = ctx.measureText(textLoc).width + 45;
                        const modeW = ctx.measureText(textMode).width + 45;
                        const salW = ctx.measureText(textSal).width + 45;

                        ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
                        ctx.beginPath(); drawRoundRect(ctx, 80, startY, locW, 46, 10); ctx.fill();
                        ctx.beginPath(); drawRoundRect(ctx, 80 + locW + 20, startY, modeW, 46, 10); ctx.fill();
                        ctx.fillStyle = 'rgba(52, 211, 153, 0.15)';
                        ctx.beginPath(); drawRoundRect(ctx, 80 + locW + 20 + modeW + 20, startY, salW, 46, 10); ctx.fill();

                        ctx.fillStyle = '#e2e8f0';
                        ctx.fillText(textLoc, 102, startY + 29);
                        ctx.fillText(textMode, 80 + locW + 42, startY + 29);
                        ctx.fillStyle = '#10b981';
                        ctx.fillText(textSal, 80 + locW + 20 + modeW + 42, startY + 29);

                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
                        ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.moveTo(80, 580); ctx.lineTo(1120, 580); ctx.stroke();

                        ctx.fillStyle = '#94a3b8';
                        ctx.font = 'bold 14px monospace';
                        ctx.fillText('YÊU CẦU CỐT LÕI VỊ TRÍ', 80, 630);

                        ctx.fillStyle = '#cbd5e1';
                        ctx.font = '500 18px system-ui, sans-serif';
                        wrapText(ctx, selectedJob.skills || 'Đáp ứng đầy đủ các kỹ năng tiêu chuẩn nghiệp vụ.', 80, 672, 700, 30);

                        ctx.fillStyle = '#4f46e5';
                        ctx.beginPath();
                        drawRoundRect(ctx, 840, 625, 280, 64, 12);
                        ctx.fill();
                        ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px system-ui, sans-serif';
                        ctx.fillText('ỨNG TUYỂN NGAY  ✉', 880, 663);

                        const dataUrl = canvas.toDataURL('image/png');
                        const link = document.createElement('a');
                        link.href = dataUrl;
                        link.download = `Shaha_Poster_${selectedJob.title.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
                        link.click();
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:opacity-95 text-white rounded-xl text-xs font-black shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Image className="w-4 h-4" />
                      <span>Xuất ảnh tuyển dụng (Banner PNG)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
