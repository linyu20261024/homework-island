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
} from 'lucide-react';
import { StudentProfile } from '../types/homework';
import { StorageService } from '../services/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onDataReset,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(profile.studentName);
  const [grade, setGrade] = useState(profile.grade);
  const [pin, setPin] = useState(profile.parentPin || '1234');
  const [apiKey, setApiKey] = useState(
    localStorage.getItem('hw_gemini_api_key') || ''
  );
  const [showDeploymentHelp, setShowDeploymentHelp] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const handleSaveProfile = () => {
    const updated = {
      ...profile,
      studentName: name.trim() || '天天',
      grade: grade.trim() || '小学二年级',
      parentPin: pin.trim() || '1234',
    };
    onUpdateProfile(updated);

    if (apiKey.trim()) {
      localStorage.setItem('hw_gemini_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('hw_gemini_api_key');
    }

    alert('设置已保存！');
    onClose();
  };

  const handleExport = async () => {
    const json = await StorageService.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `作业打卡备份_${profile.studentName}_${new Date().toISOString().split('T')[0]}.json`;
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
                系统设置与部署说明
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                学生资料、静态部署特点与本地数据备份
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

        {/* Deployment FAQ Accordion */}
        <div className="my-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/50">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setShowDeploymentHelp(!showDeploymentHelp)}
          >
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>问：部署要简单，静态页面可以么？</span>
            </div>
            <span className="text-xs text-blue-600 font-semibold underline">
              {showDeploymentHelp ? '收起解答' : '查看官方解答'}
            </span>
          </div>

          {showDeploymentHelp && (
            <div className="mt-3 pt-3 border-t border-blue-200/80 dark:border-blue-800/60 text-xs text-blue-950 dark:text-blue-100 space-y-2 leading-relaxed">
              <p>
                <strong>✅ 完全可以，而且非常推荐！</strong>
              </p>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                <li>
                  <strong>零服务器成本与免运维</strong>：纯静态页面只需 <code>npm run build</code>，生成的 <code>dist</code> 静态资源可免费直接扔到 GitHub Pages、Cloudflare Pages、Vercel 或局域网 NAS。
                </li>
                <li>
                  <strong>隐私安全与本地持久化</strong>：使用浏览器内置 <code>IndexedDB</code> 存储作业照片、录音与金星数据，不会上传任何外部私有服务器，不泄露孩子隐私。
                </li>
                <li>
                  <strong>原生纯前端语音识别</strong>：采用现代浏览器的 Web Speech API，零延迟、免调用费用，支持低龄孩子口头说出作业。
                </li>
                <li>
                  <strong>支持数据随时备份</strong>：一键导出 JSON 备份文件，换手机或换电脑一键恢复。
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Profile Settings */}
        <div className="space-y-4 mb-5">
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            学生与家长资料
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                学生昵称
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                年级阶段
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
              />
            </div>
          </div>

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
              <span>导出备份 (JSON)</span>
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
              <span>重置为示例作业演示数据</span>
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
            onClick={handleSaveProfile}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>保存设置</span>
          </button>
        </div>

      </div>
    </div>
  );
};
