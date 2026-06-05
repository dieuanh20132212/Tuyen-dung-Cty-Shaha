/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Activity, 
  Lock, 
  UserPlus2, 
  Fingerprint,
  UserCheck
} from 'lucide-react';

export default function AdminView() {
  const [team, setTeam] = useState([
    { id: '1', name: 'Nguyễn Quốc Anh', email: 'quocanh.hr@gmail.com', role: 'Super Admin', status: 'Active' },
    { id: '2', name: 'Trần Thị Mai', email: 'maitran.recruiter@company.com', role: 'Recruiter', status: 'Active' },
    { id: '3', name: 'Lê Minh Thành', email: 'thanhle.sourcing@company.com', role: 'Talent Sourcer', status: 'Active' },
    { id: '4', name: 'Phan Hoàng Diệu', email: 'dieuphan.hr@agency.vn', role: 'Recruiter', status: 'Inactive' }
  ]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Recruiter');

  const [logs] = useState([
    { id: 101, user: 'quocanh.hr@gmail.com', action: 'Kích hoạt chiến dịch Sourcing vị trí Senior React Dev', time: '10 phút trước' },
    { id: 102, user: 'maitran.recruiter@company.com', action: 'Tải tệp đính kèm và kích hoạt CV Parser (Auto extraction)', time: '40 phút trước' },
    { id: 103, user: 'quocanh.hr@gmail.com', action: 'Thay đổi kịch bản rules tự động gửi Email mời phỏng vấn thành BẬT', time: '2 giờ trước' },
    { id: 104, user: 'system_pipeline', action: 'Bắn Email mời hẹn phỏng vấn tới quocanh.parsed@gmail.com thành công', time: '5 giờ trước' },
    { id: 105, user: 'thanhle.sourcing@company.com', action: 'Cấu hình đồng bộ cổng SMTP máy chủ mail', time: '1 ngày trước' }
  ]);

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setTeam([
      ...team,
      {
        id: String(Date.now()),
        name,
        email,
        role,
        status: 'Active'
      }
    ]);
    setName('');
    setEmail('');
  };

  const handleDeleteMember = (id: string) => {
    setTeam(team.filter(m => m.id !== id));
  };

  const handleToggleStatus = (id: string) => {
    setTeam(team.map(m => m.id === id ? { ...m, status: m.status === 'Active' ? 'Inactive' : 'Active' } : m));
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in bg-slate-50 min-h-screen text-xs font-semibold text-slate-707">
      
      {/* Management columns split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: HR Team directory listing (2 spans) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h4 className="text-md font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-indigo-500 animate-pulse" />
              Bảng quản trị Người dùng & Vai trò (Recruiting Staff Team)
            </h4>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded font-mono">STAFF DIRECTORY</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-semibold bg-slate-50">
                  <th className="p-4 rounded-l-lg">Họ và tên</th>
                  <th className="p-4">Email phòng ban</th>
                  <th className="p-4">Vai trò định danh</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-center rounded-r-lg">Hủy quyền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {team.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition">
                    <td className="p-4 font-bold text-slate-900">{m.name}</td>
                    <td className="p-4 font-mono text-slate-500">{m.email}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-100 text-slate-700 border border-slate-200">
                        {m.role}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(m.id)}
                        className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                          m.status === 'Active' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {m.status}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteMember(m.id)}
                        className="p-1 rounded bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add team member card */}
          <div className="pt-4 border-t border-slate-100">
            <h5 className="text-xs font-bold text-slate-800 flex items-center gap-1 mb-3">
              <UserPlus2 className="w-4 h-4 text-indigo-500" /> Cấp quyền nhân viên tuyển dụng mới
            </h5>
            <form onSubmit={handleAddMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Họ tên nhân viên</label>
                <input 
                  type="text" 
                  required
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="Ví dụ: Tran Thi B"
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Thư điện tử (Email)</label>
                <input 
                  type="email" 
                  required
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="name@company.com"
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-bold mb-1">Vai trò phân nhiệm</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full text-xs font-medium p-2.5 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none"
                >
                  <option value="Admin">Admin (Quản trị hệ thống)</option>
                  <option value="Recruiter">Recruiter (Tuyển dụng chuyên viên)</option>
                  <option value="Talent Sourcer">Talent Sourcer (radar CV Parser)</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-850 font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Cấp quyền truy cập</span>
                </button>
              </div>
            </form>
          </div>

        </div>

        {/* Right Column: Security Audits Log Trails */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-5 h-[480px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Fingerprint className="w-5 h-5 text-indigo-500 animate-pulse" />
                Nhật ký An ninh (Security Audit Trails)
              </h4>
              <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono font-bold tracking-wider">COMPLIANT</span>
            </div>

            <div className="space-y-4 overflow-y-auto max-h-72 text-slate-600 font-medium leading-relaxed">
              {logs.map((log) => (
                <div key={log.id} className="text-[10px] flex items-start space-x-2 border-b border-slate-50 pb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 animate-pulse"></div>
                  <div>
                    <p className="text-slate-800 font-bold leading-snug">{log.action}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{log.user} • {log.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <p className="text-[10px] text-indigo-800 font-semibold leading-relaxed">
              Cơ chế phân loại vai trò tuân thủ nghiêm ngặt theo các phương châm Zero-Trust của AI Studio Build. Mọi hành vi đột biến đều được ghi vết an toàn.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
