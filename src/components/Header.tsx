import React, { useState } from 'react';
import { Star, ShieldCheck, UserCheck, Plus, Sparkles, Printer, Timer, ChevronDown, UserPlus } from 'lucide-react';
import { StudentProfile, ChildProfile, FamilyProfile } from '../types/homework';

interface HeaderProps {
  profile: StudentProfile;
  family: FamilyProfile;
  activeChild: ChildProfile;
  onSwitchChild: (childId: string) => void;
  onAddChildClick: () => void;
  isParentMode: boolean;
  onToggleParentMode: () => void;
  onOpenCreateModal: () => void;
  onOpenFocusTimer: () => void;
  onOpenPrintModal: () => void;
  activeFilter: 'all' | 'pending' | 'submitted' | 'approved';
  onFilterChange: (filter: 'all' | 'pending' | 'submitted' | 'approved') => void;
  pendingReviewCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  family,
  activeChild,
  onSwitchChild,
  onAddChildClick,
  isParentMode,
  onToggleParentMode,
  onOpenCreateModal,
  onOpenFocusTimer,
  onOpenPrintModal,
  activeFilter,
  onFilterChange,
  pendingReviewCount,
}) => {
  const [showChildMenu, setShowChildMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Single text element wordmark + Child Selector */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <a href="#" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-amber-500/20 group-hover:scale-105 transition-transform">
                ⭐
              </span>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap hidden sm:inline">
                星星作业岛
              </span>
            </a>

            {/* Child Profile Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowChildMenu(!showChildMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs"
              >
                <span>{activeChild.avatar || '👦'}</span>
                <span className="max-w-[70px] truncate">{activeChild.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showChildMenu && (
                <div className="absolute left-0 top-10 z-40 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 text-xs animate-fade-in">
                  <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    切换孩子作业本
                  </div>
                  {family.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => {
                        onSwitchChild(child.id);
                        setShowChildMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between transition-colors ${
                        child.id === activeChild.id
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{child.avatar || '👦'}</span>
                        <span>{child.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal">({child.grade})</span>
                      </span>
                      <span className="text-amber-500 font-bold tabular-nums">⭐ {child.totalStars}</span>
                    </button>
                  ))}
                  <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />
                  <button
                    onClick={() => {
                      setShowChildMenu(false);
                      onAddChildClick();
                    }}
                    className="w-full text-left px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold flex items-center gap-1.5"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ 添加或管理孩子</span>
                  </button>
                </div>
              )}
            </div>

            {/* Profile Star Piggy Bank */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
              <span>{activeChild.name} 的金星:</span>
              <span className="text-amber-600 dark:text-amber-400 font-bold tabular-nums text-sm">
                {activeChild.totalStars}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation filter tabs (functional buttons with clean styling) */}
          <nav className="hidden md:flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <button
              onClick={() => onFilterChange('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              全部作业
            </button>
            <button
              onClick={() => onFilterChange('pending')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'pending'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              待完成
            </button>
            <button
              onClick={() => onFilterChange('submitted')}
              className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'submitted'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              待检查
              {pendingReviewCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-600 text-white">
                  {pendingReviewCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onFilterChange('approved')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeFilter === 'approved'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              已盖章完成
            </button>
          </nav>

          {/* Zone 3: 1 primary action & role switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Focus Timer CTA */}
            <button
              onClick={onOpenFocusTimer}
              title="作业专注番茄钟"
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Timer className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">专注计时</span>
            </button>

            {/* Print Summary */}
            <button
              onClick={onOpenPrintModal}
              title="生成今日作业清单或打印卡片"
              className="p-2 sm:px-3 sm:py-2 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden lg:inline">清单打印</span>
            </button>

            {/* Parent / Student Role Toggle */}
            <button
              onClick={onToggleParentMode}
              className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap border ${
                isParentMode
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm shadow-purple-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
              }`}
            >
              {isParentMode ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>家长审核模式</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-amber-500" />
                  <span>学生模式</span>
                </>
              )}
            </button>

            {/* Primary Action Button: Add Homework */}
            <button
              onClick={onOpenCreateModal}
              className="px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-xl transition-all shadow-sm shadow-blue-600/20 flex items-center gap-1.5 whitespace-nowrap active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>记作业</span>
            </button>
          </div>

        </div>
      </div>

      {/* Mobile filter strip */}
      <div className="md:hidden flex items-center justify-around px-3 py-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto">
        <button
          onClick={() => onFilterChange('all')}
          className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          全部
        </button>
        <button
          onClick={() => onFilterChange('pending')}
          className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeFilter === 'pending'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          待完成
        </button>
        <button
          onClick={() => onFilterChange('submitted')}
          className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'submitted'
              ? 'bg-blue-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          待检查
          {pendingReviewCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-500 text-white">
              {pendingReviewCount}
            </span>
          )}
        </button>
        <button
          onClick={() => onFilterChange('approved')}
          className={`px-3 py-1 text-xs font-medium rounded-lg whitespace-nowrap ${
            activeFilter === 'approved'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          已盖章
        </button>
      </div>
    </header>
  );
};
