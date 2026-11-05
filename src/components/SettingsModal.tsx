import React, { useState } from 'react';
import {
  Settings,
  X,
  Download,
  Upload,
  RefreshCw,
  Key,
  ShieldAlert,
  HelpCircle,
  Check,
  Globe,
  Sparkles,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import { StudentProfile, ChildProfile, FamilyProfile } from '../types/homework';
import { StorageService } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: FamilyProfile;
  onUpdateFamily: (family: FamilyProfile) => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  family,
  onUpdateFamily,
  onDataReset,
}) => {
  if (!isOpen) return null;

  const [children, setChildren] = useState<ChildProfile[]>(family.children);
  const [pin, setPin] = useState(family.parentPin || '1234');
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('hw_gemini_api_key') || ''
  );
  const [showDeploymentHelp, setShowDeploymentHelp] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // New child input fields
  const [newChildName, setNewChildName] = useState('');
  const [newChildGrade, setNewChildGrade] = useState('小学一年级');
  const [newChildAvatar, setNewChildAvatar] = useState('👦');
  const [isAddingChild, setIsAddingChild] = useState(false);

  const handleSaveAll = () => {
    const updated: FamilyProfile = {
      ...family,
      children,
      parentPin: pin.trim() || '1234',
    };
    onUpdateFamily(updated);

    if (apiKey.trim()) {
      localStorage.setItem('hw_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('hw_gemini_api_key');
    }

    alert('设置已保存！');
    onClose();
  };

  const handleAddChild = () => {
    if (!newChildName.trim()) {
      alert('请输入孩子昵称');
      return;
    }
    const newChild: ChildProfile = {
      id: `child-${Date.now()}`,
      name: newChildName.trim(),
      grade: newChildGrade.trim() || '小学一年级',
      avatar: newChildAvatar,
      totalStars: 0,
      streakDays: 1,
    };
    setChildren([...children, newChild]);
    setNewChildName('');
    setIsAddingChild(false);
  };

  const handleDeleteChild = (childId: string) => {
    if (children.length <= 1) {
      alert('至少需要保留一位孩子的档案哦');
      return;
    }
    if (confirm('确定要删除这位孩子的档案吗？')) {
      setChildren(children.filter((c) => c.id !== childId));
    }
  };

  const handleExport = async () => {
    const json = await StorageService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `星星作业岛备份_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('数据已导出为本地备份文件！');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const ok = await StorageService.importData(reader.result as string);
      if (ok) {
        alert('数据导入恢复成功！');
        window.location.reload();
      } else {
        alert('文件格式错误，导入失败。');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    if (confirm('确定要恢复示例作业数据吗？当前作业记录将被重置。')) {
      await StorageService.resetDemo();
      onDataReset();
      alert('已重置为初始示例数据。');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                家庭档案与系统设置
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                管理多个孩子的作业本、家长 PIN 码与本地数据备份
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-Child Profile Management */}
        <div className="my-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-500" />
              <span>家庭宝贝档案 ({children.length} 位孩子)</span>
            </h3>

            <button
              type="button"
              onClick={() => setIsAddingChild(true)}
              className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>添加孩子</span>
            </button>
          </div>

          {/* Child Card List */}
          <div className="space-y-2">
            {children.map((child, idx) => (
              <div
                key={child.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{child.avatar}</span>
                  <div>
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => {
                        const newChildren = [...children];
                        newChildren[idx].name = e.target.value;
                        setChildren(newChildren);
                      }}
                      className="text-xs font-bold bg-transparent text-slate-900 dark:text-white border-b border-dashed border-slate-300 dark:border-slate-600 focus:outline-none w-20"
                    />
                    <input
                      type="text"
                      value={child.grade}
                      onChange={(e) => {
                        const newChildren = [...children];
                        newChildren[idx].grade = e.target.value;
                        setChildren(newChildren);
                      }}
                      className="text-[11px] text-slate-500 block bg-transparent border-b border-dashed border-slate-200 dark:border-slate-700 focus:outline-none w-24"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-500 tabular-nums">
                    ⭐ {child.totalStars}
                  </span>
                  {children.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteChild(child.id)}
                      className="p-1 text-slate-400 hover:text-rose-500"
                      title="删除此孩子档案"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Add child form */}
          {isAddingChild && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 space-y-2.5 animate-fade-in">
              <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                新增孩子档案：
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="孩子昵称"
                  value={newChildName}
                  onChange={(e) => setNewChildName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white dark:bg-slate-900"
                />
                <input
                  type="text"
                  placeholder="年级(如三年级)"
                  value={newChildGrade}
                  onChange={(e) => setNewChildGrade(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white dark:bg-slate-900"
                />
                <select
                  value={newChildAvatar}
                  onChange={(e) => setNewChildAvatar(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs bg-white dark:bg-slate-900"
                >
                  <option value="👦">👦 男孩</option>
                  <option value="👧">👧 女孩</option>
                  <option value="👶">👶 宝贝</option>
                  <option value="🦁">🦁 狮子</option>
                  <option value="🐼">🐼 熊猫</option>
                  <option value="🚀">🚀 火箭</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingChild(false)}
                  className="px-3 py-1 text-xs text-slate-500"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold"
                >
                  确定添加
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Security and API Key */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800 mb-5">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
              家长审核 PIN 码（默认 1234，防止低龄小孩误点审核）：
            </label>
            <input
              type="text"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span>可选：Gemini AI API Key（拍照黑板 OCR 提取）</span>
              <span className="text-[10px] text-slate-400">非必填</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AI Studio API 密钥（可留空，系统依然支持本地全功能）"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono"
            />
          </div>
        </div>

        {/* Data Backup & Restore */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3 mb-5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            数据备份与迁移
          </h3>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出多孩子备份 (JSON)</span>
            </button>

            <label className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors text-center">
              <Upload className="w-3.5 h-3.5" />
              <span>导入恢复备份</span>
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>

          {exportNotice && (
            <div className="text-xs text-emerald-600 font-medium">{exportNotice}</div>
          )}

          <div className="pt-2">
            <button
              onClick={handleReset}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>重置为双宝贝示例演示数据</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
          >
            取消
          </button>

          <button
            onClick={handleSaveAll}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>保存家庭档案设置</span>
          </button>
        </div>

      </div>
    </div>
  );
};
