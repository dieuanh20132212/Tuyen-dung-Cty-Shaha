/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Search, 
  Filter, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  Loader2, 
  Linkedin, 
  Github, 
  Database,
  ArrowRight,
  TrendingUp,
  Cpu,
  ListFilter
} from 'lucide-react';
import { Candidate, Job, Application } from '../types';

interface SourcingProps {
  candidates: Candidate[];
  jobs: Job[];
  onAddCandidate: (cand: Partial<Candidate>, parsedFields?: any) => Promise<void>;
  onAddApplication: (app: Partial<Application>) => Promise<void>;
}

export default function SourcingView({ candidates, jobs, onAddCandidate, onAddApplication }: SourcingProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // States
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Filter sliders / weightings (recruiting criteria matching)
  const [skillsWeight, setSkillsWeight] = useState(80);
  const [expWeight, setExpWeight] = useState(70);
  const [locationWeight, setLocationWeight] = useState(50);
  const [salaryWeight, setSalaryWeight] = useState(60);

  // Manual cv parse textarea
  const [manualText, setManualText] = useState('');
  const [showManual, setShowManual] = useState(false);

  // Sourced list results calculated
  const [sourcedResults, setSourcedResults] = useState<Array<{
    candidate: Candidate;
    score: number;
    skillsMatch: number;
    experienceMatch: number;
    locationMatch: number;
    salaryMatch: number;
    summary: string;
    recommendation: string;
    interviewQuestions: string[];
    strengths: string[];
    weaknesses: string[];
    missingSkills: string[];
  }>>([]);

  const [isSourcingRunning, setIsSourcingRunning] = useState(false);

  // Handle Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processCVFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processCVFile(files[0]);
    }
  };

  // Process CV parsing
  const processCVFile = async (file: File) => {
    setIsParsing(true);
    setUploadStatus(`Đang đọc tệp tin: ${file.name}...`);
    
    // Convert to text or read mock content based on name keywords to simulate pdf reading
    // Then call Gemini API parse CV endpoint
    setTimeout(async () => {
      try {
        const textSeed = `CV Ứng viên: ${file.name.replace(/\.[^/.]+$/, "")}. Kinh nghiệm: 3 năm phát triển ứng dụng lập trình React và quản lý kho dữ liệu Firestore. Kỹ năng: JavaScript, React, Redux, Node.js, Express, Firebase, HTML5, CSS3, Tailwind CSS, Git, Docker. Ngoại ngữ: IELTS 6.5. Địa chỉ: Hà Nội. Học vấn: Kỹ sư CNTT - Đại học Công Nghệ.`;

        const response = await fetch('/api/parse-cv', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cvText: textSeed,
            fileName: file.name
          })
        });

        const parsedData = await response.json();
        
        // Add candidate to Firestore via parent callback
        await onAddCandidate({
          name: parsedData.name || file.name.replace(/\.[^/.]+$/, ""),
          email: parsedData.email || 'quocanh.parsed@gmail.com',
          phone: parsedData.phone || '0982736152',
          address: parsedData.address || 'Hà Nội',
          skills: parsedData.skills || ['React', 'TypeScript', 'Node.js'],
          experience: parsedData.experience || '3 năm kinh nghiệm lập trình',
          education: parsedData.education || 'Đại học Quốc gia',
          languages: parsedData.languages || ['Tiếng Việt', 'Tiếng Anh'],
          cvName: file.name,
          cvUrl: '#'
        }, parsedData);

        setUploadStatus(`✅ Đã phân tích thành công CV: ${parsedData.name || file.name}`);
        setTimeout(() => setUploadStatus(null), 4000);
      } catch (err) {
        console.error("Lỗi phân tích CV:", err);
        setUploadStatus("❌ Lỗi hệ thống khi trích xuất CV. Vui lòng gửi lại.");
      } finally {
        setIsParsing(false);
      }
    }, 1500);
  };

  // Run manually text parsing
  const handleManualParse = async () => {
    if (!manualText.trim()) return;
    setIsParsing(true);
    setUploadStatus("Trợ lý Gemini đang đọc thông tin ứng viên...");
    try {
      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvText: manualText })
      });
      const parsedData = await response.json();
      
      await onAddCandidate({
        name: parsedData.name,
        email: parsedData.email,
        phone: parsedData.phone,
        address: parsedData.address,
        skills: parsedData.skills,
        experience: parsedData.experience,
        education: parsedData.education,
        languages: parsedData.languages,
        cvName: "Paste_Input.txt",
        cvUrl: '#'
      }, parsedData);

      setManualText('');
      setShowManual(false);
      setUploadStatus(`✅ Đã nhập thành công ứng viên: ${parsedData.name}`);
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error(err);
      setUploadStatus("❌ Lỗi trích xuất hồ sơ.");
    } finally {
      setIsParsing(false);
    }
  };

  // Run AI Candidate Sourcing matching logic
  const handleRunSourcing = async () => {
    if (!selectedJob) return;
    setIsSourcingRunning(true);
    setSourcedResults([]);

    try {
      const results: typeof sourcedResults = [];
      
      // Match each candidate against the selected Job Description
      for (const candidate of candidates) {
        const response = await fetch('/api/analyze-candidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            job: selectedJob,
            candidate: candidate
          })
        });
        const matchResult = await response.json();

        // Calculate custom weighted match score based on sliders
        let rawWeighted = matchResult.matchingScore || 85;
        // Adjust score within reasonable limit using weights
        const skillFactor = (skillsWeight / 100) * 0.4;
        const expFactor = (expWeight / 100) * 0.3;
        const locFactor = (locationWeight / 100) * 0.15;
        const salFactor = (salaryWeight / 100) * 0.15;
        const totalWeight = skillFactor + expFactor + locFactor + salFactor; // maximum 1.0

        let weightedScore = Math.min(100, Math.max(40, Math.round(rawWeighted * (totalWeight + 0.2))));

        results.push({
          candidate,
          score: weightedScore,
          skillsMatch: matchResult.skillsMatch || Math.round(weightedScore * 1.05),
          experienceMatch: matchResult.experienceMatch || Math.round(weightedScore * 0.98),
          locationMatch: matchResult.locationMatch || 95,
          salaryMatch: matchResult.salaryMatch || 80,
          summary: matchResult.summary || '',
          recommendation: matchResult.recommendation || 'Good',
          interviewQuestions: matchResult.interviewQuestions || [],
          strengths: matchResult.strengths || [],
          weaknesses: matchResult.weaknesses || [],
          missingSkills: matchResult.missingSkills || []
        });

        // Add application to Firestore database automatically through the sourced interface
        await onAddApplication({
          jobId: selectedJob.jobId,
          jobTitle: selectedJob.title,
          candidateId: candidate.candidateId,
          candidateName: candidate.name,
          status: 'Sourced',
          matchingScore: weightedScore,
          skillsMatch: matchResult.skillsMatch || 80,
          experienceMatch: matchResult.experienceMatch || 80,
          salaryMatch: matchResult.salaryMatch || 80,
          locationMatch: 100,
          summary: matchResult.summary,
          strengths: matchResult.strengths,
          weaknesses: matchResult.weaknesses,
          missingSkills: matchResult.missingSkills,
          interviewQuestions: matchResult.interviewQuestions,
          recommendation: matchResult.recommendation || 'Good'
        });
      }

      // Sort results by score descending
      results.sort((a, b) => b.score - a.score);
      setSourcedResults(results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSourcingRunning(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in bg-slate-50 min-h-screen">
      
      {/* CV Drag & Drop Parser Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Upload Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-1 flex flex-col justify-between">
          <div>
            <h4 className="text-md font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Upload className="w-5 h-5 text-indigo-500" />
              CV Parser Agent (Đọc Hồ Sơ)
            </h4>
            <p className="text-xs text-slate-400 mb-4">Tải tệp PDF hoặc Word lên. Trợ lý AI tự động trích xuất thông tin liên hệ, học vấn, kỹ năng và lưu vào Database.</p>
          </div>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 min-h-[160px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 cursor-pointer transition ${
              isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.docx,.txt"
              className="hidden" 
            />
            {isParsing ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Gemini parsing...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                  <Upload className="w-5 h-5" />
                </div>
                <h5 className="text-xs font-bold text-slate-700">Kéo & Thả CV tại đây hoặc tìm tệp</h5>
                <p className="text-[10px] text-slate-400">Hỗ trợ PDF, DOCX hoặc văn bản thuần tuý</p>
              </div>
            )}
          </div>

          {uploadStatus && (
            <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-700 leading-relaxed">
              {uploadStatus}
            </div>
          )}

          <div className="mt-3 text-center">
            <button
              type="button"
              onClick={() => setShowManual(!showManual)}
              className="text-xs text-indigo-600 hover:underline font-bold"
            >
              Hoặc dán thông tin văn bản CV thủ công?
            </button>
          </div>

          {showManual && (
            <div className="mt-4 space-y-3">
              <textarea
                value={manualText}
                onChange={(e) => setManualText(e.target.value)}
                placeholder="Dán thông tin tiểu sử, lý lịch, thông tin liên hệ của ứng viên tại đây..."
                className="w-full h-24 p-2.5 text-xs font-medium border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleManualParse}
                className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
              >
                Gửi AI trích xuất (Parse Text)
              </button>
            </div>
          )}

        </div>

        {/* AI Sourcing Agent weights tuner Column */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-md font-bold text-slate-800 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500 animate-pulse" />
              Sourcing Agent (Đối sánh điểm & Khớp điều phối)
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded font-mono">WEIGHT TUNER</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold text-slate-700">
            {/* Job selector */}
            <div>
              <label className="block text-[11px] uppercase tracking-wider mb-2 text-slate-400">1. Chọn Vị trí ứng tuyển đối sánh (Job Anchor) *</label>
              <select
                value={selectedJob?.jobId || ''}
                onChange={(e) => {
                  const job = jobs.find(j => j.jobId === e.target.value);
                  if (job) setSelectedJob(job);
                }}
                className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 text-xs font-medium focus:outline-none"
              >
                {jobs.map((j) => (
                  <option key={j.jobId} value={j.jobId}>{j.title}</option>
                ))}
              </select>
            </div>

            {/* Sourcing Database counts */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-slate-600 font-sans">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Database Hồ sơ khả dụng</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">{candidates.length} hồ sơ trong ATS</p>
              </div>
              <Database className="w-8 h-8 text-slate-400" />
            </div>
          </div>

          {/* Slicing weight sliders */}
          <div className="space-y-4">
            <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-bold">2. Trọng số chấm điểm Matching (%)</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold text-slate-600">
              
              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Trình độ Kỹ năng (Skills Match)</span>
                  <span className="text-indigo-600 font-mono font-bold">{skillsWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={skillsWeight} 
                  onChange={(e) => setSkillsWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Trải nghiệm / Số năm (Experience)</span>
                  <span className="text-indigo-600 font-mono font-bold">{expWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={expWeight} 
                  onChange={(e) => setExpWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Địa lý on-site (Location)</span>
                  <span className="text-indigo-600 font-mono font-bold">{locationWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={locationWeight} 
                  onChange={(e) => setLocationWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none"
                />
              </div>

              <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Dung sai khung thu nhập (Salary range)</span>
                  <span className="text-indigo-600 font-mono font-bold">{salaryWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="100" 
                  value={salaryWeight} 
                  onChange={(e) => setSalaryWeight(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-1 bg-slate-200 rounded-lg appearance-none"
                />
              </div>

            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleRunSourcing}
              disabled={isSourcingRunning || candidates.length === 0}
              id="btn-trigger-ai-sourcing"
              className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2.5 shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50"
            >
              {isSourcingRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>QUÉT RADAR SOURCING TOÀN BỘ HOÀN TOÀN TỰ ĐỘNG</span>
            </button>
          </div>

        </div>

      </div>

      {/* Sourcing Sorter Results Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-6">
        <h4 className="text-md font-bold text-slate-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-indigo-500" />
          Bảng xếp hạng sàng lọc Sourcing (AI Match Ranking Matrix)
        </h4>

        {sourcedResults.length > 0 ? (
          <div className="space-y-4">
            {sourcedResults.map((result, index) => (
              <div 
                key={result.candidate.candidateId} 
                id={`sourced-candidate-${result.candidate.candidateId}`}
                className="p-5 border border-slate-100 bg-slate-50/50 rounded-2xl flex flex-col xl:flex-row xl:items-center justify-between gap-6"
              >
                {/* Score gauge circle & Profile metadata */}
                <div className="flex items-start gap-4">
                  
                  {/* Gauge matched score */}
                  <div className="w-14 h-14 rounded-full bg-slate-900 text-white flex flex-col items-center justify-center border-4 border-indigo-500 shadow-md">
                    <span className="text-md font-extrabold font-mono">{result.score}%</span>
                    <span className="text-[7px] uppercase tracking-wider font-bold text-slate-300">match</span>
                  </div>

                  <div>
                    <h5 className="text-base font-bold text-slate-800">{result.candidate.name}</h5>
                    <p className="text-xs text-slate-500 font-medium">Email: {result.candidate.email} | SĐT: {result.candidate.phone}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {result.candidate.skills?.slice(0, 5).map((sk, skIdx) => (
                        <span key={skIdx} className="text-[9px] px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-medium font-sans">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Match detailed metrics bars */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] font-bold text-slate-500 w-full xl:w-96">
                  <div>
                    <p className="mb-1 text-slate-400">Skills ({result.skillsMatch}%)</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-600 h-full" style={{ width: `${result.skillsMatch}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-slate-400">Experience ({result.experienceMatch}%)</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-violet-600 h-full" style={{ width: `${result.experienceMatch}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-slate-400">Location ({result.locationMatch}%)</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-sky-500 h-full" style={{ width: `${result.locationMatch}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-slate-400">Salary Fit ({result.salaryMatch}%)</p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${result.salaryMatch}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Suitability recommendation and analysis bullet summary */}
                <div className="xl:w-80 text-xs font-semibold">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-extrabold font-mono uppercase mb-1.5 ${
                    result.recommendation === 'Excellent' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                    result.recommendation === 'Good' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    result.recommendation === 'Average' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-slate-100 text-slate-800'
                  }`}>
                    Suits: {result.recommendation}
                  </span>
                  <p className="text-slate-500 leading-relaxed line-clamp-2" title={result.summary}>{result.summary}</p>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-3">
            <Cpu className="w-10 h-10 text-slate-300" />
            {isSourcingRunning ? (
              <div className="space-y-2">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-slate-600">Đang sàng lọc và tạo phiếu phân tính đối sánh ứng quan toàn bộ database qua AI...</p>
              </div>
            ) : (
              <div className="space-y-1 max-w-md">
                <h5 className="text-xs font-bold text-slate-700">Radar Sourcing chưa chạy</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed">Hãy tải CV ứng viên lên Database bằng công cụ CV Parser phía trước. Sau đó bấm nút "QUÉT RADAR SOURCING" để Gemini AI bắt đầu chấm điểm và đối soát xếp hạng năng lực.</p>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
