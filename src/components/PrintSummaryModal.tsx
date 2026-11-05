import React, { useState } from 'react';
import {
  Printer,
  X,
  Copy,
  Check,
  Calendar,
  Star,
  FileText,
} from 'lucide-react';
import { HomeworkTask, StudentProfile, SUBJECT_METAS } from '../types/homework';

interface PrintSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: HomeworkTask[];
  profile: StudentProfile;
}

export const PrintSummaryModal: React.FC<PrintSummaryModalProps> = ({
  isOpen,
  onClose,
  tasks,
  profile,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const todayStr = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const lines = [
      `📝 【${profile.studentName}的今日作业清单】（${todayStr}）`,
      `⭐ 当前荣誉金星：${profile.totalStars} 颗`,
      '--------------------------------',
      ...tasks.map((t, idx) => {
        const meta = SUBJECT_METAS[t.subject] || SUBJECT_METAS.other;
        const statusMap = {
          pending: '[待完成]',
          submitted: '[已提交待审]',
          approved: '[✅已完成]',
          revision: '[需订正]',
        };
        return `${idx + 1}. [${meta.label}] ${t.title} ${statusMap[t.status]} ${t.dueTime ? `(截止${t.dueTime})` : ''}`;
      }),
      '--------------------------------',
      '说明：学生提交作业后家长盖章判定完成。',
    ];

    navigator.clipboard.writeText(lines.join('\n')).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              今日作业打卡清单 · 打印与导出
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Printable Paper Card */}
        <div className="my-5 p-6 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl print:m-0 print:p-0 print:border-none">
          <div className="text-center pb-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              ⭐ {profile.studentName} 的每日家庭作业打卡单
            </h2>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-3">
              <span>{profile.grade}</span>
              <span>·</span>
              <span>{todayStr}</span>
              <span>·</span>
              <span>总金星：{profile.totalStars} 颗</span>
            </div>
          </div>

          {/* Task rows */}
          <div className="divide-y divide-slate-200 dark:divide-slate-700 my-4">
            {tasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                暂无作业任务
              </div>
            ) : (
              tasks.map((task, idx) => {
                const meta = SUBJECT_METAS[task.subject] || SUBJECT_METAS.other;
                return (
                  <div key={task.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center mt-0.5 font-bold shrink-0">
                        {task.status === 'approved' ? '✓' : ''}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200">
                          {idx + 1}. [{meta.label}] {task.title}
                        </div>
                        {task.description && (
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            {task.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-semibold text-slate-600 dark:text-slate-400">
                        {task.status === 'approved' ? (
                          <span className="text-emerald-600 font-bold">已盖章合格</span>
                        ) : task.status === 'submitted' ? (
                          <span className="text-blue-600 font-bold">已提交待审</span>
                        ) : (
                          <span>待提交</span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {task.dueTime ? `截止 ${task.dueTime}` : ''}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Signature block */}
          <div className="pt-4 border-t border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-2 text-xs text-slate-600 dark:text-slate-400">
            <div>
              <span>学生自我评价：__________________</span>
            </div>
            <div className="text-right">
              <span>家长确认签字：__________________</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleCopyText}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '已复制文本' : '复制文本清单'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>立即打印清单</span>
          </button>
        </div>

      </div>
    </div>
  );
};
