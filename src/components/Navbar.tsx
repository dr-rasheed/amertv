import React from 'react';
import { Tv, FileText, Calendar, Github, MonitorPlay, Link2, Sparkles } from 'lucide-react';

export type ActiveTab = 'channels' | 'm3u' | 'epg' | 'github' | 'kodi' | 'shortener';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  channelCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, channelCount }) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'channels', label: 'القنوات والأدوات', icon: <Tv className="w-4 h-4" />, badge: `${channelCount}` },
    { id: 'm3u', label: 'ملف M3U', icon: <FileText className="w-4 h-4" /> },
    { id: 'epg', label: 'دليل EPG', icon: <Calendar className="w-4 h-4" /> },
    { id: 'github', label: 'دليل GitHub', icon: <Github className="w-4 h-4" /> },
    { id: 'kodi', label: 'شرح Kodi Simple Client', icon: <MonitorPlay className="w-4 h-4" />, badge: 'هام' },
    { id: 'shortener', label: 'الروابط القصيرة', icon: <Link2 className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3 space-x-reverse cursor-pointer" onClick={() => setActiveTab('channels')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-white tracking-wide">Kodi Arabic IPTV</h1>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                  M3U & EPG
                </span>
              </div>
              <p className="text-xs text-slate-400">مُولد وإدارة قوائم M3U والدليل الإلكتروني لـ IPTV Simple Client</p>
            </div>
          </div>

          {/* Quick Info Badge */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>يتضمن <strong>ناشيونال جيوغرافيك أبوظبي HD</strong> ودعم التحديث التلقائي</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex space-x-1 space-x-reverse overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
