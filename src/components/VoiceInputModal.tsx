import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  X,
  Check,
  Volume2,
  Calendar,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  SpeechRecognitionService,
  isSpeechRecognitionSupported,
  parseSpokenHomework,
  speakText,
} from '../services/speech';
import { HomeworkTask, SubjectType, SUBJECT_METAS } from '../types/homework';

interface VoiceInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<HomeworkTask, 'id' | 'createdAt' | 'status'>) => void;
}

export const VoiceInputModal: React.FC<VoiceInputModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [subject, setSubject] = useState<SubjectType>('chinese');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(20);
  const [micSupported, setMicSupported] = useState(true);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionService | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMicSupported(isSpeechRecognitionSupported());
      setTranscript('');
      setTitle('');
      setDescription('');
      setPermissionError(null);
      recognitionRef.current = new SpeechRecognitionService();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }
  }, [isOpen]);

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      setPermissionError(null);
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognitionService();
      }
      const started = recognitionRef.current.start(
        (text, isFinal) => {
          setTranscript(text);
          const parsed = parseSpokenHomework(text);
          if (parsed.extractedTitle) {
            setTitle(parsed.extractedTitle);
          }
          if (parsed.detectedSubject && parsed.detectedSubject !== 'other') {
            setSubject(parsed.detectedSubject);
          }
          if (parsed.extractedDue) {
            setDueDate(parsed.extractedDue);
          }
          if (parsed.estimatedMinutes) {
            setEstimatedMinutes(parsed.estimatedMinutes);
          }
        },
        (err) => {
          console.warn('Speech error:', err);
          setIsListening(false);
          if (err === 'not-allowed') {
            setPermissionError('麦克风权限未开启，请允许浏览器使用麦克风，或在下方直接文字输入。');
          } else {
            setPermissionError('语音识别异常，您可以直接点击下方快速标签或打字输入。');
          }
        }
      );

      if (started) {
        setIsListening(true);
      } else {
        setPermissionError('当前浏览器暂未开启语音识别，您可直接打字或使用快捷短语。');
      }
    }
  };

  const handleQuickExample = (phrase: string, defaultSubject: SubjectType) => {
    setTranscript(phrase);
    setSubject(defaultSubject);
    const parsed = parseSpokenHomework(phrase);
    setTitle(parsed.extractedTitle || phrase);
    if (parsed.estimatedMinutes) {
      setEstimatedMinutes(parsed.estimatedMinutes);
    }
  };

  const handleConfirm = () => {
    if (!title.trim()) {
      alert('请说出或输入作业内容');
      return;
    }

    onSaveTask({
      title: title.trim(),
      subject,
      description: description.trim() || (transcript ? `语音记录：“${transcript}”` : undefined),
      dueDate,
      dueTime: '20:00',
      estimatedMinutes,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              🎙️
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                语音说作业 · 智能记录
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                按住说话，智能识别学科、内容与截止时间
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

        {/* Center: Large Mic Button */}
        <div className="py-8 flex flex-col items-center justify-center text-center">
          <button
            onClick={toggleListening}
            className={`relative w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-xl ${
              isListening
                ? 'bg-rose-500 text-white scale-105 shadow-rose-500/40 animate-pulse'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
            }`}
          >
            {/* Ripple rings while listening */}
            {isListening && (
              <span className="absolute inset-0 rounded-full border-4 border-rose-300 animate-ping opacity-75 pointer-events-none" />
            )}
            {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            <span className="text-xs font-bold mt-1">
              {isListening ? '点击停止' : '点击说话'}
            </span>
          </button>

          <p className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-300">
            {isListening ? (
              <span className="text-rose-600 dark:text-rose-400 flex items-center justify-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                正在聆听... 请说出作业（例如：“今天数学口算写第15页”）
              </span>
            ) : (
              '点击大话筒，直接说出老师布置的作业'
            )}
          </p>

          {permissionError && (
            <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{permissionError}</span>
            </div>
          )}
        </div>

        {/* Live speech feedback & quick tags */}
        <div className="space-y-4">
          
          {/* Spoken result text box */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>识别到的作业内容：</span>
              {transcript && (
                <button
                  onClick={() => speakText(title || transcript)}
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>朗读试听</span>
                </button>
              )}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="说出或输入作业，如：背诵古诗《望庐山瀑布》"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none"
            />
          </div>

          {/* Subject selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              作业学科（智能匹配或手动切换）：
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
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
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

          {/* Quick Spoken Examples for Low-Age Students */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1.5 block">
              💡 试试点击常用作业例句快速录入：
            </label>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickExample('语文背诵课文第3课生字词', 'chinese')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-700 transition-colors"
              >
                📖 语文背诵生字
              </button>
              <button
                type="button"
                onClick={() => handleQuickExample('数学口算天天练第15页', 'math')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-700 transition-colors"
              >
                📐 数学口算15页
              </button>
              <button
                type="button"
                onClick={() => handleQuickExample('英语Unit 2 单词跟读两遍', 'english')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-700 transition-colors"
              >
                🔤 英语单词跟读
              </button>
              <button
                type="button"
                onClick={() => handleQuickExample('跳绳打卡300个', 'sports')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-700 transition-colors"
              >
                ⚽ 跳绳300个
              </button>
              <button
                type="button"
                onClick={() => handleQuickExample('自主课外书阅读20分钟', 'reading')}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 text-slate-700 transition-colors"
              >
                📚 课外阅读20分钟
              </button>
            </div>
          </div>

          {/* Details: Date & Time */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>截止日期</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>预估时间 (分钟)</span>
              </label>
              <input
                type="number"
                min="5"
                max="120"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(parseInt(e.target.value, 10) || 20)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            取消
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>确认记录作业</span>
          </button>
        </div>

      </div>
    </div>
  );
};
