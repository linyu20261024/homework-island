import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Check,
  Sparkles,
  RotateCw,
  Trash2,
  Calendar,
  Clock,
  Loader2,
} from 'lucide-react';
import { HomeworkTask, SubjectType, SUBJECT_METAS } from '../types/homework';
import { extractHomeworkFromImage } from '../services/gemini';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Omit<HomeworkTask, 'id' | 'createdAt' | 'status'>) => void;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
}) => {
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState<SubjectType>('math');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(20);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractTip, setExtractTip] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const result = reader.result as string;
      setPhotoDataUrl(result);
      // Auto attempt smart extraction if title is empty
      if (!title) {
        attemptAIExtraction(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const attemptAIExtraction = async (imageSrc: string) => {
    setIsExtracting(true);
    setExtractTip('正在分析黑板或试卷照片...');
    try {
      const extracted = await extractHomeworkFromImage(imageSrc);
      if (extracted) {
        if (extracted.title) setTitle(extracted.title);
        if (extracted.subject) setSubject(extracted.subject);
        if (extracted.description) setDescription(extracted.description);
        if (extracted.estimatedMinutes) setEstimatedMinutes(extracted.estimatedMinutes);
        setExtractTip('✨ 已自动提取照片中的作业要求！');
      } else {
        // Fallback friendly hint
        setExtractTip('照片已上传。请选择学科并简述作业内容～');
      }
    } catch {
      setExtractTip('照片已保存，您可以直接选择学科并确认。');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirm = () => {
    if (!photoDataUrl && !title.trim()) {
      alert('请拍摄照片或输入作业内容');
      return;
    }

    const finalTitle = title.trim() || `${SUBJECT_METAS[subject].label}拍照作业`;

    onSaveTask({
      title: finalTitle,
      subject,
      description: description.trim() || '请参照拍摄的黑板/作业单照片按时完成。',
      photoPromptUrl: photoDataUrl || undefined,
      dueDate,
      dueTime: '20:00',
      estimatedMinutes,
    });

    // Reset
    setPhotoDataUrl(null);
    setTitle('');
    setDescription('');
    setExtractTip(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              📷
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                拍照记录作业
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                拍摄黑板作业通知、课本页码或练习册题目
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

        {/* Photo Box */}
        <div className="my-5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {!photoDataUrl ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/50 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow-xs">
                <Camera className="w-7 h-7" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                点击拍照或从相册选取
              </span>
              <span className="text-xs text-slate-400">
                支持拍摄黑板笔记、作业单、练习册
              </span>
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-60 bg-slate-950 flex items-center justify-center">
              <img
                src={photoDataUrl}
                alt="作业要求照片"
                className="max-h-60 w-auto object-contain"
              />
              <button
                onClick={() => setPhotoDataUrl(null)}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-white hover:bg-black/80 transition-colors"
                title="重新拍摄"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-2 right-2 px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-medium hover:bg-black/80 transition-colors flex items-center gap-1.5"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>换一张</span>
              </button>
            </div>
          )}

          {/* AI extraction status */}
          {isExtracting && (
            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl text-xs flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>{extractTip}</span>
            </div>
          )}
          {extractTip && !isExtracting && (
            <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{extractTip}</span>
            </div>
          )}
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              作业标题与页码：
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：数学课本第42页练习1-4题"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
              所属学科：
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

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              补充说明（可选）：
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="如有老师特别要求（如：字迹工整、需家长签字）"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
                <span>预计用时 (分钟)</span>
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

        {/* Footer */}
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
            <span>保存拍照作业</span>
          </button>
        </div>

      </div>
    </div>
  );
};
