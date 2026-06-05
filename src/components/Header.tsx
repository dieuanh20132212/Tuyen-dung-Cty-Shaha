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
  Check,
  Menu
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
  onToggleSidebar?: () => void;
}

export default function Header({ currentTab, user, onLogin, notifications, onClearNotifications, onToggleSidebar }: HeaderProps) {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Bảng điều khiển (Dashboard)';
      case 'jobs': return 'Tuyển dụng & Trợ lý JDs';
      case 'candidates': return 'Ứng viên & Sourcing';
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
      case 'jobs': return 'Quản lý tin tuyển dụng, tự động tối ưu hóa bằng Gemini.';
      case 'candidates': return 'Tìm kiếm tự động, phân tích chuyên sâu điểm mạnh ứng viên qua CV.';
      case 'interviews': return 'Quản lý lịch hẹn, đồng bộ trực tuyến tự động.';
      case 'emails': return 'Tự động gửi thông tin báo đỗ/trượt, lập trình chiến dịch email.';
      case 'automation': return 'Thực thi pipeline AI tuyển dụng tự động từ đầu đến đuôi.';
      case 'reports': return 'Trích xuất báo cáo thống kê định dạng PDF/Excel sắc nét.';
      case 'settings': return 'Đồng bộ kết nối cơ sở dữ liệu Firebase và luồng AI Agent.';
      case 'admin': return 'Quản lý cơ cấu nhân sự, phân vai trò nhiệm vụ tuyển dụng.';
      default: return 'Hệ quản trị tuyển dụng tối ưu hóa dựa trên sức mạnh của Google Gemini.';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header id="app-header" className="bg-white/95 backdrop-blur border-b border-slate-200/85 h-20 flex items-center justify-between px-4 sm:px-6 md:px-8 sticky top-0 z-40">
      {/* Title & Path with Hamburger */}
      <div className="flex items-center space-x-3.5 min-w-0 flex-1 mr-2">
        {onToggleSidebar && (
          <button
            type="button"
            id="mobile-sidebar-toggle-btn"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 -ml-1 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer shrink-0 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            title="Mở bảng chọn"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h2 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold font-sans text-slate-800 tracking-tight truncate">
              {getTabTitle(currentTab)}
            </h2>
            <span className="text-slate-300 hidden md:inline">/</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 font-mono capitalize hidden md:inline">
              {currentTab}
            </span>
          </div>
          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 truncate max-w-[190px] xs:max-w-[240px] sm:max-w-sm md:max-w-none">{getTabSubtitle(currentTab)}</p>
        </div>
      </div>

      {/* Right Tools Controls */}
      <div className="flex items-center space-x-2.5 xs:space-x-4 md:space-x-6 shrink-0">
        {/* Connection status log */}
        <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100 text-emerald-800 text-xs font-mono font-medium">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Firestore Realtime</span>
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            id="notifications-bell-btn"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-600 hover:text-indigo-600 transition relative cursor-pointer"
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
            <div className="absolute right-0 mt-3 w-72 xs:w-80 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5">
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
                    className="text-[11px] text-indigo-600 hover:underline font-semibold"
                  >
                    Đọc hết
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
            className="flex items-center space-x-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Đăng nhập</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2 md:space-x-3 pl-2.5 sm:pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <h4 className="text-xs sm:text-sm font-bold text-slate-800">{user.displayName || "HR Admin"}</h4>
              <p className="text-[10px] font-mono text-indigo-600 uppercase font-bold tracking-wider">{user.role || "Super Admin"}</p>
            </div>
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.email}`}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-200" 
              alt="avatar"
              referrerPolicy="no-referrer"
            />
          </div>
        )}
      </div>
    </header>
  );
}
