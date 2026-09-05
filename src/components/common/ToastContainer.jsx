import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isInfo = toast.type === 'info';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 p-4 bg-white/95 backdrop-blur-md rounded-xl shadow-card border border-slate-200 transition-all duration-300 animate-slide-up"
          >
            {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />}
            {isInfo && <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />}
            {isError && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />}
            <div className="flex-1 text-sm font-medium text-slate-700">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
