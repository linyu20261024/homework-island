import React, { useState } from 'react';
import {
  CheckCircle2,
  X,
  Star,
  RotateCcw,
  Play,
  Volume2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  HomeworkTask,
  HomeworkReview,
  SUBJECT_METAS,
  REWARD_BADGES,
} from '../types/homework';

interface ReviewModalProps {
  task: HomeworkTask | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (taskId: string, review: HomeworkReview) => void;
  onRejectForRevision: (taskId: string, feedbackNote: string) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  task,
  isOpen,
  onClose,
  onApprove,
  onRejectForRevision,
}) => {
  if (!isOpen || !task) return null;

  const [stars, setStars] = useState<number>(task.review?.starsAwarded || 3);
  const [selectedBadges, setSelectedBadges] = useState<string[]>(
    task.review?.badgesAwarded || ['书写工整', '自主自觉']
  );
  const [comment, setComment] = useState<string>(
    task.review?.comment || '今天非常自觉，字迹清晰工整，值得表扬！'
  );
  const [reviewerName, setReviewerName] = useState<string>(
    task.review?.reviewerName || '家长'
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('请检查订正错误，完成后重新提交拍照～');

  const subjectMeta = SUBJECT_METAS[task.subject] || SUBJECT_METAS.other;
  const submission = task.submission;

  const handlePlayAudio = () => {
    if (!submission?.audioUrl) return;
    const audio = new Audio(submission.audioUrl);
    setIsPlayingAudio(true);
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play();
  };

  const toggleBadge = (badgeLabel: string) => {
    if (selectedBadges.includes(badgeLabel)) {
      setSelectedBadges(selectedBadges.filter((b) => b !== badgeLabel));
    } else {
      setSelectedBadges([...selectedBadges, badgeLabel]);
    }
  };

  const handleQuickPraise = (text: string) => {
    setComment(text);
  };

  const handleApproveConfirm = () => {
    // Fire confetti celebration!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899'],
      });
    } catch {
      // ignore
    }

    const review: HomeworkReview = {
      reviewedAt: new Date().toISOString(),
      reviewerName: reviewerName.trim() || '家长',
      starsAwarded: stars,
      badgesAwarded: selectedBadges,
      comment: comment.trim(),
      isApproved: true,
    };

    onApprove(task.id, review);
    onClose();
  };

  const handleRejectConfirm = () => {
    if (!rejectFeedback.trim()) {
      alert('请输入给孩子的订正建议');
      return;
    }
    onRejectForRevision(task.id, rejectFeedback.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                家长/老师作业审核台
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                检查学生提交的作业成果，给予星星印章与激励评语
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

        {/* Task Title & Details */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-700/70">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded text-xs font-bold border ${subjectMeta.bgLight} ${subjectMeta.color} ${subjectMeta.borderColor}`}
            >
              {subjectMeta.icon} {subjectMeta.label}
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              {task.title}
            </span>
          </div>
          {task.description && (
            <p className="text-xs text-slate-600 dark:text-slate-300 mb-2">
              {task.description}
            </p>
          )}

          {/* Student submission preview */}
          {submission ? (
            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex flex-col gap-2">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                学生提交成果（{submission.timeSpentMinutes ? `耗时约 ${submission.timeSpentMinutes} 分钟` : '已提交'}）：
              </div>

              {/* Photo preview */}
              {submission.photoUrl && (
                <div>
                  <img
                    src={submission.photoUrl}
                    alt="作业照片"
                    className="max-h-56 w-full object-contain rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-950"
                  />
                  <div className="text-[11px] text-slate-400 mt-1 text-center">
                    提示：可右键或点击图片在新标签页查看高清原图
                  </div>
                </div>
              )}

              {/* Audio recording player */}
              {submission.audioUrl && (
                <button
                  type="button"
                  onClick={handlePlayAudio}
                  className="py-2.5 px-4 bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-purple-200 transition-colors"
                >
                  <Play className={`w-4 h-4 ${isPlayingAudio ? 'animate-spin' : ''}`} />
                  <span>{isPlayingAudio ? '正在播放朗读录音...' : '点击聆听学生朗读/背诵录音'}</span>
                </button>
              )}

              {/* Reflection note */}
              {submission.notes && (
                <div className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="font-bold text-slate-900 dark:text-white">学生留言：</span>
                  <span> “{submission.notes}”</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-xl">
              ⚠️ 学生尚未上传作业附件，建议先让学生拍照或录音后再次审核。
            </div>
          )}
        </div>

        {/* Review Action Form (if not showing reject form) */}
        {!showRejectBox ? (
          <div className="space-y-4">
            
            {/* Star Rating Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>判定评星（奖励金星给孩子）：</span>
                <span className="text-amber-500 font-bold tabular-nums">
                  +{stars} 颗金星 ⭐
                </span>
              </label>

              <div className="flex items-center gap-2">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStars(num)}
                    className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all ${
                      stars >= num
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    <Star
                      className={`w-4 h-4 ${
                        stars >= num ? 'fill-amber-400 text-amber-500' : 'text-slate-300'
                      }`}
                    />
                    <span>{num === 3 ? '极佳(3星)' : num === 2 ? '良好(2星)' : '合格(1星)'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Badges Selector */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                选择鼓励勋章印章：
              </label>
              <div className="flex flex-wrap gap-1.5">
                {REWARD_BADGES.map((b) => {
                  const isSelected = selectedBadges.includes(b.label);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBadge(b.label)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{b.icon}</span>
                      <span>{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Praise Phrases */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                快捷鼓励语：
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <button
                  type="button"
                  onClick={() => handleQuickPraise('字迹特别工整，答题非常认真！')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  ✍️ 字迹特别工整
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPraise('独立思考解题，非常有耐心，太棒啦！')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  💡 独立思考有耐心
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickPraise('朗读声音洪亮清晰，感情充沛，继续保持！')}
                  className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  🗣️ 朗读声音洪亮
                </button>
              </div>

              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="给孩子的评语或鼓励..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            {/* Reviewer signature */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">审核人署名：</span>
              <input
                type="text"
                value={reviewerName}
                onChange={(e) => setReviewerName(e.target.value)}
                className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
              />
            </div>

          </div>
        ) : (
          /* Reject for revision box */
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 rounded-2xl space-y-3">
            <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-xs">
              <AlertCircle className="w-4 h-4" />
              <span>退回订正要求说明：</span>
            </div>
            <textarea
              rows={3}
              value={rejectFeedback}
              onChange={(e) => setRejectFeedback(e.target.value)}
              placeholder="请明确告诉孩子哪道题需要订正，或字迹需重新写..."
              className="w-full p-3 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-900 text-xs font-medium outline-none"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRejectBox(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400"
              >
                返回审核
              </button>
              <button
                type="button"
                onClick={handleRejectConfirm}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold"
              >
                确认退回订正
              </button>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {!showRejectBox && (
            <button
              type="button"
              onClick={() => setShowRejectBox(true)}
              className="px-3 py-2 text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>需要订正(退回)</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              关闭
            </button>

            {!showRejectBox && (
              <button
                type="button"
                onClick={handleApproveConfirm}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>判定完成 · 盖章发星 ⭐</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
