import React from 'react';
import { Star, Flame, Mic, Camera, CheckCircle2, Clock } from 'lucide-react';
import { StudentProfile, HomeworkTask } from '../types/homework';

interface StudentStatsProps {
  profile: StudentProfile;
  tasks: HomeworkTask[];
  onOpenVoice: () => void;
  onOpenPhoto: () => void;
  onOpenFocusTimer: () => void;
}

export const StudentStats: React.FC<StudentStatsProps> = ({
  profile,
  tasks,
  onOpenVoice,
  onOpenPhoto,
  onOpenFocusTimer,
}) => {
  const totalCount = tasks.length;
  const approvedCount = tasks.filter((t) => t.status === 'approved').length;
  const submittedCount = tasks.filter((t) => t.status === 'submitted').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending' || t.status === 'revision').length;

  const percent = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 dark:from-slate-800 dark:via-indigo-950 dark:to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 mb-8 relative overflow-hidden">
      {/* Decorative background glow circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Left: Greeting & Progress */}
        <div className="max-w-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-wider font-semibold text-blue-200">
              {profile.grade} · 学习小天地
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
            加油，{profile.studentName}！
          </h1>

          <p className="text-blue-100/90 text-sm mb-5">
            {pendingCount === 0 && totalCount > 0
              ? '太棒了！所有作业都已完成或正在等待家长盖章啦！🎉'
              : `今天还有 ${pendingCount} 项作业待完成。做完后记得提交拍照或录音，家长审核就能盖章领星星啦！`}
          </p>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-100">
              <span>完成进度</span>
              <span className="tabular-nums">
                {approvedCount} / {totalCount} 项 ({percent}%)
              </span>
            </div>
            <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: Quick Star Metrics & Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch gap-4 shrink-0">
          
          {/* Star & Streak Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 flex sm:flex-col justify-around items-center gap-3 min-w-[140px]">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold shadow-xs">
                ⭐
              </div>
              <div>
                <div className="text-[11px] text-blue-200">荣誉金星</div>
                <div className="text-xl font-black text-amber-300 tabular-nums">
                  {profile.totalStars}
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-orange-500/80 text-white flex items-center justify-center">
                <Flame className="w-4 h-4 fill-white" />
              </div>
              <div>
                <div className="text-[11px] text-blue-200">连续打卡</div>
                <div className="text-xl font-black text-white tabular-nums">
                  {profile.streakDays} 天
                </div>
              </div>
            </div>
          </div>

          {/* Quick Input Shortcut Buttons for Kids */}
          <div className="flex flex-col gap-2.5 justify-center">
            <button
              onClick={onOpenVoice}
              className="px-4 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-bold text-sm shadow-md shadow-amber-400/20 flex items-center gap-2.5 transition-all active:scale-95"
            >
              <Mic className="w-5 h-5 text-slate-950" />
              <span>按住说话记作业</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenPhoto}
                className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-medium text-xs border border-white/20 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>拍照录入</span>
              </button>

              <button
                onClick={onOpenFocusTimer}
                className="px-3 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-medium text-xs border border-white/20 flex items-center justify-center gap-1.5 transition-colors active:scale-95"
              >
                <Clock className="w-4 h-4 text-amber-300" />
                <span>专注写作业</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
