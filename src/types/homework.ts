export type SubjectType = 'chinese' | 'math' | 'english' | 'science' | 'art' | 'sports' | 'reading' | 'other';

export type TaskStatus = 'pending' | 'submitted' | 'approved' | 'revision';

export interface HomeworkSubmission {
  id: string;
  submittedAt: string;
  photoUrl?: string; // Data URL or base64
  audioUrl?: string; // Voice reading / recitation recording
  audioDurationSeconds?: number;
  notes?: string;
  timeSpentMinutes?: number;
}

export interface HomeworkReview {
  reviewedAt: string;
  reviewerName: string;
  starsAwarded: number; // 1 - 3
  badgesAwarded: string[]; // e.g. '书写工整', '朗读清晰', '解题神速'
  comment?: string;
  isApproved: boolean;
}

export interface ChildProfile {
  id: string;
  name: string;
  grade: string;
  avatar: string; // e.g. 👦, 👧, 🦁, 🚀, 🐼
  totalStars: number;
  streakDays: number;
}

export interface FamilyProfile {
  activeChildId: string;
  children: ChildProfile[];
  parentPin: string; // e.g. "1234" to enter parent mode
}

export interface StudentProfile {
  studentName: string;
  grade: string;
  totalStars: number;
  streakDays: number;
  parentPin: string;
}

export interface HomeworkTask {
  id: string;
  childId?: string; // 'all' or specific child id
  title: string;
  subject: SubjectType;
  description?: string;
  audioPromptUrl?: string; // Optional audio prompt from teacher/parent
  photoPromptUrl?: string; // Photo of blackboard or book assignment
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  estimatedMinutes?: number;
  createdAt: string;
  status: TaskStatus;
  submission?: HomeworkSubmission;
  review?: HomeworkReview;
  history?: Array<{
    timestamp: string;
    action: string;
    note?: string;
  }>;
}

export interface SubjectMeta {
  key: SubjectType;
  label: string;
  icon: string;
  color: string;
  bgLight: string;
  borderColor: string;
}

export const SUBJECT_METAS: Record<SubjectType, SubjectMeta> = {
  chinese: {
    key: 'chinese',
    label: '语文',
    icon: '📖',
    color: 'text-amber-700 dark:text-amber-400',
    bgLight: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800/40',
  },
  math: {
    key: 'math',
    label: '数学',
    icon: '📐',
    color: 'text-blue-700 dark:text-blue-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800/40',
  },
  english: {
    key: 'english',
    label: '英语',
    icon: '🔤',
    color: 'text-emerald-700 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/30',
    borderColor: 'border-emerald-200 dark:border-emerald-800/40',
  },
  science: {
    key: 'science',
    label: '科学',
    icon: '🔬',
    color: 'text-indigo-700 dark:text-indigo-400',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderColor: 'border-indigo-200 dark:border-indigo-800/40',
  },
  art: {
    key: 'art',
    label: '美术',
    icon: '🎨',
    color: 'text-pink-700 dark:text-pink-400',
    bgLight: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-800/40',
  },
  sports: {
    key: 'sports',
    label: '体育',
    icon: '⚽',
    color: 'text-orange-700 dark:text-orange-400',
    bgLight: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800/40',
  },
  reading: {
    key: 'reading',
    label: '阅读',
    icon: '📚',
    color: 'text-teal-700 dark:text-teal-400',
    bgLight: 'bg-teal-50 dark:bg-teal-950/30',
    borderColor: 'border-teal-200 dark:border-teal-800/40',
  },
  other: {
    key: 'other',
    label: '其他',
    icon: '📝',
    color: 'text-slate-700 dark:text-slate-300',
    bgLight: 'bg-slate-50 dark:bg-slate-800/40',
    borderColor: 'border-slate-200 dark:border-slate-700',
  },
};

export const REWARD_BADGES = [
  { id: 'neat_handwriting', label: '书写工整', icon: '✍️' },
  { id: 'deep_focus', label: '专注高效', icon: '⏱️' },
  { id: 'creative_thinker', label: '思路清晰', icon: '💡' },
  { id: 'fluent_reading', label: '流利朗读', icon: '🗣️' },
  { id: 'accurate_math', label: '计算全对', icon: '🎯' },
  { id: 'self_motivated', label: '自主自觉', icon: '🚀' },
  { id: 'perseverant', label: '坚持不懈', icon: '💪' },
];

export interface StudentProfile {
  studentName: string;
  grade: string;
  totalStars: number;
  streakDays: number;
  parentPin: string; // e.g. "8888" to enter parent mode
}
