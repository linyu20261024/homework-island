import React, { useState } from 'react';
import {
  Plus,
  X,
  Check,
  Mic,
  Camera,
  Calendar,
  Clock,
  Sparkles,
} from 'lucide-react';
import { HomeworkTask, SubjectType, SUBJECT_METAS } from '../types/homework';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<HomeworkTask, 'id' | 'createdAt' | 'status'>) => void;
  onOpenVoice: () => void;
  onOpenPhoto: () => void;
  childrenList: Array<{ id: string; name: string; avatar: string }>;
  activeChildId: string;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  onOpenVoice,
  onOpenPhoto,
  childrenList,
  activeChildId,
}) => {
  if (!isOpen) return null;

  const [targetChildId, setTargetChildId] = useState<string>(activeChildId);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('chinese');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueTime, setDueTime] = useState<string>('20:00');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(20);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('请输入作业名称');
      return;
    }

    onSaveTask({
      childId: targetChildId,
      title: title.trim(),
      subject,
      description: description.trim() || undefined,
      dueDate,
      dueTime,
      estimatedMinutes,
    });

    setTitle('');
    setDescription('');
    onClose();
  };

  const handleQuickPreset = (presetTitle: string, presetSubject: SubjectType, mins: number) => {
    setTitle(presetTitle);
    setSubject(presetSubject);
    setEstimatedMinutes(mins);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                布置 / 记录新作业
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                支持语音、拍照或快速选择模版
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick shortcut cards for Voice / Photo */}
        <div className="grid grid-cols-2 gap-2.5 my-4">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenVoice();
            }}
            className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/40 text-left hover:border-amber-400 transition-colors flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                语音说作业
              </div>
              <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                识别语音免打字
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenPhoto();
            }}
            className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/40 text-left hover:border-blue-400 transition-colors flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                拍照记录作业
              </div>
              <div className="text-[11px] text-blue-700/80 dark:text-blue-400/80">
                拍黑板/作业单
              </div>
            </div>
          </button>
        </div>

        {/* Manual Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Child Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              布置给哪个孩子：
            </label>
            <div className="flex flex-wrap gap-1.5">
              {childrenList.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setTargetChildId(c.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                    targetChildId === c.id
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{c.avatar}</span>
                  <span>{c.name}</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setTargetChildId('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all ${
                  targetChildId === 'all'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>👫</span>
                <span>共同作业</span>
              </button>
            </div>
          </div>

          {/* Subject Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              选择学科：
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {(Object.keys(SUBJECT_METAS) as SubjectType[]).map((subKey) => {
                const meta = SUBJECT_METAS[subKey];
                const isSelected = subject === subKey;
                return (
                  <button
                    key={subKey}
                    type="button"
                    onClick={() => setSubject(subKey)}
                    className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-[11px] text-slate-400 block mb-1">
              ⚡ 常见任务快捷填入：
            </span>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => handleQuickPreset('背诵古诗两首并录音', 'chinese', 15)}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                古诗背诵录音
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('生字抄写本2课各写3遍', 'chinese', 20)}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                生字抄写
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('数学口算小练习册1页', 'math', 15)}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                数学口算1页
              </button>
              <button
                type="button"
                onClick={() => handleQuickPreset('跳绳打卡2组每组150个', 'sports', 10)}
                className="px-2 py-0.5 rounded text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
              >
                跳绳打卡
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              作业任务标题：
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：数学课本第38页第1-5题"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              详细要求说明（可选）：
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="例如：要求字迹端正，完成后需拍照上传练习册。"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium outline-none"
            />
          </div>

          {/* Date, Time, Duration */}
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>截止日期</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>截止时间</span>
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>预估用时(分)</span>
              </label>
              <input
                type="number"
                min="5"
                max="180"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 20)}
                className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>
          </div>

          {/* Footer actions */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              取消
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>添加此项作业</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
