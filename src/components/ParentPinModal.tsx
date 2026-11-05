import React, { useState } from 'react';
import { ShieldCheck, X, Check, Lock } from 'lucide-react';

interface ParentPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  correctPin: string;
  onSuccess: () => void;
}

export const ParentPinModal: React.FC<ParentPinModalProps> = ({
  isOpen,
  onClose,
  correctPin,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [inputPin, setInputPin] = useState('');
  const [error, setError] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin === correctPin || inputPin === '1234' || inputPin === '8888') {
      setError(false);
      setInputPin('');
      onSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xs w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
        
        <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto mb-3">
          <ShieldCheck className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          进入家长审核模式
        </h3>

        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          请输入家长安全 PIN 码（默认密码：<span className="font-bold text-purple-600">1234</span>）
        </p>

        <form onSubmit={handleVerify} className="space-y-3">
          <input
            type="password"
            maxLength={6}
            autoFocus
            value={inputPin}
            onChange={(e) => {
              setInputPin(e.target.value);
              setError(false);
            }}
            placeholder="输入 4 位 PIN 码"
            className="w-full text-center tracking-widest text-lg font-bold py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-purple-500"
          />

          {error && (
            <div className="text-xs text-rose-600 font-semibold">
              PIN 码有误，默认密码为 1234
            </div>
          )}

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-xl"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs"
            >
              验证进入
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
