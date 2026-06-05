/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  CheckCircle, 
  Clock, 
  Sparkles,
  RefreshCw,
  LogIn,
  Check
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  user: any;
  onLogin: () => void;
  notifications: Array<{
    id: string;
    text: string;
    time: string;
    read: boolean;
  }>;
  onClearNotifications: () => void;
}

export default function Header({ currentTab, user, onLogin, notifications, onClearNotifications }: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Bảng điều khiển (Dashboard)';
      case 'jobs': return 'Tuyển dụng & Trợ lý JDs';
      case 'candidates': return 'Ứng viên & Radar Sourcing';
      case 'interviews': return 'Kế hoạch Phỏng vấn';
      case 'emails': return 'Hòm thư Tự động hóa';
      case 'automation': return 'Quy trình AI Automation';
      case 'reports': return 'Báo cáo Tuyển dụng';
      case 'settings': return 'Cấu hình Tích hợp';
      case 'admin': return 'Bảng Quản trị viên';
      default: return 'Recruitment Agent Pro';
    }
  };

  const getTabSubtitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Phân tích tổng quan số liệu, tỷ lệ chuyển đổi hình thái tuyển dụng.';
      case 'jobs': return 'Quản lý tin tuyển dụng, tự động tối ưu hóa đa kênh tin đăng bằng Gemini.';
      case 'candidates': return 'Tìm kiếm tự động, phân tích chuyên sâu điểm mạnh điểm yếu ứng viên thông qua CV.';
      case 'interviews': return 'Quản lý lịch hẹn, đồng bộ hóa lịch làm việc tuyển dụng tự động.';
      case 'emails': return 'Tự động gửi thông tin báo đỗ/trượt, lập trình kịch bản gửi email tự động.';
      case 'automation': return 'Thực thi pipeline AI tuyển dụng từ đầu đến đuôi tự động không cần can thiệp.';
      case 'reports': return 'Trích xuất báo cáo thống kê định dạng PDF/Excel sắc nét.';
      case 'settings': return 'Đồng bộ kết nối cơ sở dữ liệu Firebase, cổng SMTP và luồng AI Agent.';
      case 'admin': return 'Quản lý cơ cấu nhân sự, cấp vai trò nhiệm vụ tuyển dụng trong tổ chức.';
      default: return 'Hệ quản trị tuyển dụng tối ưu hóa dựa trên sức mạnh của Google Gemini.';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="app-header" className="bg-white/95 backdrop-blur border-b border-slate-200/85 h-20 flex items-center justify-between px-8 sticky top-0 z-40">
      {/* Title & Path */}
      <div>
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold font-sans text-slate-800 tracking-tight">
            {getTabTitle(currentTab)}
          </h2>
          <span className="text-slate-300">/</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono capitalize">
            {currentTab}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">{getTabSubtitle(currentTab)}</p>
      </div>

      {/* Right Tools Controls */}
      <div className="flex items-center space-x-6">
        {/* Connection status log */}
        <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-800 text-xs font-mono font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Firestore Realtime</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            id="notifications-bell-btn"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2.5 rounded-full hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white flex items-center justify-center rounded-full text-[9px] font-bold ring-2 ring-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Window */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Hộp tin thông báo AI
                </span>
                {unreadCount > 0 && (
                  <button 
                    type="button"
                    onClick={() => {
                      onClearNotifications();
                      setShowNotifDropdown(false);
                    }}
                    className="text-xs text-indigo-600 hover:underline font-semibold"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
              
              <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    Không có thông báo mới nào
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div key={notif.id} className="p-4 hover:bg-slate-50 transition">
                      <p className="text-xs font-medium text-slate-700 leading-relaxed">{notif.text}</p>
                      <div className="flex items-center space-x-1 mt-1.5 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Super Login / Simulation button if user is not loaded */}
        {!user ? (
          <button
            type="button"
            id="google-signin-btn"
            onClick={onLogin}
            className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập Google</span>
          </button>
        ) : (
          <div className="flex items-center space-x-3.5 pl-4 border-l border-slate-200">
            <div className="text-right">
              <h4 className="text-sm font-bold text-slate-800">{user.displayName || "HR Admin"}</h4>
              <p className="text-[11px] font-mono text-indigo-600 uppercase font-bold tracking-wider">{user.role || "Super Admin"}</p>
            </div>
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
              className="w-10 h-10 rounded-full border border-slate-300" 
              alt="avatar"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    </header>
  );
}
