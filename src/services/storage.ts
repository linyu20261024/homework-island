import { HomeworkTask, StudentProfile, ChildProfile, FamilyProfile } from '../types/homework';

const DB_NAME = 'homework_island_db';
const DB_VERSION = 1;
const STORE_TASKS = 'tasks';
const STORE_SETTINGS = 'settings';

export const DEFAULT_FAMILY_PROFILE: FamilyProfile = {
  activeChildId: 'child-1',
  parentPin: '1234',
  children: [
    {
      id: 'child-1',
      name: '天天',
      grade: '小学二年级',
      avatar: '👦',
      totalStars: 18,
      streakDays: 5,
    },
    {
      id: 'child-2',
      name: '瑶瑶',
      grade: '小学一年级',
      avatar: '👧',
      totalStars: 12,
      streakDays: 3,
    },
  ],
};

const DEFAULT_PROFILE: StudentProfile = {
  studentName: '天天',
  grade: '小学二年级',
  totalStars: 18,
  streakDays: 5,
  parentPin: '1234',
};

const INITIAL_TASKS: HomeworkTask[] = [
  {
    id: 'demo-task-1',
    childId: 'child-1',
    title: '背诵《静夜思》并录音打卡',
    subject: 'chinese',
    description: '读准字音，声音洪亮，背诵并录制音频提交给家长检查。',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '20:00',
    estimatedMinutes: 15,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: 'pending',
  },
  {
    id: 'demo-task-2',
    childId: 'child-1',
    title: '数学口算小练习第18页',
    subject: 'math',
    description: '独立完成20道两位数加减法，写完后拍照上传作业本。',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '19:30',
    estimatedMinutes: 20,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    status: 'submitted',
    submission: {
      id: 'sub-demo-2',
      submittedAt: new Date(Date.now() - 1800000).toISOString(),
      notes: '做完啦！我觉得今天算得特别快，自己还检查了一遍。',
      timeSpentMinutes: 18,
    },
  },
  {
    id: 'demo-task-3',
    childId: 'child-1',
    title: '英语字母与小绘本跟读',
    subject: 'english',
    description: 'Unit 3 绘本跟读两遍，录下朗读或者拍下跟读打卡单。',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '21:00',
    estimatedMinutes: 15,
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    status: 'approved',
    submission: {
      id: 'sub-demo-3',
      submittedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      notes: '流利读完，发音很有进步！',
      timeSpentMinutes: 15,
    },
    review: {
      reviewedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      reviewerName: '妈妈',
      starsAwarded: 3,
      badgesAwarded: ['流利朗读', '自主自觉'],
      comment: '发音非常标准，语调轻快，继续保持！',
      isApproved: true,
    },
  },
  {
    id: 'demo-task-4',
    childId: 'child-2',
    title: '拼音声母认读与手指描红',
    subject: 'chinese',
    description: '认读 b p m f，完成描红练习第3页，拍作业本照片打卡。',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '19:00',
    estimatedMinutes: 15,
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    status: 'pending',
  },
  {
    id: 'demo-task-5',
    childId: 'child-2',
    title: '数字 1-10 连线图与涂色',
    subject: 'math',
    description: '画出小恐龙连线图并涂上喜欢的颜色。',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '20:00',
    estimatedMinutes: 20,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    status: 'pending',
  },
];

