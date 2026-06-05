/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  Mail, 
  Cpu, 
  FileText, 
  Settings, 
  ShieldAlert,
  UserCheck,
  ChevronRight,
  LogOut,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
  onCloseMobile?: () => void;
}

export default function Sidebar({ currentTab, setCurrentTab, user, onLogout, onCloseMobile }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', name: 'Tin tuyển dụng (Jobs)', icon: Briefcase },
    { id: 'candidates', name: 'Hồ sơ tuyển dụng', icon: Users },
    { id: 'interviews', name: 'Lịch phỏng vấn', icon: Calendar },
    { id: 'emails', name: 'Hệ thống Email', icon: Mail },
    { id: 'automation', name: 'Tuyển dụng tự động (Workflow)', icon: Cpu },
    { id: 'reports', name: 'Báo cáo thông minh', icon: FileText },
    { id: 'settings', name: 'Cài đặt hệ thống', icon: Settings },
    { id: 'admin', name: 'Quản trị viên (Admin)', icon: ShieldAlert },
  ];

  return (
    <aside id="app-sidebar" className="w-72 sm:w-80 bg-slate-900 text-slate-100 flex flex-col h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30 shrink-0">
            <Sparkles className="w-6 h-6 text-white text-indigo-100" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-wider text-white flex items-center">
              SHAHA <span className="text-indigo-400 font-mono ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-800 tracking-normal font-sans uppercase">RECRUIT</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 font-semibold mt-0.5">Hệ thống Tuyển dụng Shaha</p>
          </div>
        </div>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
            title="Đóng bảng chọn"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
        )}
      </div>

      {/* User Information Profile */}
      {user && (
        <div className="p-4 mx-4 my-4 bg-slate-800/50 rounded-xl border border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
              alt={user.displayName || "Recruiter"} 
              className="w-10 h-10 rounded-lg bg-slate-700 border border-slate-600"
              referrerPolicy="no-referrer"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-slate-200 truncate">{user.displayName || "Chuyên viên HR"}</p>
              <div className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs text-slate-400 font-mono font-medium truncate">{user.role || "Super Admin"}</span>
              </div>
            </div>
          </div>
          <button 
            type="button"
            onClick={onLogout}
            title="Đăng xuất"
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-rose-400 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = currentTab === item.id;
          const IconComponent = item.icon;
          return (
            <button
              key={item.id}
              id={`sidebar-link-${item.id}`}
              type="button"
              onClick={() => {
                setCurrentTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition duration-150 ${
                isActive 
                  ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4 text-white opacity-80" />}
            </button>
          );
        })}
      </nav>

      {/* System Footer Signature */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500 font-mono">
        <span>V1.0.0 Stable</span>
        <span>Vietnamese Default</span>
      </div>
    </aside>
  );
}
