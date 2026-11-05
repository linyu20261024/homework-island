/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Mic,
  Camera,
  Star,
  CheckCircle2,
  Clock,
  Sparkles,
  Settings,
  Filter,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Calendar,
  Layers,
  Info,
  Users,
} from 'lucide-react';
import { Header } from './components/Header';
import { StudentStats } from './components/StudentStats';
import { TaskCard } from './components/TaskCard';
import { VoiceInputModal } from './components/VoiceInputModal';
import { PhotoCaptureModal } from './components/PhotoCaptureModal';
import { CreateTaskModal } from './components/CreateTaskModal';
import { SubmitHomeworkModal } from './components/SubmitHomeworkModal';
import { ReviewModal } from './components/ReviewModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { PrintSummaryModal } from './components/PrintSummaryModal';
import { SettingsModal } from './components/SettingsModal';
import { ParentPinModal } from './components/ParentPinModal';

import {
  HomeworkTask,
  StudentProfile,
  ChildProfile,
  FamilyProfile,
  SubjectType,
  SUBJECT_METAS,
  HomeworkSubmission,
  HomeworkReview,
} from './types/homework';
import { StorageService, DEFAULT_FAMILY_PROFILE } from './services/storage';

export default function App() {
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [family, setFamily] = useState<FamilyProfile>(DEFAULT_FAMILY_PROFILE);
  const [loading, setLoading] = useState(true);

  // Active child derived from family profile
  const activeChild: ChildProfile =
    family.children.find((c) => c.id === family.activeChildId) || family.children[0];

  // Derived student profile for child-facing components
  const activeStudentProfile: StudentProfile = {
    studentName: activeChild?.name || '天天',
    grade: activeChild?.grade || '小学二年级',
    totalStars: activeChild?.totalStars || 0,
    streakDays: activeChild?.streakDays || 1,
    parentPin: family.parentPin || '1234',
  };

  // Filter states
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'submitted' | 'approved'>('all');
  const [selectedSubject, setSelectedSubject] = useState<SubjectType | 'all'>('all');
  const [isParentMode, setIsParentMode] = useState(false);

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // Task being submitted or reviewed
  const [selectedTaskForSubmit, setSelectedTaskForSubmit] = useState<HomeworkTask | null>(null);
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<HomeworkTask | null>(null);

  // Load initial data
  const loadData = async () => {
    try {
      const [loadedTasks, loadedFamily] = await Promise.all([
        StorageService.getTasks(),
        StorageService.getFamilyProfile(),
      ]);
      setTasks(loadedTasks);
      setFamily(loadedFamily);
    } catch (e) {
      console.error('Failed to load data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Switch active child
  const handleSwitchChild = async (childId: string) => {
    const updated: FamilyProfile = {
      ...family,
      activeChildId: childId,
    };
    setFamily(updated);
    await StorageService.saveFamilyProfile(updated);
  };

  // Update family
  const handleUpdateFamily = async (updated: FamilyProfile) => {
    setFamily(updated);
    await StorageService.saveFamilyProfile(updated);
  };

  // Handle Parent Mode Switch with PIN check
  const handleToggleParentMode = () => {
    if (!isParentMode) {
      setIsPinModalOpen(true);
    } else {
      setIsParentMode(false);
    }
  };

  // Create new task
  const handleSaveNewTask = async (
    newTaskData: Omit<HomeworkTask, 'id' | 'createdAt' | 'status'>
  ) => {
    const newTask: HomeworkTask = {
      ...newTaskData,
      childId: newTaskData.childId || family.activeChildId,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    await StorageService.saveTask(newTask);
    setTasks((prev) => [newTask, ...prev]);
  };

  // Delete task
  const handleDeleteTask = async (taskId: string) => {
    if (confirm('确定要删除这项作业吗？')) {
      await StorageService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    }
  };

  // Student submits homework
  const handleSubmitHomework = async (taskId: string, submission: HomeworkSubmission) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex < 0) return;

    const updatedTask: HomeworkTask = {
      ...tasks[taskIndex],
      status: 'submitted',
      submission,
      history: [
        ...(tasks[taskIndex].history || []),
        {
          timestamp: new Date().toISOString(),
          action: '学生提交作业成果',
          note: submission.notes,
        },
      ],
    };

    await StorageService.saveTask(updatedTask);
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks);
    setSelectedTaskForSubmit(null);
  };

  // Parent reviews and approves homework (Awards stars!)
  const handleApproveHomework = async (taskId: string, review: HomeworkReview) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex < 0) return;

    const targetTask = tasks[taskIndex];
    const targetChildId = targetTask.childId || family.activeChildId;

    const updatedTask: HomeworkTask = {
      ...targetTask,
      status: 'approved',
      review,
      history: [
        ...(targetTask.history || []),
        {
          timestamp: new Date().toISOString(),
          action: `家长审核合格，奖励 ${review.starsAwarded} 颗金星`,
          note: review.comment,
        },
      ],
    };

    await StorageService.saveTask(updatedTask);
    await StorageService.awardStars(review.starsAwarded, targetChildId);

    // Refresh family profile
    const freshFamily = await StorageService.getFamilyProfile();
    setFamily(freshFamily);

    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks);
    setSelectedTaskForReview(null);
  };

  // Parent returns homework for revision
  const handleRejectForRevision = async (taskId: string, feedbackNote: string) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex < 0) return;

    const updatedTask: HomeworkTask = {
      ...tasks[taskIndex],
      status: 'revision',
      review: {
        reviewedAt: new Date().toISOString(),
        reviewerName: '家长',
        starsAwarded: 0,
        badgesAwarded: [],
        comment: feedbackNote,
        isApproved: false,
      },
      history: [
        ...(tasks[taskIndex].history || []),
        {
          timestamp: new Date().toISOString(),
          action: '家长退回订正',
          note: feedbackNote,
        },
      ],
    };

    await StorageService.saveTask(updatedTask);
    const newTasks = [...tasks];
    newTasks[taskIndex] = updatedTask;
    setTasks(newTasks);
    setSelectedTaskForReview(null);
  };

  // Filter tasks: matching active child, and matching status & subject
  const childTasks = tasks.filter((t) => {
    // If task has childId, it must match activeChildId or 'all'.
    // If task has no childId (legacy), show it for the first child.
    if (t.childId && t.childId !== 'all' && t.childId !== family.activeChildId) {
      return false;
    }
    return true;
  });

  const filteredTasks = childTasks.filter((t) => {
    // Status filter
    if (activeFilter === 'pending' && t.status !== 'pending' && t.status !== 'revision') {
      return false;
    }
    if (activeFilter === 'submitted' && t.status !== 'submitted') {
      return false;
    }
    if (activeFilter === 'approved' && t.status !== 'approved') {
      return false;
    }

    // Subject filter
    if (selectedSubject !== 'all' && t.subject !== selectedSubject) {
      return false;
    }

    return true;
  });

  const pendingReviewCount = childTasks.filter((t) => t.status === 'submitted').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Top Bar with Child Switcher */}
      <Header
        profile={activeStudentProfile}
        family={family}
        activeChild={activeChild}
        onSwitchChild={handleSwitchChild}
        onAddChildClick={() => setIsSettingsModalOpen(true)}
        isParentMode={isParentMode}
        onToggleParentMode={handleToggleParentMode}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        pendingReviewCount={pendingReviewCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Parent Mode Active Ribbon */}
        {isParentMode && (
          <div className="mb-6 p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-purple-900 dark:text-purple-200">
                  当前处于：家长 / 老师审核模式（正在查看【{activeChild.name}】的作业）
                </h3>
                <p className="text-xs text-purple-700/80 dark:text-purple-300/80">
                  可直接查看学生提交的作业照片与背诵录音，盖章发星 ⭐ 或退回订正。顶部可随时切换其他孩子。
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsParentMode(false)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-xl hover:bg-purple-50"
            >
              返回学生做题模式
            </button>
          </div>
        )}

        {/* Student Stats & Quick Entry Hero */}
        <StudentStats
          profile={activeStudentProfile}
          tasks={childTasks}
          onOpenVoice={() => setIsVoiceModalOpen(true)}
          onOpenPhoto={() => setIsPhotoModalOpen(true)}
          onOpenFocusTimer={() => setIsFocusTimerOpen(true)}
        />

        {/* Subject Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              selectedSubject === 'all'
                ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
            }`}
          >
            全部学科 ({childTasks.length})
          </button>

          {(Object.keys(SUBJECT_METAS) as SubjectType[]).map((subKey) => {
            const meta = SUBJECT_METAS[subKey];
            const count = childTasks.filter((t) => t.subject === subKey).length;
            if (count === 0 && selectedSubject !== subKey) return null;
            const isSelected = selectedSubject === subKey;
            return (
              <button
                key={subKey}
                onClick={() => setSelectedSubject(subKey)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>{meta.icon}</span>
                <span>{meta.label}</span>
                <span className="opacity-70 tabular-nums">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Homework Task Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{activeChild.avatar} {activeChild.name} 的家庭作业清单</span>
              <span className="text-xs font-normal text-slate-400 tabular-nums">
                共 {filteredTasks.length} 项
              </span>
            </h2>

            <span className="hidden sm:inline text-xs text-slate-500 dark:text-slate-400">
              💡 核心规则：学生拍照或录音提交后，家长审核即可盖章发星
            </span>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center my-6">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 text-2xl shadow-xs">
                🎒
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                【{activeChild.name}】目前没有这项作业任务
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-5">
                点击“记作业”或“按住说作业”，为孩子记录新任务！
              </p>
              <div className="flex justify-center gap-2">
                <button
                  onClick={() => setIsVoiceModalOpen(true)}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Mic className="w-4 h-4" />
                  <span>语音说作业</span>
                </button>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>添加新作业</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  isParentMode={isParentMode}
                  onSubmitHomework={(t) => setSelectedTaskForSubmit(t)}
                  onReviewHomework={(t) => setSelectedTaskForReview(t)}
                  onDeleteTask={handleDeleteTask}
                />
              ))}
            </div>
          )}
        </div>

      </main>

      {/* Floating Bottom Quick Bar for Mobile Touch Ergonomics */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-20 flex items-center justify-between gap-2 p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl">
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="flex-1 py-2.5 px-3 bg-amber-400 text-slate-950 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform"
        >
          <Mic className="w-4 h-4" />
          <span>语音记作业</span>
        </button>

        <button
          onClick={() => setIsPhotoModalOpen(true)}
          className="flex-1 py-2.5 px-3 bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-transform"
        >
          <Camera className="w-4 h-4" />
          <span>拍照录入</span>
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-colors"
          title="系统设置"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Modals */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onSaveTask={handleSaveNewTask}
      />

      <PhotoCaptureModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onSaveTask={handleSaveNewTask}
      />

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSaveTask={handleSaveNewTask}
        onOpenVoice={() => setIsVoiceModalOpen(true)}
        onOpenPhoto={() => setIsPhotoModalOpen(true)}
        childrenList={family.children}
        activeChildId={family.activeChildId}
      />

      <SubmitHomeworkModal
        task={selectedTaskForSubmit}
        isOpen={Boolean(selectedTaskForSubmit)}
        onClose={() => setSelectedTaskForSubmit(null)}
        onSubmit={handleSubmitHomework}
      />

      <ReviewModal
        task={selectedTaskForReview}
        isOpen={Boolean(selectedTaskForReview)}
        onClose={() => setSelectedTaskForReview(null)}
        onApprove={handleApproveHomework}
        onRejectForRevision={handleRejectForRevision}
      />

      <FocusTimerModal
        isOpen={isFocusTimerOpen}
        onClose={() => setIsFocusTimerOpen(false)}
      />

      <PrintSummaryModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        tasks={childTasks}
        profile={activeStudentProfile}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        family={family}
        onUpdateFamily={handleUpdateFamily}
        onDataReset={loadData}
      />

      <ParentPinModal
        isOpen={isPinModalOpen}
        onClose={() => setIsPinModalOpen(false)}
        correctPin={family.parentPin}
        onSuccess={() => setIsParentMode(true)}
      />

    </div>
  );
}
