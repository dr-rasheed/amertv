import React from 'react';
import { VodManager } from './components/VodManager';
import { Tv } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 dir-rtl">
      {/* Top Navbar Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <Tv className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-100 tracking-tight">Kodi VOD Manager</h1>
                <p className="text-xs text-emerald-400 font-medium">إدارة مكتبة الأفلام والمسلسلات</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        <VodManager />
      </main>

      {/* App Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-8 text-xs text-slate-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">Kodi VOD Manager</p>
              <p className="text-[11px] text-slate-500">
                تطبيق متكامل لإنشاء وإدارة إضافات ومستودعات Kodi
              </p>
            </div>
          </div>
          <p className="text-slate-500 text-[11px] flex items-center gap-1">
            الإصدار الحديث 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
