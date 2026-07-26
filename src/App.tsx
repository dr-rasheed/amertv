import React, { useState } from 'react';
import { Channel } from './types';
import { INITIAL_CHANNELS } from './data/channels';
import { Navbar, ActiveTab } from './components/Navbar';
import { SmartWizardView } from './components/SmartWizardView';
import { ChannelManager } from './components/ChannelManager';
import { PlayerModal } from './components/PlayerModal';
import { Tv } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('wizard');
  const [channels, setChannels] = useState<Channel[]>(INITIAL_CHANNELS);
  const [favorites, setFavorites] = useState<string[]>(['natgeo-abudhabi', 'aljazeera-news', 'ad-sports-1']);
  const [playingChannel, setPlayingChannel] = useState<Channel | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 dir-rtl">
      {/* Top Navbar Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        channelCount={channels.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'wizard' && (
          <SmartWizardView
            channels={channels}
            setChannels={setChannels}
            onPlayChannel={(channel) => setPlayingChannel(channel)}
          />
        )}

        {activeTab === 'channels' && (
          <ChannelManager
            channels={channels}
            setChannels={setChannels}
            onPlayChannel={(channel) => setPlayingChannel(channel)}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        )}
      </main>

      {/* Stream Test Player Modal */}
      <PlayerModal
        channel={playingChannel}
        onClose={() => setPlayingChannel(null)}
      />

      {/* App Footer */}
      <footer className="bg-slate-900 border-t border-slate-800/80 py-8 text-xs text-slate-400 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-right">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-200 text-sm">Kodi Arabic IPTV Manager</p>
              <p className="text-[11px] text-slate-500">
                تطبيق مبسط لإدارة وتحديث قنوات Kodi IPTV والرفع المباشر على GitHub
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button
              onClick={() => setActiveTab('wizard')}
              className="hover:text-emerald-400 transition-colors"
            >
              معالج التحديث
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('channels')}
              className="hover:text-emerald-400 transition-colors"
            >
              عرض وتصفية القنوات
            </button>
          </div>

          <p className="text-slate-500 text-[11px] flex items-center gap-1">
            تم التطوير للخدمات التلفزيونية العربية المباشرة 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
