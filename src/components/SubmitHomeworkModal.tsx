import React, { useState, useRef } from 'react';
import {
  Camera,
  Mic,
  MicOff,
  Upload,
  X,
  Check,
  Play,
  RotateCcw,
  Sparkles,
  Clock,
  Trash2,
  FileCheck2,
} from 'lucide-react';
import { HomeworkTask, HomeworkSubmission, SUBJECT_METAS } from '../types/homework';
import { AudioRecorder } from '../services/speech';

interface SubmitHomeworkModalProps {
  task: HomeworkTask | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskId: string, submission: HomeworkSubmission) => void;
}

export const SubmitHomeworkModal: React.FC<SubmitHomeworkModalProps> = ({
  task,
  isOpen,
  onClose,
  onSubmit,
}) => {
  if (!isOpen || !task) return null;

  const [photoUrl, setPhotoUrl] = useState<string | null>(task.submission?.photoUrl || null);
  const [audioUrl, setAudioUrl] = useState<string | null>(task.submission?.audioUrl || null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [notes, setNotes] = useState(task.submission?.notes || '');
  const [timeSpent, setTimeSpent] = useState<number>(
    task.submission?.timeSpentMinutes || task.estimatedMinutes || 20
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerIntervalRef = useRef<any>(null);

  const subjectMeta = SUBJECT_METAS[task.subject] || SUBJECT_METAS.other;

  // Handle Photo selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle Audio recording
  const startRecording = async () => {
    const recorder = new AudioRecorder();
    const ok = await recorder.start();
    if (ok) {
      recorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      alert('无法开启麦克风录音，请检查设备权限。');
    }
  };

  const stopRecording = async () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setIsRecording(false);
    if (recorderRef.current) {
      try {
        const result = await recorderRef.current.stop();
        setAudioUrl(result.dataUrl);
      } catch (err) {
        console.error('Audio recording stop error:', err);
      }
    }
  };

  const playRecordedAudio = () => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    setIsPlayingAudio(true);
    audio.onended = () => setIsPlayingAudio(false);
    audio.onerror = () => setIsPlayingAudio(false);
    audio.play();
  };

  // Submit confirmation
  const handleSubmit = () => {
    if (!photoUrl && !audioUrl && !notes.trim()) {
      alert('请至少上传作业照片、朗读录音，或填写完成说明后再提交哦！');
      return;
    }

    const submission: HomeworkSubmission = {
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      photoUrl: photoUrl || undefined,
      audioUrl: audioUrl || undefined,
      audioDurationSeconds: recordingSeconds || undefined,
      notes: notes.trim() || undefined,
      timeSpentMinutes: timeSpent,
    };

    onSubmit(task.id, submission);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              📸
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                提交作业打卡
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                提交后将进入“待检查”状态，家长审核即可盖章奖励金星
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

        {/* Task Summary Banner */}
        <div className="my-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {task.description}
            </p>
          )}
        </div>

        {/* 1. Photo Submission Option */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-500" />
              <span>方式一：拍照上传作业本（推荐）</span>
            </span>
            {photoUrl && (
              <span className="text-[11px] text-emerald-600 font-semibold">✓ 已选照片</span>
            )}
          </label>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {!photoUrl ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-all"
            >
              <Camera className="w-5 h-5 text-blue-500" />
              <span>拍下作业本或练习册</span>
            </button>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 max-h-48 flex items-center justify-center">
              <img
                src={photoUrl}
                alt="提交的作业照片"
                className="max-h-48 w-auto object-contain"
              />
              <button
                type="button"
                onClick={() => setPhotoUrl(null)}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1 bg-black/60 hover:bg-black/80 text-white text-xs rounded-lg flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>重拍</span>
              </button>
            </div>
          )}
        </div>

        {/* 2. Audio Recording Submission Option */}
        <div className="mb-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-purple-500" />
              <span>方式二：录制背诵 / 朗读打卡</span>
            </span>
            {audioUrl && (
              <span className="text-[11px] text-emerald-600 font-semibold">✓ 已录制音频</span>
            )}
          </label>

          {!audioUrl ? (
            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="flex-1 py-3 px-4 bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Mic className="w-4 h-4" />
                  <span>开始录音打卡</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="flex-1 py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 animate-pulse shadow-md shadow-rose-500/20"
                >
                  <MicOff className="w-4 h-4" />
                  <span>录音中 ({recordingSeconds}s) · 点击完成录制</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={playRecordedAudio}
                  className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center hover:bg-purple-700 transition-colors"
                >
                  <Play className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-spin' : ''}`} />
                </button>
                <div className="text-xs">
                  <div className="font-bold text-purple-950 dark:text-purple-200">
                    {isPlayingAudio ? '正在播放朗读录音...' : '点击试听我的朗读'}
                  </div>
                  <div className="text-[10px] text-purple-700/70 dark:text-purple-300/70">
                    录音时长约 {recordingSeconds > 0 ? `${recordingSeconds} 秒` : '已就绪'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setAudioUrl(null);
                  setRecordingSeconds(0);
                }}
                className="text-xs text-rose-600 hover:underline p-1"
              >
                重录
              </button>
            </div>
          )}
        </div>

        {/* 3. Time Spent & Reflection Notes */}
        <div className="space-y-3 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>实际花费时间 (分钟)</span>
              </label>
              <input
                type="number"
                min="1"
                max="180"
                value={timeSpent}
                onChange={(e) => setTimeSpent(parseInt(e.target.value, 10) || 15)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>快捷完成心得</span>
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setNotes(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200"
              >
                <option value="">快捷选择...</option>
                <option value="今天独立完成，没有看答案！">独立完成，没看答案</option>
                <option value="字迹写得特别工整，自己检查了一遍。">字迹特别工整</option>
                <option value="今天朗读很流利，发音特别清晰！">朗读很流利清晰</option>
                <option value="有两道难题思考了很久，最终解出来了！">难题自己思考解出</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              学生自评 / 留言心得：
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="想对爸爸妈妈说的话，或者今天的心得..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            * 提交后任务变为“待检查”，家长盖章即完成
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              取消
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>确认提交作业</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