// Open IndexedDB connection
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_TASKS)) {
        db.createObjectStore(STORE_TASKS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        db.createObjectStore(STORE_SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const StorageService = {
  async getTasks(): Promise<HomeworkTask[]> {
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(STORE_TASKS, 'readonly');
        const store = tx.objectStore(STORE_TASKS);
        const req = store.getAll();
        req.onsuccess = () => {
          const list = req.result as HomeworkTask[];
          if (!list || list.length === 0) {
            // Seed initial sample tasks
            this.seedInitialTasks().then(resolve);
          } else {
            // Sort by status: pending first, then submitted, then approved
            list.sort((a, b) => {
              const priority: Record<string, number> = {
                pending: 1,
                revision: 2,
                submitted: 3,
                approved: 4,
              };
              return (priority[a.status] || 5) - (priority[b.status] || 5);
            });
            resolve(list);
          }
        };
        req.onerror = () => {
          resolve(this.getTasksFromLocalStorage());
        };
      });
    } catch {
      return this.getTasksFromLocalStorage();
    }
  },

  async seedInitialTasks(): Promise<HomeworkTask[]> {
    for (const task of INITIAL_TASKS) {
      await this.saveTask(task);
    }
    return INITIAL_TASKS;
  },

  async saveTask(task: HomeworkTask): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_TASKS, 'readwrite');
        const store = tx.objectStore(STORE_TASKS);
        const req = store.put(task);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const current = this.getTasksFromLocalStorage();
      const idx = current.findIndex((t) => t.id === task.id);
      if (idx >= 0) {
        current[idx] = task;
      } else {
        current.unshift(task);
      }
      localStorage.setItem('hw_tasks_backup', JSON.stringify(current));
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_TASKS, 'readwrite');
        const store = tx.objectStore(STORE_TASKS);
        const req = store.delete(taskId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      const current = this.getTasksFromLocalStorage().filter((t) => t.id !== taskId);
      localStorage.setItem('hw_tasks_backup', JSON.stringify(current));
    }
  },

  async getFamilyProfile(): Promise<FamilyProfile> {
    const raw = localStorage.getItem('hw_family_profile');
    if (raw) {
      try {
        return { ...DEFAULT_FAMILY_PROFILE, ...JSON.parse(raw) };
      } catch {
        return DEFAULT_FAMILY_PROFILE;
      }
    }
    // Check legacy single-child profile
    const legacy = localStorage.getItem('hw_student_profile');
    if (legacy) {
      try {
        const parsed = JSON.parse(legacy);
        return {
          activeChildId: 'child-1',
          parentPin: parsed.parentPin || '1234',
          children: [
            {
              id: 'child-1',
              name: parsed.studentName || '天天',
              grade: parsed.grade || '小学二年级',
              avatar: '👦',
              totalStars: parsed.totalStars || 18,
              streakDays: parsed.streakDays || 5,
            },
            {
              id: 'child-2',
              name: '瑶瑶',
              grade: '小学一年级',
              avatar: '👧',
              totalStars: 12,
              streakDays: 3,
            },
          ],
        };
      } catch {
        return DEFAULT_FAMILY_PROFILE;
      }
    }
    return DEFAULT_FAMILY_PROFILE;
  },

  async saveFamilyProfile(profile: FamilyProfile): Promise<void> {
    localStorage.setItem('hw_family_profile', JSON.stringify(profile));
  },

  async getProfile(): Promise<StudentProfile> {
    const family = await this.getFamilyProfile();
    const active = family.children.find((c) => c.id === family.activeChildId) || family.children[0];
    return {
      studentName: active?.name || '天天',
      grade: active?.grade || '小学二年级',
      totalStars: active?.totalStars || 18,
      streakDays: active?.streakDays || 5,
      parentPin: family.parentPin || '1234',
    };
  },

  async saveProfile(profile: StudentProfile): Promise<void> {
    const family = await this.getFamilyProfile();
    const activeIdx = family.children.findIndex((c) => c.id === family.activeChildId);
    if (activeIdx >= 0) {
      family.children[activeIdx].name = profile.studentName;
      family.children[activeIdx].grade = profile.grade;
      family.children[activeIdx].totalStars = profile.totalStars;
      family.children[activeIdx].streakDays = profile.streakDays;
    }
    family.parentPin = profile.parentPin;
    await this.saveFamilyProfile(family);
  },

  async awardStars(count: number, childId?: string): Promise<number> {
    const family = await this.getFamilyProfile();
    const targetId = childId || family.activeChildId;
    const child = family.children.find((c) => c.id === targetId) || family.children[0];
    if (child) {
      child.totalStars += count;
      await this.saveFamilyProfile(family);
      return child.totalStars;
    }
    return 0;
  },

  getTasksFromLocalStorage(): HomeworkTask[] {
    const raw = localStorage.getItem('hw_tasks_backup');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return INITIAL_TASKS;
      }
    }
    return INITIAL_TASKS;
  },

  // Export all data as JSON
  async exportData(): Promise<string> {
    const tasks = await this.getTasks();
    const family = await this.getFamilyProfile();
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      family,
      tasks,
    }, null, 2);
  },

  // Import data from JSON
  async importData(jsonString: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.family) {
        await this.saveFamilyProfile(parsed.family);
      } else if (parsed.profile) {
        await this.saveProfile(parsed.profile);
      }
      if (Array.isArray(parsed.tasks)) {
        for (const t of parsed.tasks) {
          if (t.id && t.title) {
            await this.saveTask(t);
          }
        }
      }
      return true;
    } catch {
      return false;
    }
  },

  // Reset to initial demo
  async resetDemo(): Promise<void> {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_TASKS, 'readwrite');
      const store = tx.objectStore(STORE_TASKS);
      store.clear();
      await this.seedInitialTasks();
      await this.saveFamilyProfile(DEFAULT_FAMILY_PROFILE);
    } catch {
      localStorage.removeItem('hw_tasks_backup');
      localStorage.removeItem('hw_family_profile');
      localStorage.removeItem('hw_student_profile');
    }
  },
};
