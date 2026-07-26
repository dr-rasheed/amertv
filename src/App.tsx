import React, { useState } from 'react';
import { Channel } from './types';
import { INITIAL_CHANNELS } from './data/channels';
import { Navbar, ActiveTab } from './components/Navbar';
import { ChannelManager } from './components/ChannelManager';
import { StreamTesterView } from './components/StreamTesterView';
import { M3uGeneratorView } from './components/M3uGeneratorView';
import { EpgGeneratorView } from './components/EpgGeneratorView';
import { GithubGuideView } from './components/GithubGuideView';
import { KodiGuideView } from './components/KodiGuideView';
import { ShortnerHelper } from './components/ShortnerHelper';
import { PlayerModal } from './components/PlayerModal';
import { Tv, Github, Sparkles, Heart } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('channels');
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
        {activeTab === 'channels' && (
          <ChannelManager
            channels={channels}
            setChannels={setChannels}
            onPlayChannel={(channel) => setPlayingChannel(channel)}
            favorites={favorites}
            setFavorites={setFavorites}
          />
        )}

        {activeTab === 'tester' && (
          <StreamTesterView
            channels={channels}
            setChannels={setChannels}
            onPlayChannel={(channel) => setPlayingChannel(channel)}
          />
        )}

        {activeTab === 'm3u' && <M3uGeneratorView channels={channels} />}

        {activeTab === 'epg' && <EpgGeneratorView channels={channels} />}

        {activeTab === 'github' && <GithubGuideView channels={channels} />}

        {activeTab === 'kodi' && <KodiGuideView />}

        {activeTab === 'shortener' && <ShortnerHelper />}
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
                مُصمم لتأمين أفضل تجربة مشاهدة للقنوات العربية على Kodi IPTV Simple Client
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setActiveTab('m3u')}
              className="hover:text-emerald-400 transition-colors"
            >
              تحميل M3U
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('epg')}
              className="hover:text-emerald-400 transition-colors"
            >
              تحميل EPG
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('github')}
              className="hover:text-emerald-400 transition-colors"
            >
              شرح GitHub
            </button>
            <span>•</span>
            <button
              onClick={() => setActiveTab('kodi')}
              className="hover:text-emerald-400 transition-colors"
            >
              شرح Kodi
            </button>
          </div>

          <p className="text-slate-500 text-[11px] flex items-center gap-1">
            تم التطوير بحب للخدمات التلفزيونية العربية على Kodi 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
