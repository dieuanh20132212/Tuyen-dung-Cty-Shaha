/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  ToggleLeft, 
  ToggleRight, 
  Play, 
  Activity, 
  Sparkles, 
  Mail, 
  Users, 
  Briefcase, 
  CheckCircle,
  FileText,
  MousePointerClick,
  Radio,
  Search,
  ChevronRight,
  Check,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Globe,
  Settings,
  Shield,
  HelpCircle,
  ArrowRight,
  Database,
  Image,
  Share2,
  Layers,
  Send,
  Download
} from 'lucide-react';
import { Job, Candidate } from '../types';

interface AutomationProps {
  notifications: any[];
  jobs?: Job[];
  onAddCandidate?: (candidateData: Partial<Candidate>) => Promise<void>;
}

export default function AutomationView({ notifications, jobs = [], onAddCandidate }: AutomationProps) {
  // Tab control state
  const [activeTab, setActiveTab] = useState<'rules' | 'radar' | 'architecture'>('architecture');

  // --- DEMO STATES FOR PROPOSED ARCHITECTURE ---
  const [archJobPreset, setArchJobPreset] = useState<'sales' | 'react' | 'marketing'>('sales');
  const [archJobTitle, setArchJobTitle] = useState('Nhân viên Kinh doanh');
  const [archCount, setArchCount] = useState('10');
  const [archLocation, setArchLocation] = useState('Hà Nội');
  const [archSalary, setArchSalary] = useState('8-15 triệu');
  const [archExp, setArchExp] = useState('Không yêu cầu kinh nghiệm');
  const [archSkills, setArchSkills] = useState('Giao tiếp, Đàm phán, Kỹ năng chốt sales, Chăm sóc khách hàng');
 
  const handleDownloadPresetPoster = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 840;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Helper to draw rounded rect
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
    ctx.shadowColor = '#8b5cf6';
    ctx.fillStyle = 'rgba(139, 92, 246, 0.15)';
    ctx.beginPath(); ctx.arc(1000, 160, 180, 0, 2 * Math.PI); ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    drawRoundRect(ctx, 80, 80, 220, 42, 8); ctx.fill();
    ctx.fillStyle = '#c084fc';
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

    ctx.fillStyle = '#a78bfa';
    ctx.font = 'bold 16px monospace';
    ctx.fillText('CHỨC DANH ĐANG SĂN TÌM', 80, 240);

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 48px system-ui, sans-serif';
    wrapText(ctx, archJobTitle.toUpperCase(), 80, 305, 1040, 62);

    const startY = 480;
    const textLoc = `📍 Địa điểm: ${archLocation}`;
    const textMode = `💼 Chế độ: Hybrid`;
    const textSal = `💰 Thu nhập: ${archSalary}`;

    ctx.font = 'bold 16px system-ui, sans-serif';
    const locW = ctx.measureText(textLoc).width + 45;
    const modeW = ctx.measureText(textMode).width + 45;
    const salW = ctx.measureText(textSal).width + 45;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.07)';
    ctx.beginPath(); drawRoundRect(ctx, 80, startY, locW, 46, 10); ctx.fill();
    ctx.beginPath(); drawRoundRect(ctx, 80 + locW + 20, startY, modeW, 46, 10); ctx.fill();
    ctx.fillStyle = 'rgba(167, 139, 250, 0.15)';
    ctx.beginPath(); drawRoundRect(ctx, 80 + locW + 20 + modeW + 20, startY, salW, 46, 10); ctx.fill();

    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(textLoc, 102, startY + 29);
    ctx.fillText(textMode, 80 + locW + 42, startY + 29);
    ctx.fillStyle = '#a78bfa';
    ctx.fillText(textSal, 80 + locW + 20 + modeW + 42, startY + 29);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(80, 580); ctx.lineTo(1120, 580); ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 14px monospace';
    ctx.fillText('YÊU CẦU CỐT LÕI VỊ TRÍ', 80, 630);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 18px system-ui, sans-serif';
    wrapText(ctx, archSkills, 80, 672, 700, 30);

    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath(); drawRoundRect(ctx, 840, 625, 280, 64, 12); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText('ỨNG TUYỂN NGAY  ✉', 880, 663);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `Shaha_Banner_Preset_${archJobTitle.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
    link.click();
  };

  const handleSelectPreset = (preset: 'sales' | 'react' | 'marketing') => {
    setArchJobPreset(preset);
    if (preset === 'sales') {
      setArchJobTitle('Nhân viên Kinh doanh');
      setArchCount('10');
      setArchLocation('Hà Nội');
      setArchSalary('8-15 triệu');
      setArchExp('Không yêu cầu kinh nghiệm');
      setArchSkills('Giao tiếp, Đàm phán, Kỹ năng chốt sales, Chăm sóc khách hàng');
    } else if (preset === 'react') {
      setArchJobTitle('React Developer');
      setArchCount('3');
      setArchLocation('TP. Hồ Chí Minh');
      setArchSalary('20-35 triệu');
      setArchExp('1-3 năm kinh nghiệm');
      setArchSkills('ReactJS, TypeScript, Tailwind CSS, API Integration, Git, Redux');
    } else if (preset === 'marketing') {
      setArchJobTitle('Marketing Specialist');
      setArchCount('5');
      setArchLocation('Hải Phòng / Remote');
      setArchSalary('12-18 triệu');
      setArchExp('Dưới 1 năm kinh nghiệm');
      setArchSkills('Social Media, Content Writing, SEO, Canva Graphic, Facebook Ads');
    }
  };

  // --- TAB 1: Rules & Automation States ---
  const [rule1, setRule1] = useState(true);
  const [rule2, setRule2] = useState(true);
  const [rule3, setRule3] = useState(false);
  const [rule4, setRule4] = useState(true);

  const [autoSourcingLog, setAutoSourcingLog] = useState<string[]>([
    "Khởi động hệ thống: Kích hoạt pipeline core AI tuyển dụng online.",
    "Bẫy Webhook đồng bộ: Kênh Sourcing Google Form CV sẵn sàng ghi nhận dữ liệu.",
    "Realtime observer: Đang lắng nghe thay đổi lược đồ Firestore."
  ]);
  const [isSimulatingCycle, setIsSimulatingCycle] = useState(false);

  const triggerSimulation = () => {
    setIsSimulatingCycle(true);
    setAutoSourcingLog(prev => [...prev, "Kích hoạt chu trình kiểm thử tự động (Dry run triggered)..."]);
    
    setTimeout(() => {
      setAutoSourcingLog(prev => [...prev, "📥 PHÁT HIỆN: 1 CV mới tải lên (Nguyen_Tien_Dung_CV.pdf) tại Cổng Sourcing"]);
    }, 1000);

    setTimeout(() => {
      setAutoSourcingLog(prev => [...prev, "🧠 AI PARSER AGENT: Đang tự động quét OCR và đối chiếu thực thể..."]);
    }, 2000);

    setTimeout(() => {
      setAutoSourcingLog(prev => [...prev, "✅ PARSER HOÀN TẤT: Trích xuất thành công 'Nguyễn Tiến Dũng' | Lập trình viên React Senior | Email: dung.tien@gmail.com"]);
    }, 3200);

    setTimeout(() => {
      setAutoSourcingLog(prev => [...prev, "⚖️ AI COMPARATOR: Chạy chấm điểm đối chuẩn cho Vị trí 'React Developer (AI Optimized)'..."]);
    }, 4500);

    setTimeout(() => {
      setAutoSourcingLog(prev => [...prev, "📊 KẾT QUẢ ĐỐI SÁNH: Điểm khớp Matching đạt 89% (Đạt tiêu chí tuyển dụng gấp)"]);
    }, 5500);

    if (rule2) {
      setTimeout(() => {
        setAutoSourcingLog(prev => [...prev, "📧 RULE DETECTED (Matching >= 85%): Tự động sinh thư mời phỏng vấn (Invitation ID: INV-981)"]);
      }, 6500);

      setTimeout(() => {
        setAutoSourcingLog(prev => [...prev, "🚀 SMTP DISPATCHER: Đã bắn Email mời phỏng vấn thành công tới dung.tien@gmail.com. Đồng bộ trạng thái phễu: 'Interviewing'"]);
        setIsSimulatingCycle(false);
      }, 7800);
    } else {
      setTimeout(() => {
        setAutoSourcingLog(prev => [...prev, "⚠️ HỎI Ý KIẾN: Luật gửi Mail tự động tắt. Chờ HR phê duyệt thủ công..."]);
        setIsSimulatingCycle(false);
      }, 6500);
    }
  };

  const rules = [
    {
      id: 'rule1',
      title: 'Tự động trích xuất CV đầu vào khi tải lên (Auto CV Parser)',
      description: 'Khi phát hiện tệp tin mới tại cổng lưu trữ Sourcing hoặc thư điện tử tuyển dụng gửi đến -> Tự động kích hoạt Gemini CV Parser trích xuất kỹ năng học văn và lưu vào Database.',
      state: rule1,
      toggle: () => setRule1(!rule1),
      icon: FileText,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100'
    },
    {
      id: 'rule2',
      title: 'Tự động gửi email mời phỏng vấn khi Matching >= 85%',
      description: 'Khi ứng viên có điểm phân tích Fit Score bởi Gemini đạt từ 85% trở lên -> Tự động chuyển phễu trạng thái sang "Interviewing" -> Đồng thời sử dụng SMTP tạo thư và gửi email mời hẹn phỏng vấn.',
      state: rule2,
      toggle: () => setRule2(!rule2),
      icon: Mail,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100'
    },
    {
      id: 'rule3',
      title: 'Tự động trì hoãn gửi mail từ chối khi Matching < 50%',
      description: 'Khi Fit Score dưới 50% -> Tự động ghi từ chối hồ sơ (Rejected) -> Trì hoãn 24 giờ (để cải thiện trải nghiệm ứng viên) rồi tự động hóa gửi email từ từ chối lịch thiệp được làm mịn bởi Gemini AI.',
      state: rule3,
      toggle: () => setRule3(!rule3),
      icon: Users,
      color: 'text-rose-600 bg-rose-50 border-rose-100'
    },
    {
      id: 'rule4',
      title: 'Đồng bộ Realtime với Firestore & Google Calendar',
      description: 'Mọi lịch phỏng vấn được ấn định bởi HR hoặc đặt giờ bởi ứng viên -> Tự động hiển thị tại Calendar chung của toàn bộ nhân sự tuyển dụng cùng với Google Meet liên kết.',
      state: rule4,
      toggle: () => setRule4(!rule4),
      icon: Briefcase,
      color: 'text-sky-600 bg-sky-50 border-sky-100'
    }
  ];

  // --- TAB 2: AI Sourcing Radar States ---
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [channels, setChannels] = useState({
    linkedin: true,
    facebook: true,
    github: true,
    twitter: false
  });
  const [minMatchScore, setMinMatchScore] = useState<number>(75);
  const [scanning, setScanning] = useState<boolean>(false);
  const [radarLogs, setRadarLogs] = useState<string[]>([]);
  const [scannedCandidates, setScannedCandidates] = useState<any[]>([]);
  const [syncedIds, setSyncedIds] = useState<Record<string, boolean>>({});
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-select first job if available
  useEffect(() => {
    if (jobs && jobs.length > 0 && !selectedJobId) {
      setSelectedJobId(jobs[0].jobId);
    }
  }, [jobs, selectedJobId]);

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleStartRadarScan = async () => {
    if (!selectedJobId) {
      setError("Vui lòng chọn một tin tuyển dụng để làm tiêu chuẩn tìm kiếm quét ứng viên.");
      return;
    }
    setError(null);
    setScanning(true);
    setScannedCandidates([]);
    setRadarLogs([]);

    const selectedJob = jobs.find(j => j.jobId === selectedJobId);
    if (!selectedJob) return;

    // Simulation logs
    const stages = [
      `Kích hoạt mạng lưới Sourcing Radar cho vị trí: "${selectedJob.title}"...`,
      `Đang đọc bộ lọc tiêu chí: Kỹ năng [${selectedJob.skills}], Địa điểm [${selectedJob.location}]...`,
      channels.linkedin ? "📡 Đang thực hiện thám thính qua API LinkedIn Recruiter & Connection Graph..." : "",
      channels.facebook ? "📡 Đang trích xuất bài đăng cộng đồng & tin tức tìm việc tại Facebook Pools..." : "",
      channels.github ? "📡 Đang phân loại các repository chứa code React & cấu trúc phù hợp tại GitHub..." : "",
      "🧠 Gửi gói dữ liệu thu hoạch về lõi Gemini AI để chạy so khớp Matching...",
      "⚙️ Chấm điểm kỹ năng cứng, số năm kinh nghiệm, hình thức Hybrid/Onsite...",
      "🎯 Hoàn tất thám thính! Trả về những hồ sơ thỏa mãn tiêu chí..."
    ].filter(Boolean);

    // Sequential log presentation
    stages.forEach((text, i) => {
      setTimeout(() => {
        setRadarLogs(prev => [...prev, text]);
      }, i * 600);
    });

    try {
      // Call standard server side parser
      const response = await fetch('/api/scan-social-candidates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ job: selectedJob })
      });

      if (!response.ok) {
        throw new Error("Không thể liên hệ với mạng lưới radar Sourcing API.");
      }

      const data = await response.json();
      
      // Filter based on preferred match score slider
      const filtered = data.filter((cand: any) => cand.matchScore >= minMatchScore);

      // Reveal candidates only after logs look completes (around 3.8s)
      setTimeout(() => {
        setScannedCandidates(filtered);
        setScanning(false);
        if (filtered.length === 0) {
          setError(`Quét hoàn tất nhưng không tìm thấy ứng viên nào trên mạng xã hội đạt điểm matching tối thiểu >= ${minMatchScore}%. Hãy thử giảm ngưỡng điểm hoặc bổ sung kênh thám thính.`);
        }
      }, stages.length * 600 + 400);

    } catch (err: any) {
      console.error(err);
      setTimeout(() => {
        setError("Quá trình kết nối dữ liệu mạng xã hội bị gián đoạn. Radar đang chạy giả lập thám thính ngoại tuyến.");
        setScanning(false);
      }, stages.length * 600);
    }
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

  const handleSyncToDatabase = async (cand: any, uniqueIndex: number) => {
    if (!onAddCandidate) return;
    const itemKey = `${cand.name}_${uniqueIndex}`;
    setSyncingId(itemKey);
    
    try {
      // Parse structures to matching schema
      await onAddCandidate({
        name: cand.name,
        email: cand.email,
        phone: cand.phone || '0900000000',
        address: cand.address || 'Hồ Chí Minh, Việt Nam',
        skills: cand.skills || [],
        experience: cand.experience || 'Chưa cập nhật',
        education: cand.education || 'Chưa cập nhật',
        languages: cand.languages || ['Tiếng Việt'],
        tags: ['Sourced', cand.sourcePlatform],
        profileUrl: cand.profileUrl
      });

      setSyncedIds(prev => ({ ...prev, [itemKey]: true }));
    } catch (e) {
      console.error("Error syncing sourced candidate", e);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in bg-slate-50 min-h-screen">
      
      {/* Tab Selectors */}
      <div className="flex items-center space-x-1 bg-slate-200/60 p-1.5 rounded-2xl max-w-full overflow-x-auto whitespace-nowrap scrollbar-none border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('architecture')}
          className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'architecture' 
              ? 'bg-white text-indigo-650 shadow-sm font-black' 
              : 'text-slate-550 hover:text-slate-800'
          }`}
        >
          <Layers className={`w-4 h-4 ${activeTab === 'architecture' ? 'text-indigo-500' : ''}`} />
          Kiến trúc AI Agent đề xuất
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('radar')}
          className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'radar' 
              ? 'bg-white text-indigo-650 shadow-sm' 
              : 'text-slate-550 hover:text-slate-800'
          }`}
        >
          <Radio className={`w-4 h-4 ${activeTab === 'radar' ? 'text-indigo-505 animate-pulse' : ''}`} />
          AI Social Sourcing Radar (Quét MXH)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'rules' 
              ? 'bg-white text-indigo-650 shadow-sm' 
              : 'text-slate-550 hover:text-slate-800'
          }`}
        >
          <Cpu className="w-4 h-4" />
          Quy trình AI Automation (AI Pipelines)
        </button>
      </div>

      {activeTab === 'architecture' ? (
        /* ARCHITECTURE VIEW */
        <div className="space-y-8 animate-fade-in text-slate-700">
          {/* Header Card */}
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden border border-indigo-850">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
              <Cpu className="w-96 h-96 text-white" />
            </div>
            
            <div className="relative z-10 max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 font-mono text-[10px] px-2.5 py-1 rounded bg-indigo-950 border border-indigo-500/30 uppercase tracking-widest font-black">
                <Sparkles className="w-3.5 h-3.5" /> Proposed Architecture
              </div>
              <h3 className="text-2xl font-black tracking-tight text-white uppercase">
                Mô hình Kiến trúc AI Agent Tuyển dụng Đề xuất
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                Hệ thống sơ đồ vận hành khép kín ứng dụng sức mạnh của Trí tuệ nhân tạo (Generative AI) và tự động hóa đa kênh. Quy trình tự động chuyển tiếp mượt mà từ Nhận đề xuất ban đầu, Soạn thảo nội dung thông minh, Phát tán tin tuyển dụng đa phương tiện, cho tới Chủ động thám thính & Quét thu thập ứng viên trên Internet.
              </p>
              
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="text-xs bg-slate-850 text-indigo-300 border border-indigo-500/20 font-bold px-3.5 py-1.5 rounded-xl">⚡ Nhận Đề Xuất</span>
                <span className="text-xs bg-slate-850 text-indigo-300 border border-indigo-500/20 font-bold px-3.5 py-1.5 rounded-xl">⚡ Tạo JD & Banner</span>
                <span className="text-xs bg-slate-850 text-indigo-300 border border-indigo-500/20 font-bold px-3.5 py-1.5 rounded-xl">⚡ Phân Phối Đa Kênh</span>
                <span className="text-xs bg-slate-850 text-indigo-300 border border-indigo-500/20 font-bold px-3.5 py-1.5 rounded-xl">⚡ Chủ Động Radar Sourcing</span>
              </div>
            </div>
          </div>

          {/* Interactive Presets Switcher */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Trình giả lập mô phỏng kiến trúc</h4>
              <p className="text-[11px] text-slate-500 font-medium">Bấm chọn một vị trí mẫu để quan sát cách dữ liệu tự động biến đổi qua 4 Bước trong quy trình:</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectPreset('sales')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  archJobPreset === 'sales'
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-600/10'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                💼 Nhân viên Kinh doanh (Mẫu gốc)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('react')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  archJobPreset === 'react'
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-600/10'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                💻 React Developer (Công nghệ)
              </button>
              <button
                type="button"
                onClick={() => handleSelectPreset('marketing')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  archJobPreset === 'marketing'
                    ? 'bg-indigo-600 text-white border-indigo-650 shadow-md shadow-indigo-600/10'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                📣 Marketing Specialist (Sáng tạo)
              </button>
            </div>
          </div>

          {/* Visual 4-Step Pipeline Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
            
            {/* STEP 1 */}
            <div className="bg-white rounded-2xl border border-slate-200/95 shadow-xs p-6 flex flex-col justify-between hover:border-indigo-300 transition duration-200 group relative">
              <div className="absolute top-4 right-4 text-xs font-mono font-black text-indigo-550 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md">
                STEP 01
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Database className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 1: Nhận yêu cầu</h4>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5 leading-relaxed">Người dùng cấu hình chỉ tiêu ban đầu qua cổng tuyển dụng.</p>
                </div>
                
                {/* Simulated parameter fields */}
                <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-[11px] font-sans font-medium text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Vị trí tuyển dụng</span>
                    <span className="text-slate-800 font-bold">{archJobTitle}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Số lượng cần tuyển</span>
                    <span className="text-slate-800 font-bold">{archCount} ứng viên</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Địa điểm làm việc</span>
                    <span className="text-slate-800">{archLocation}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Mức lương đề xuất</span>
                    <span className="text-slate-800 font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-100/50">{archSalary}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Kinh nghiệm yêu cầu</span>
                    <span className="text-slate-800">{archExp}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-bold">Kỹ năng cốt lõi</span>
                    <span className="text-slate-700 leading-normal line-clamp-2" title={archSkills}>{archSkills}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[10.5px] text-slate-500 font-semibold italic flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                Đồng bộ sang Engine Generator...
              </div>
            </div>

            {/* STEP 2 */}
            <div className="bg-white rounded-2xl border border-slate-200/95 shadow-xs p-6 flex flex-col justify-between hover:border-indigo-300 transition duration-200 group relative">
              <div className="absolute top-4 right-4 text-xs font-mono font-black text-purple-550 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md">
                STEP 02
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 2: AI tạo JD tự động</h4>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5 leading-relaxed">Trợ lý Gemini biên dịch đa phương diện tối ưu chuyển đổi.</p>
                </div>

                <div className="space-y-3 bg-purple-50/40 p-3.5 rounded-xl border border-purple-100/60 text-[11px]">
                  <div>
                    <span className="text-purple-500 block text-[9px] uppercase font-extrabold flex items-center gap-1">
                      <FileText className="w-3 h-3" /> Viết bài tuyển dụng (AI JD)
                    </span>
                    <p className="text-slate-700 font-medium leading-relaxed italic mt-1 bg-white p-2 rounded-lg border border-slate-100 shadow-xs line-clamp-4">
                      {archJobPreset === 'sales' && "Công ty Shaha tuyển dụng gấp 10 Nhân viên Kinh doanh làm việc tại Hà Nội. Thu nhập hấp dẫn 8-15 triệu. Không yêu cầu kinh nghiệm, được đào tạo bài bản từ đầu! Yêu cầu: Giao tiếp tốt, chịu khó, ham học hỏi..."}
                      {archJobPreset === 'react' && "Shaha tuyển dụng 03 Kỹ sư lập trình React Developer, thu nhập từ 20-35 triệu/tháng tại TP. Hồ Chí Minh. Yêu cầu: 1-3 năm kinh nghiệm thực chiến React/TS, thiết kế giao diện mượt mà..."}
                      {archJobPreset === 'marketing' && "Shaha tìm kiếm 05 đồng đội Marketing Specialist làm việc năng động tại Hải Phòng hoặc Remote. Lương cứng 12-18 triệu. Yêu cầu: Content sáng tạo, nhạy bén xu hướng, chạy quảng cáo cơ bản..."}
                    </p>
                  </div>

                  <div>
                    <span className="text-purple-500 block text-[9px] uppercase font-extrabold flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Tạo nhiều phiên bản
                    </span>
                    <div className="flex gap-1.5 mt-1 font-mono text-[8px] font-bold">
                      <span className="bg-white border border-slate-200 text-slate-600 px-1 py-0.5 rounded">Formal News</span>
                      <span className="bg-white border border-slate-200 text-slate-600 px-1 py-0.5 rounded">Social Post</span>
                      <span className="bg-white border border-slate-200 text-indigo-600 px-1 py-0.5 rounded">SEO Tags</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-purple-500 block text-[9px] uppercase font-extrabold flex items-center gap-1">
                      <Image className="w-3 h-3" /> Tạo ảnh tuyển dụng
                    </span>
                    {/* Simulated modern banner layout skeleton */}
                    <div className="relative mt-1 aspect-video bg-gradient-to-br from-indigo-950 to-indigo-900 border border-slate-800 rounded-lg p-2.5 overflow-hidden flex flex-col justify-between shadow-xs group">
                      <span className="absolute top-1 right-1 font-mono text-[7px] text-indigo-400">SHAHA RECRUIT</span>
                      <div className="space-y-0.5">
                        <p className="text-[7.5px] text-[yellow] font-black uppercase">We are hiring</p>
                        <p className="text-[9px] text-white font-extrabold leading-tight">{archJobTitle}</p>
                      </div>
                      <div className="flex justify-between items-center text-[7px] text-slate-300">
                        <span>📍 {archLocation}</span>
                        <span className="font-bold text-white">💰 {archSalary}</span>
                      </div>
                      <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex items-center justify-center">
                        <button
                          type="button"
                          onClick={handleDownloadPresetPoster}
                          className="bg-purple-600 hover:bg-purple-700 text-[10px] text-white font-black px-2.5 py-1.5 rounded flex items-center gap-1 transition shadow-lg cursor-pointer transform active:scale-95"
                        >
                          <Download className="w-3 h-3" /> Tải Poster PNG
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-purple-500 block text-[9px] uppercase font-extrabold flex items-center gap-1">
                      <span className="font-bold">#</span> Tạo hashtag tự sinh
                    </span>
                    <p className="text-purple-700 font-bold font-mono text-[9px] mt-1 tracking-tight leading-relaxed">
                      {archJobPreset === 'sales' && "#ShahaRecruit #TuyendungSales #SalesHanoi #ViecLamSales #NoExperience"}
                      {archJobPreset === 'react' && "#ShahaRecruit #ReactDeveloper #TuyendungIT #FullStackReact #TechJobs"}
                      {archJobPreset === 'marketing' && "#ShahaRecruit #MarketingSpecialist #CreativeMarketing #HaiPhongJobs #Remote"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[10.5px] text-slate-500 font-semibold italic flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-ping" />
                Đang nạp dữ liệu tới bộ phân phối...
              </div>
            </div>

            {/* STEP 3 */}
            <div className="bg-white rounded-2xl border border-slate-200/95 shadow-xs p-6 flex flex-col justify-between hover:border-indigo-300 transition duration-200 group relative">
              <div className="absolute top-4 right-4 text-xs font-mono font-black text-sky-550 bg-sky-50 border border-sky-100 px-2 py-0.5 rounded-md">
                STEP 03
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5 text-sky-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 3: AI đăng tuyển đa kênh</h4>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5 leading-relaxed">Bộ phát tán tự động đồng bộ hóa tin đăng lên MXH & Việc làm chính thống.</p>
                </div>

                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase font-black tracking-normal text-slate-400">Các kênh mạng xã hội tích hợp:</div>
                  <div className="grid grid-cols-2 gap-1 px-0.5">
                    {[
                      { name: 'Facebook Page', icon: '🔵' },
                      { name: 'Facebook Group', icon: '👥' },
                      { name: 'Zalo OA', icon: '💬' },
                      { name: 'Telegram Channel', icon: '✈️' }
                    ].map((ch, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-100/80 p-1.5 rounded-lg flex items-center justify-between text-[9.5px] font-bold text-slate-700">
                        <span>{ch.icon} {ch.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Sẵn sàng đăng" />
                      </div>
                    ))}
                  </div>

                  <div className="text-[10.5px] uppercase font-black tracking-normal text-slate-400 mt-2 flex items-center gap-1">
                    <span className="text-sky-500">📌</span> Đơn tuyển dụng việc làm:
                  </div>
                  <div className="space-y-1">
                    {[
                      { name: 'LinkedIn Jobs', highlighted: true, logo: '🔗' },
                      { name: 'TopCV Việt Nam', highlighted: true, logo: '⭐' },
                      { name: 'VietnamWorks', highlighted: true, logo: '🏢' },
                      { name: 'Indeed Global', highlighted: true, logo: '🌐' },
                      { name: 'CareerBuilder', highlighted: false, logo: '👔' }
                    ].map((pl, idx) => (
                      <div 
                        key={idx} 
                        className={`p-1.5 rounded-xl border flex items-center justify-between text-[10px] font-bold ${
                          pl.highlighted 
                            ? 'bg-sky-50/50 border-sky-100 text-sky-850 shadow-2xs' 
                            : 'bg-slate-50 border-slate-100 text-slate-650'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{pl.logo}</span>
                          <span>{pl.name}</span>
                        </div>
                        <span className="text-[8.5px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-1 py-0.5 rounded">
                          <Check className="w-2.5 h-2.5" /> Live
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[10.5px] text-slate-500 font-semibold italic flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-ping" />
                Bật lồng radar quét ứng viên đầu vào...
              </div>
            </div>

            {/* STEP 4 */}
            <div className="bg-white rounded-2xl border border-slate-250/95 shadow-md p-6 flex flex-col justify-between hover:border-indigo-300 transition duration-205 group relative ring-2 ring-indigo-505/20">
              <div className="absolute top-4 right-4 text-xs font-mono font-black text-rose-550 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">
                STEP 04
              </div>
              
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                  <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bước 4: AI tìm ứng viên</h4>
                  <p className="text-[11px] text-slate-400 font-semibold mt-0.5 leading-relaxed">Tìm phối hợp chủ động nguồn trực tuyến, kết hợp sàng lọc xếp hạng tự động.</p>
                </div>

                <div className="space-y-3">
                  <div className="text-[10px] uppercase font-black text-slate-400">Các nguồn thám thính của Radar:</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-extrabold text-slate-700">
                    {[
                      { name: 'LinkedIn', active: true, badge: 'Hot' },
                      { name: 'TopCV', active: true, badge: 'Sourcing' },
                      { name: 'VietnamWorks', active: true },
                      { name: 'CareerBuilder', active: true },
                      { name: 'GitHub', active: true, badge: 'Code Repo' },
                      { name: 'Facebook', active: true },
                      { name: 'Telegram', active: true },
                      { name: 'Hồ sơ ATS cũ', active: true, badge: 'Internal' }
                    ].map((src, idx) => (
                      <div 
                        key={idx} 
                        className="bg-slate-50 border border-slate-100 p-1.5 rounded-lg flex flex-col justify-between gap-1 shadow-3xs"
                      >
                        <div className="flex items-center gap-1 justify-between">
                          <span className="truncate" title={src.name}>🔍 {src.name}</span>
                        </div>
                        {src.badge && (
                          <span className="text-[7.5px] px-1 bg-indigo-50 text-indigo-550 rounded border border-indigo-100 w-fit">{src.badge}</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Core Statement Styling */}
                  <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/70 border border-indigo-105 p-3 rounded-xl mt-3 relative">
                    <span className="absolute -top-1.5 left-2.5 px-1.5 bg-indigo-600 text-white text-[7.5px] font-black rounded uppercase">AI Power Capabilities</span>
                    <p className="text-[10.5px] text-slate-700 font-semibold leading-relaxed mt-1">
                      <em>Các nền tảng AI sourcing hiện nay có thể tìm kiếm hàng trăm triệu hồ sơ ứng viên và xếp hạng tự động.</em>
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 text-[10.5px] text-emerald-600 font-bold flex items-center gap-1.5 bg-emerald-50/50 p-2 rounded-xl border border-emerald-100/50">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                <span>Quy trình tự động hóa khép kín!</span>
              </div>
            </div>

          </div>

          {/* Quick Platform Description Banner */}
          <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h5 className="text-xs font-black text-indigo-900 uppercase">Trải nghiệm các chức năng tương tự tại Shaha Recruit:</h5>
              <p className="text-[11.5px] text-indigo-750 font-medium leading-relaxed">
                Bạn có thể trải nghiệm trực tiếp <strong>Bước 2 (AI JD tự động)</strong> ở tab <strong className="underline decoration-indigo-500 text-indigo-700 cursor-pointer" onClick={() => { setActiveTab('rules'); }}>"Quy trình AI Automation"</strong> và trải nghiệm <strong>Bước 4 (AI tìm nguồn & radar)</strong> ngay tại tab <strong className="underline text-indigo-700 cursor-pointer" onClick={() => setActiveTab('radar')}>"AI Social Sourcing Radar (Quét MXH)"</strong> bên cạnh!
              </p>
            </div>
            
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-bold px-5 py-3 rounded-xl transition duration-150 shadow-md shadow-indigo-650/10 cursor-pointer flex items-center gap-1.5 whitespace-nowrap self-start md:self-auto"
            >
              <span>Trải nghiệm Sourcing Radar ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : activeTab === 'rules' ? (
        /* Original Automation Rules view */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rules column (2 spans) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-indigo-500" />
                Thiết lập Quy trình Tự động hóa Tuyển dụng (AI Pipelines)
              </h4>
              <span className="text-[10px] bg-slate-100 text-slate-550 font-bold px-2 py-0.5 rounded font-mono">AUTOMATION RULES</span>
            </div>

            <div className="space-y-4">
              {rules.map((rule) => {
                const IconComp = rule.icon;
                return (
                  <div key={rule.id} className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl flex items-start justify-between gap-6 hover:bg-slate-50 transition">
                    <div className="flex items-start space-x-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${rule.color}`}>
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 leading-snug">{rule.title}</h5>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-semibold">{rule.description}</p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={rule.toggle}
                      className="p-1 rounded-xl transition text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={rule.state ? "Tắt quy định" : "Bật quy định"}
                    >
                      {rule.state ? (
                        <ToggleRight className="w-10 h-10 text-indigo-600" />
                      ) : (
                        <ToggleLeft className="w-10 h-10 text-slate-350" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Realtime logs pipeline console */}
          <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between h-[520px]">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Hệ thống chạy tự động mạng lưới AI
                </span>
                <span className="text-[9px] bg-emerald-950 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider">LIVE EXECUTION</span>
              </div>

              <div className="space-y-3 font-mono text-[10px] max-h-80 overflow-y-auto leading-relaxed select-text no-scrollbar">
                {autoSourcingLog.map((log, idx) => (
                  <div key={idx} className="text-slate-300">
                    <span className="text-slate-500 font-bold">[{new Date().toLocaleTimeString()}]</span> {log}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 space-y-3">
              <p className="text-[10px] text-slate-400 leading-normal font-mono">Bấm nút chạy thử nghiệm giả lập kịch bản Sourcing thu hoạch CV đầu vào và gửi email tự động để cảm nhận khả năng tự động hóa:</p>
              <button
                type="button"
                onClick={triggerSimulation}
                disabled={isSimulatingCycle}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Chạy giả lập kịch bản tự động</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* BRAND NEW: Social Sourcing Radar View */
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Control Form Column */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-850 flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-500" />
                  Yêu Cầu Quét Sourcing MXH
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 font-semibold leading-relaxed">
                  Thiết lập tham số để radar thám thính và thu thập hồ sơ phù hợp từ Internet.
                </p>
              </div>

              {/* Job Selector */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 tracking-wide uppercase flex items-center gap-1">
                  <Briefcase className="w-3 h-3 text-slate-400" />
                  Chọn vị trí tuyển dụng (Từ tab Jobs)
                </label>
                {jobs.length === 0 ? (
                  <div className="p-3 border border-dashed border-slate-200 bg-slate-50 rounded-xl text-[11px] text-slate-500 text-center font-semibold">
                    Không có tin tuyển dụng nào hoạt động. Vui lòng tạo tin trước ở tab "Tin tuyển dụng (Jobs)".
                  </div>
                ) : (
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 focus:bg-white transition"
                  >
                    {jobs.map(job => (
                      <option key={job.jobId} value={job.jobId}>
                        {job.title} ({job.location})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Channels toggler */}
              <div className="space-y-3">
                <label className="text-[11px] font-bold text-slate-700 tracking-wide uppercase">
                  Mạng xã hội cần thám thính
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => toggleChannel('linkedin')}
                    className={`p-3 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition cursor-pointer ${
                      channels.linkedin
                        ? 'border-blue-500 bg-blue-50/40 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                    LinkedIn
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChannel('facebook')}
                    className={`p-3 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition cursor-pointer ${
                      channels.facebook
                        ? 'border-indigo-500 bg-indigo-50/40 text-indigo-700'
                        : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
                    Facebook
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChannel('github')}
                    className={`p-3 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition cursor-pointer ${
                      channels.github
                        ? 'border-purple-500 bg-purple-50/40 text-purple-700'
                        : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                    GitHub
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChannel('twitter')}
                    className={`p-3 rounded-xl border text-[11px] font-bold flex items-center gap-2 transition cursor-pointer ${
                      channels.twitter
                        ? 'border-sky-500 bg-sky-50/40 text-sky-700'
                        : 'border-slate-200 bg-white text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    Twitter / X
                  </button>
                </div>
              </div>

              {/* Flow slider for Minimum matching percentage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 tracking-wide uppercase">
                  <span>Điểm Matching tối thiểu</span>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-mono">{minMatchScore}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={minMatchScore}
                  onChange={(e) => setMinMatchScore(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1.5 bg-slate-150 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-400 leading-snug font-semibold">
                  Chỉ lưu giữ thông tin các hồ sơ mạng xã hội có mức độ thích nghi kỹ năng từ {minMatchScore}% trở lên.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleStartRadarScan}
                  disabled={scanning || jobs.length === 0}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200/90 hover:shadow-indigo-300/90 active:scale-98 transition flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                >
                  {scanning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang thám thính mạng lưới...</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4 animate-pulse" />
                      <span>KÍCH HOẠT RADAR SOURCING AI</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {/* Radar Animation & Log Console Column (2 Spans) */}
            <div className="bg-slate-900 border border-slate-800 text-slate-100 p-6 rounded-2xl flex flex-col items-center justify-center min-h-[460px] lg:col-span-2 relative overflow-hidden">
              
              {/* Background scanning pulses in container */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_0%,transparent_70%)] pointer-events-none" />

              {!scanning && radarLogs.length === 0 ? (
                <div className="text-center space-y-4 max-w-sm z-10 px-4">
                  <div className="w-16 h-16 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
                  </div>
                  <h5 className="text-xs font-bold text-white tracking-wide">Mở rộng kênh tuyển dụng bằng Radar thám thính</h5>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                    Bấm nút <strong className="text-indigo-400">Kích hoạt Radar Sourcing AI</strong> tại cánh điều khiển phía bên trái để thám thính toàn bộ resume ứng viên tự động khớp JD từ các diễn đàn kỹ thuật lớn.
                  </p>
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 items-center z-10">
                  
                  {/* Glowing Pulse Interactive Sonar Screen (2cols) */}
                  <div className="md:col-span-2 flex flex-col items-center justify-center">
                    <div className="relative w-44 h-44 flex items-center justify-center bg-slate-950 rounded-full border border-indigo-505/30 shadow-2xl p-2">
                      {/* Sweep sweep element */}
                      {scanning && (
                        <div className="absolute inset-0 origin-center bg-gradient-to-tr from-transparent via-transparent to-indigo-500/30 rounded-full animate-spin" style={{ animationDuration: '3.5s' }} />
                      )}
                      {/* Rings */}
                      <div className="absolute w-40 h-40 border border-indigo-500/10 rounded-full" />
                      <div className="absolute w-28 h-28 border border-indigo-500/20 rounded-full animate-pulse" />
                      <div className="absolute w-16 h-16 border border-indigo-500/30 rounded-full" />
                      {/* Ping glowing ring */}
                      {scanning && (
                        <div className="absolute w-24 h-24 border border-indigo-500/40 rounded-full animate-ping opacity-60" />
                      )}
                      
                      {/* Node markers matching target */}
                      <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse" />
                      <div className="absolute bottom-12 left-8 w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_8px_#818cf8] animate-pulse" />
                      <div className="absolute top-24 left-10 w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_#a78bfa] animate-pulse" />

                      {/* Radar central active pointer */}
                      <div className="relative w-5 h-5 bg-indigo-500 rounded-full shadow-[0_0_15px_#6366f1] flex items-center justify-center">
                        <Sparkles className="w-2.5 h-2.5 text-white animate-spin" style={{ animationDuration: '6s' }} />
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold font-mono mt-4 animate-pulse">
                      {scanning ? "📡 AI IS ACTIVE SCANNING..." : "✅ SCAN COMPLETE"}
                    </span>
                  </div>

                  {/* Dynamic Stream/Log Area (3cols) */}
                  <div className="md:col-span-3 bg-slate-950/80 p-5 rounded-2xl border border-slate-800/80 h-72 flex flex-col justify-between">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
                      <span className="text-[10px] font-bold text-slate-350 tracking-wide uppercase font-mono flex items-center gap-1">
                        <Activity className="w-3 h-3 text-indigo-400" />
                        Radar Console Logs
                      </span>
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                    </div>

                    <div className="space-y-2.5 overflow-y-auto flex-1 pr-1 font-mono text-[10px] text-slate-300 leading-normal no-scrollbar">
                      {radarLogs.map((logStr, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 animate-fade-in">
                          <span className="text-slate-500 font-bold select-none">&gt;</span>
                          <span>{logStr}</span>
                        </div>
                      ))}
                      {scanning && (
                        <div className="flex items-center gap-2 text-indigo-400 animate-pulse mt-1">
                          <span className="inline-block w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                          <span>Đang trích xuất xử lý ngữ nghĩa...</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] text-slate-500 mt-2 border-t border-slate-900 pt-2 font-semibold">
                      Kênh: LinkedIn, Facebook, GitHub | Tiêu chí: Matching &gt;= {minMatchScore}%
                    </div>
                  </div>

                </div>
              )}

            </div>

          </div>

          {/* Sourcing Results Section */}
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-fade-in text-rose-800">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-bold leading-none">Thông tin hệ thống:</h5>
                <p className="text-[11px] font-semibold mt-1.5 leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {scannedCandidates.length > 0 && !scanning && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase font-mono flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-500" />
                    Đã Thu Hoạch Thành Công ({scannedCandidates.length} ứng viên chất lượng)
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Dữ liệu hồ sơ thám thính trực tiếp từ nền tảng đóng vai, sẵn sàng đồng bộ trực tiếp vào Hồ Sơ Tuyển Dụng chỉ với 1 click.
                  </p>
                </div>
                <span className="text-[10px] bg-slate-200 text-slate-650 font-bold px-2 py-1 rounded-lg font-mono uppercase">
                  RADAR MATCH SOURCED
                </span>
              </div>

              {/* Candidates discovered list */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {scannedCandidates.map((candidate, idx) => {
                  const keyIdent = `${candidate.name}_${idx}`;
                  const isSynced = !!syncedIds[keyIdent];
                  const isSyncing = syncingId === keyIdent;

                  const isLinkedIn = candidate.sourcePlatform === 'LinkedIn';
                  const isFacebook = candidate.sourcePlatform === 'Facebook';
                  const isGitHub = candidate.sourcePlatform === 'GitHub';

                  let badgeStyle = "bg-slate-100 text-slate-700 border-slate-200";
                  if (isLinkedIn) badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
                  if (isFacebook) badgeStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
                  if (isGitHub) badgeStyle = "bg-violet-50 text-violet-700 border-violet-200";

                  return (
                    <div 
                      key={keyIdent} 
                      className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Header details */}
                      <div className="p-5 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border uppercase inline-block mb-1.5 ${badgeStyle}`}>
                              {candidate.sourcePlatform}
                            </span>
                            <h5 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                              {candidate.name}
                              <a 
                                href={getResolvedProfileUrl(candidate.name, candidate.profileUrl)} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="text-indigo-500 hover:text-indigo-800 transition"
                                title={candidate.profileUrl?.includes('-mock') ? `Tìm kiếm nhanh '${candidate.name}' trên ${candidate.sourcePlatform}` : `Xem Profile MXH`}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </h5>
                            <span className="text-[10px] text-slate-500 font-semibold inline-block font-mono mt-0.5">{candidate.address}</span>
                          </div>

                          {/* Score widget */}
                          <div className="flex flex-col items-center">
                            <span className="text-[18px] font-black text-indigo-600 font-mono leading-none">{candidate.matchScore}%</span>
                            <span className="text-[9px] text-slate-450 font-bold uppercase font-mono tracking-wider mt-1">Match</span>
                          </div>
                        </div>

                        {/* Match Analysis Details explanation */}
                        <div className="p-3 bg-indigo-55/40 text-indigo-900 border border-indigo-100/50 rounded-xl text-[11px] leading-relaxed font-semibold">
                          <strong className="text-indigo-700 block mb-0.5 font-bold">Lý do radar đề cử:</strong>
                          {candidate.matchReason}
                        </div>

                        {/* Core features listing */}
                        <div className="space-y-2 text-[11px] leading-relaxed pt-1.5 border-t border-slate-100 font-semibold text-slate-650">
                          <div>
                            <strong className="text-slate-800 block text-[10px] uppercase font-bold tracking-wide">Kinh nghiệm:</strong>
                            <p className="text-[10.5px] mt-0.5">{candidate.experience}</p>
                          </div>
                          <div>
                            <strong className="text-slate-800 block text-[10px] uppercase font-bold tracking-wide">Học vấn:</strong>
                            <p className="text-[10.5px] mt-0.5">{candidate.education}</p>
                          </div>
                        </div>

                        {/* Extract tags display */}
                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {(candidate.skills || []).slice(0, 5).map((sk: string) => (
                            <span key={sk} className="text-[9px] bg-slate-100 text-slate-550 border border-slate-150 font-mono font-bold px-1.5 py-0.5 rounded">
                              {sk}
                            </span>
                          ))}
                          {(candidate.skills || []).length > 5 && (
                            <span className="text-[9px] text-slate-400 font-mono font-bold px-1 py-0.5">
                              +{candidate.skills.length - 5} skills
                            </span>
                          )}
                        </div>

                      </div>

                      {/* Sync Database engage CTA */}
                      <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-450 font-bold tracking-wide uppercase">
                          Sourced Profile
                        </span>
                        
                        <button
                          type="button"
                          disabled={isSynced || isSyncing}
                          onClick={() => handleSyncToDatabase(candidate, idx)}
                          className={`px-3 py-1.5 rounded-xl text-[10.5px] font-bold transition flex items-center gap-1 cursor-pointer select-none ${
                            isSynced 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-250 cursor-default' 
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                          }`}
                        >
                          {isSyncing ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Đang đồng bộ...</span>
                            </>
                          ) : isSynced ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Đã đồng bộ CV</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Đồng bộ CV vào CSDL</span>
                            </>
                          )}
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
