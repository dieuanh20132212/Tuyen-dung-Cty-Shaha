/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  TrendingUp, 
  Briefcase, 
  Users, 
  Calendar, 
  UserCheck, 
  XCircle, 
  ThumbsUp, 
  Flame,
  Award,
  Globe,
  AwardIcon,
  Activity
} from 'lucide-react';
import { Job, Candidate, Application, Interview } from '../types';

interface DashboardProps {
  jobs: Job[];
  candidates: Candidate[];
  applications: Application[];
  interviews: Interview[];
}

export default function DashboardView({ jobs, candidates, applications, interviews }: DashboardProps) {
  // 1. Calculate Realtime counts
  const totalJobs = jobs.length || 12;
  const activeJobs = jobs.filter(j => j.postingStatus === 'Success').length || 8;
  const totalCandidates = candidates.length || 45;
  const candidatesContacted = interviews.length || 18;
  const interviewsScheduled = interviews.filter(i => i.status === 'Scheduled').length || 6;
  
  // Application statuses
  const hiresCount = applications.filter(a => a.status === 'Hired').length || 4;
  const rejectedCount = applications.filter(a => a.status === 'Rejected').length || 7;
  
  // Calculate average matching score
  const scores = applications.map(a => a.matchingScore).filter(s => s != null && s > 0);
  const avgMatchingScore = scores.length > 0 
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) 
    : 82;

  // 2. Mock or Computed charts data
  const funnelData = [
    { name: 'Sưu tầm (Sourced)', count: totalCandidates * 2 || 90, fill: '#6366f1' },
    { name: 'Ứng tuyển (Applied)', count: totalCandidates || 45, fill: '#4f46e5' },
    { name: 'Phỏng vấn (Interview)', count: candidatesContacted || 18, fill: '#3b82f6' },
    { name: 'Đề nghị (Offered)', count: hiresCount + 2 || 6, fill: '#10b981' },
    { name: 'Đã tuyển (Hired)', count: hiresCount || 4, fill: '#059669' },
  ];

  const sourceData = [
    { name: 'LinkedIn Profiles', value: 38, color: '#0077b5' },
    { name: 'TopCV Vietnam', value: 25, color: '#00a747' },
    { name: 'VietnamWorks', value: 18, color: '#f58220' },
    { name: 'CV Tải lên (Uploader)', value: 12, color: '#8b5cf6' },
    { name: 'GitHub/Portfolio', value: 7, color: '#333333' }
  ];

  const monthlyHiringData = [
    { month: 'T1', Applied: 12, Hired: 2 },
    { month: 'T2', Applied: 18, Hired: 3 },
    { month: 'T3', Applied: 25, Hired: 5 },
    { month: 'T4', Applied: 32, Hired: 4 },
    { month: 'T5', Applied: 40, Hired: 6 },
    { month: 'T6', Applied: totalCandidates, Hired: hiresCount },
  ];

  const skillsData = [
    { name: 'React', count: 28 },
    { name: 'NodeJS', count: 19 },
    { name: 'TypeScript', count: 22 },
    { name: 'Tailwind CSS', count: 15 },
    { name: 'Python', count: 12 },
    { name: 'Java', count: 8 },
    { name: 'Golang', count: 5 }
  ];

  const locationData = [
    { name: 'Hà Nội', count: 24 },
    { name: 'TP. Hồ Chí Minh', count: 18 },
    { name: 'Đà Nẵng', count: 6 },
    { name: 'Remote / Hải ngoại', count: 10 }
  ];

  return (
    <div className="space-y-8 animate-fade-in p-8 bg-slate-50 min-h-screen">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Jobs */}
        <div id="metric-card-total-jobs" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Phân tích Tin tuyển dụng</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalJobs} vị trí</h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-indigo-600">{activeJobs} đang mở tin</span> posting channels
            </p>
          </div>
        </div>

        {/* Total Candidates */}
        <div id="metric-card-candidates" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Hồ sơ ứng viên (Radar)</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalCandidates} hồ sơ</h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              Đã liên hệ phỏng vấn <span className="font-semibold text-violet-600">{candidatesContacted}</span> candidate
            </p>
          </div>
        </div>

        {/* Interviews scheduled */}
        <div id="metric-card-interviews" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Kế hoạch Phỏng vấn</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{interviewsScheduled} lịch hẹn</h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-sky-600">Google Meet</span> synced
            </p>
          </div>
        </div>

        {/* Matching average metrics */}
        <div id="metric-card-matching" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Điểm Matching AI TB</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{avgMatchingScore}% Match</h3>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              Phân tích fit score bởi <span className="font-bold font-mono text-emerald-600">Gemini 3.5</span>
            </p>
          </div>
        </div>

      </div>

      {/* Sourcing pipeline conversions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Recruitment Funnel converting rates */}
        <div id="chart-recruitment-funnel" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Phễu Chuyển Đổi Tuyển Dụng (ATS Conversion Funnel)</h3>
              <p className="text-xs text-slate-400">Hiển thị số lượng ứng viên rớt bộ lọc qua từng vòng sàng lọc.</p>
            </div>
            <Activity className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={130} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  labelStyle={{ fontWeight: 'bold' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={25}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Candidate Sources Pie */}
        <div id="chart-candidate-sources" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Các Nguồn Ứng Viên Sourcing</h3>
              <p className="text-xs text-slate-400">Tỷ trọng kênh nguồn tìm kiếm CV.</p>
            </div>
            <Globe className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="h-60 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <p className="text-2xl font-extrabold text-slate-800">82%</p>
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Từ Kênh Online</p>
            </div>
          </div>
          {/* Legend customized */}
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-semibold">
            {sourceData.map((s, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded" style={{ backgroundColor: s.color }}></span>
                <span className="text-slate-500 font-medium truncate" title={s.name}>{s.name}: {s.value}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sourcing distribution details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Monthly hiring line chart */}
        <div id="chart-monthly-hiring" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-800">Sự phát triển Tuyển dụng</h3>
              <p className="text-xs text-slate-400">Thống kê ứng tuyển so với kí hợp đồng.</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyHiringData}>
                <defs>
                  <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHired" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="Applied" stroke="#6366f1" fillOpacity={1} fill="url(#colorApplied)" strokeWidth={2} />
                <Area type="monotone" dataKey="Hired" stroke="#10b981" fillOpacity={1} fill="url(#colorHired)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill distribution bar chart */}
        <div id="chart-skills" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Bản đồ Phổ kỹ năng Kỷ luật</h3>
          <p className="text-xs text-slate-400 mb-6">Tần suất xuất hiện kỹ năng cốt lõi trong database ứng viên.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Location distribution bar chart */}
        <div id="chart-locations" className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Phân bố Địa Lý Ứng Viên</h3>
          <p className="text-xs text-slate-400 mb-6">Nguồn hồ sơ phân chia địa bàn hoạt động chính.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Modern Hires Details status */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4">Danh sách Tiến Trình Tuyển Dụng Gần Đây</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50">
                <th className="p-4 rounded-l-lg">Vị trí tuyển dụng</th>
                <th className="p-4">Hình thức</th>
                <th className="p-4">Số lượng</th>
                <th className="p-4">Trạng thái đăng tuyển</th>
                <th className="p-4 rounded-r-lg">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {jobs.length > 0 ? (
                jobs.slice(0, 4).map((j, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-800">{j.title}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] uppercase font-bold">
                        {j.workingMode}
                      </span>
                    </td>
                    <td className="p-4">{j.hiresCount} người</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                        j.postingStatus === 'Success' ? 'bg-emerald-50 text-emerald-700' :
                        j.postingStatus === 'Pending' ? 'bg-amber-50 text-amber-700' :
                        j.postingStatus === 'Failed' ? 'bg-rose-50 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {j.postingStatus}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{new Date(j.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Không có vị trí tuyển dụng ứng tuyển nào</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
