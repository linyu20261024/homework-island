import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Camera,
  Mic,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  ChevronRight,
  MoreVertical,
  Trash2,
  FileCheck2,
  Play,
  RotateCcw,
} from 'lucide-react';
import { HomeworkTask, SUBJECT_METAS } from '../types/homework';
import { speakText, stopSpeaking } from '../services/speech';

interface TaskCardProps {
  task: HomeworkTask;
  isParentMode: boolean;
  onSubmitHomework: (task: HomeworkTask) => void;
  onReviewHomework: (task: HomeworkTask) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isParentMode,
  onSubmitHomework,
  onReviewHomework,
  onDeleteTask,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const subjectMeta = SUBJECT_METAS[task.subject] || SUBJECT_METAS.other;

  // Read homework title & description aloud
  const handleReadAloud = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      const textToRead = `${subjectMeta.label}作业：${task.title}。${task.description || ''}。预估用时${task.estimatedMinutes || 20}分钟。`;
      speakText(textToRead, () => setIsSpeaking(false));
    }
  };

  // Play student's recorded audio proof if present
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.submission?.audioUrl) return;
    const audio = new Audio(task.submission.audioUrl);
    setIsPlayingAudio(true);
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play();
  };

  // Student direct click on completion circle
  const handleCircleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (task.status === 'pending' || task.status === 'revision') {
      onSubmitHomework(task);
    } else if (task.status === 'submitted') {
      if (isParentMode) {
        onReviewHomework(task);
      } else {
        alert('作业已提交成功！正在等待家长检查与盖章哦。请提醒爸爸妈妈来审核～');
      }
    }
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-900 border rounded-2xl p-5 transition-all duration-200 hover:shadow-md ${
        task.status === 'approved'
          ? 'border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/20 dark:bg-emerald-950/10'
          : task.status === 'submitted'
          ? 'border-blue-200 dark:border-blue-900/50 bg-blue-50/20 dark:bg-blue-950/10'
          : task.status === 'revision'
          ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50/30 dark:bg-amber-950/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      {/* Top row: Subject & metadata */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {/* Subject badge */}
          <span
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${subjectMeta.bgLight} ${subjectMeta.color} ${subjectMeta.borderColor}`}
          >
            <span>{subjectMeta.icon}</span>
            <span>{subjectMeta.label}</span>
          </span>

          {/* Clean unboxed metadata with dot separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            {task.dueTime && (
              <>
                <span className="tabular-nums">截止 {task.dueTime}</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            {task.estimatedMinutes && (
              <span className="tabular-nums">约 {task.estimatedMinutes}分钟</span>
            )}
          </div>
        </div>

        {/* Right tools: TTS speaker & parent menu */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleReadAloud}
            title={isSpeaking ? '停止朗读' : '朗读作业要求'}
            className={`p-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 ${
              isSpeaking
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 animate-pulse'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="text-[11px] font-medium hidden sm:inline">
              {isSpeaking ? '播报中' : '听题目'}
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-20 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 text-xs">
                {isParentMode && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onReviewHomework(task);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                  >
                    <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
                    <span>审核此作业</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDeleteTask(task.id);
                  }}
                  className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除作业</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Task Body */}
      <div className="flex items-start gap-3 mb-4">
        {/* Completion Status Circle (cannot be blindly checked off!) */}
        <button
          onClick={handleCircleClick}
          title={
            task.status === 'approved'
              ? '已审核判定完成'
              : task.status === 'submitted'
              ? '已提交，等待家长盖章'
              : '点击提交作业成果（拍照或录音）'
          }
          className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90 ${
            task.status === 'approved'
              ? 'bg-emerald-500 text-white'
              : task.status === 'submitted'
              ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300 ring-2 ring-blue-500/30'
              : task.status === 'revision'
              ? 'bg-amber-100 text-amber-700 border-2 border-dashed border-amber-500'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 hover:bg-blue-50/50'
          }`}
        >
          {task.status === 'approved' ? (
            <CheckCircle className="w-4 h-4 fill-emerald-500 text-white" />
          ) : task.status === 'submitted' ? (
            <Clock className="w-3.5 h-3.5" />
          ) : task.status === 'revision' ? (
            <RotateCcw className="w-3 h-3 text-amber-700" />
          ) : (
            <span className="text-[10px] text-slate-400 font-bold">待</span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`text-base font-bold text-slate-900 dark:text-white leading-snug ${
              task.status === 'approved' ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {task.description}
            </p>
          )}

          {/* Blackboard photo prompt if attached */}
          {task.photoPromptUrl && (
            <div className="mt-2.5">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">
                📌 作业单/黑板要求照片：
              </span>
              <img
                src={task.photoPromptUrl}
                alt="黑板或作业单要求"
                className="max-h-36 rounded-xl border border-slate-200 dark:border-slate-700 object-cover"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submission Preview (if submitted or approved) */}
      {task.submission && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between mb-2">
            <span className="flex items-center gap-1.5">
              <FileCheck2 className="w-3.5 h-3.5 text-blue-500" />
              <span>学生已提交的作业证明：</span>
            </span>
            {task.submission.timeSpentMinutes && (
              <span className="text-[11px] text-slate-400 font-normal">
                用时约 {task.submission.timeSpentMinutes} 分钟
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Photo preview */}
            {task.submission.photoUrl && (
              <div className="relative group">
                <img
                  src={task.submission.photoUrl}
                  alt="作业拍照提交"
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 dark:border-slate-700 cursor-pointer group-hover:opacity-90 shadow-xs"
                  onClick={() => {
                    const win = window.open();
                    win?.document.write(`<img src="${task.submission?.photoUrl}" style="max-width:100%;height:auto;margin:auto;" />`);
                  }}
                />
                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[9px] bg-black/70 text-white">
                  放大
                </span>
              </div>
            )}

            {/* Audio player */}
            {task.submission.audioUrl && (
              <button
                onClick={handlePlayAudio}
                className="px-3 py-2 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
              >
                <Play className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-spin' : ''}`} />
                <span>{isPlayingAudio ? '播放背诵中...' : '播放朗读录音'}</span>
              </button>
            )}

            {/* Notes */}
            {task.submission.notes && (
              <div className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 px-3 py-2 rounded-xl flex-1 min-w-[180px]">
                “{task.submission.notes}”
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review & Award Stamped Area (when approved) */}
      {task.status === 'approved' && task.review && (
        <div className="mt-3.5 pt-3 border-t border-emerald-100 dark:border-emerald-950/60 bg-emerald-50/40 dark:bg-emerald-950/30 -mx-5 -mb-5 p-4 rounded-b-2xl">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                ✅ {task.review.reviewerName || '家长'}已判定合格
              </span>
              <div className="flex text-amber-400">
                {Array.from({ length: task.review.starsAwarded }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                ))}
              </div>
            </div>
            <span className="text-[10px] text-slate-400">
              {new Date(task.review.reviewedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Badges awarded */}
          {task.review.badgesAwarded?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {task.review.badgesAwarded.map((badge, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-200/50"
                >
                  🏅 {badge}
                </span>
              ))}
            </div>
          )}

          {task.review.comment && (
            <p className="text-xs text-emerald-900 dark:text-emerald-200">
              评语：“{task.review.comment}”
            </p>
          )}
        </div>
      )}

      {/* Revision hint if rejected */}
      {task.status === 'revision' && task.review && (
        <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-xs">
          <div className="flex items-center gap-1 text-amber-800 dark:text-amber-300 font-bold mb-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>家长退回订正建议：</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300">{task.review.comment}</p>
        </div>
      )}

      {/* Action Bar based on task state */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        {/* Left State Notice */}
        <div className="text-xs font-medium">
          {task.status === 'pending' && (
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>需提交作业后完成</span>
            </span>
          )}
          {task.status === 'submitted' && (
            <span className="text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span>已提交 · 等待家长审核</span>
            </span>
          )}
          {task.status === 'approved' && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
              🎉 任务圆满完成！
            </span>
          )}
          {task.status === 'revision' && (
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              ⚠️ 需订正后重新提交
            </span>
          )}
        </div>

        {/* Right CTA Buttons */}
        <div className="flex items-center gap-2">
          {/* If pending or revision: Student submits homework */}
          {(task.status === 'pending' || task.status === 'revision') && (
            <button
              onClick={() => onSubmitHomework(task)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{task.status === 'revision' ? '重新提交订正' : '📸 提交我的作业'}</span>
            </button>
          )}

          {/* If submitted: Parent Review button or re-edit */}
          {task.status === 'submitted' && isParentMode && (
            <button
              onClick={() => onReviewHomework(task)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>🔍 检查作业并盖章</span>
            </button>
          )}

          {task.status === 'submitted' && !isParentMode && (
            <button
              onClick={() => onSubmitHomework(task)}
              className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              修改提交
            </button>
          )}

          {/* If approved: Parent can re-review or adjust stars */}
          {task.status === 'approved' && isParentMode && (
            <button
              onClick={() => onReviewHomework(task)}
              className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              查看评价
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
