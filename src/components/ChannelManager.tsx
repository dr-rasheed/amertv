import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, Sparkles, Download, Copy, Check, Tv, Compass, RefreshCcw } from 'lucide-react';
import { Channel, ChannelCategory } from '../types';
import { CATEGORIES } from '../data/channels';
import { ChannelCard } from './ChannelCard';

interface ChannelManagerProps {
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  onPlayChannel: (channel: Channel) => void;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ChannelManager: React.FC<ChannelManagerProps> = ({
  channels,
  setChannels,
  onPlayChannel,
  favorites,
  setFavorites,
}) => {
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [copiedAll, setCopiedAll] = useState<boolean>(false);

  // New Channel Form State
  const [newChannel, setNewChannel] = useState<{
    name: string;
    tvgId: string;
    logo: string;
    category: ChannelCategory;
    url: string;
    isHd: boolean;
  }>({
    name: '',
    tvgId: '',
    logo: '',
    category: 'الوثائقيات والمعرفة',
    url: '',
    isHd: true,
  });

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredChannels = useMemo(() => {
    return channels.filter((ch) => {
      const matchesSearch =
        ch.name.toLowerCase().includes(search.toLowerCase()) ||
        ch.category.toLowerCase().includes(search.toLowerCase()) ||
        ch.tvgId.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'الكل' || ch.category === selectedCategory;
      const matchesFav = selectedCategory === 'المفضلة' ? favorites.includes(ch.id) : true;

      return matchesSearch && matchesCat && matchesFav;
    });
  }, [channels, search, selectedCategory, favorites]);

  const handleAddChannelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannel.name || !newChannel.url) {
      alert('الرجاء إدخال اسم القناة ورابط البث على الأقل!');
      return;
    }

    const created: Channel = {
      id: `custom-${Date.now()}`,
      name: newChannel.name,
      tvgName: newChannel.tvgId || newChannel.name.replace(/\s+/g, ''),
      tvgId: newChannel.tvgId || newChannel.name.replace(/\s+/g, ''),
      logo: newChannel.logo || 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Generic_TV_icon.png',
      category: newChannel.category,
      url: newChannel.url,
      isHd: newChannel.isHd,
      quality: newChannel.isHd ? 'HD' : 'SD',
    };

    setChannels((prev) => [created, ...prev]);
    setShowAddModal(false);
    setNewChannel({
      name: '',
      tvgId: '',
      logo: '',
      category: 'الوثائقيات والمعرفة',
      url: '',
      isHd: true,
    });
  };

  const handleCopyM3uFast = () => {
    const lines = ['#EXTM3U refresh="43200"'];
    filteredChannels.forEach((ch) => {
      lines.push(`#EXTINF:-1 tvg-id="${ch.tvgId}" tvg-name="${ch.tvgName}" tvg-logo="${ch.logo}" group-title="${ch.category}",${ch.name}`);
      lines.push(ch.url);
    });
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const [isSyncingIptvOrg, setIsSyncingIptvOrg] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string>('');

  const handleSyncIptvOrg = async () => {
    setIsSyncingIptvOrg(true);
    setSyncMessage('');
    try {
      const res = await fetch('/api/iptvorg');
      const data = await res.json();
      if (data.success && Array.isArray(data.channels)) {
        setChannels(data.channels);
        setSyncMessage(`تم استيراد ومزامنة ${data.totalChannels} قناة عربية من iptv-org بنجاح!`);
        setTimeout(() => setSyncMessage(''), 5000);
      } else {
        alert('تعذر استيراد قائمة iptv-org، سيتم استخدام القنوات المدمجة.');
      }
    } catch (err) {
      alert('حدث خطأ أثناء الاتصال بسيرفر iptv-org.');
    } finally {
      setIsSyncingIptvOrg(false);
    }
  };

  const natGeoChannel = channels.find((c) => c.id === 'natgeo-abudhabi');
  const natGeoWildChannel = channels.find((c) => c.id === 'natgeo-wild');

  return (
    <div className="space-y-6">
      {/* Sync Message Alert */}
      {syncMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 p-3.5 rounded-2xl text-xs font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{syncMessage}</span>
          </div>
        </div>
      )}

      {/* Featured National Geographic Hero Banner */}
      {natGeoChannel && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 border border-amber-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <img
                src={natGeoChannel.logo}
                alt="National Geographic Abu Dhabi"
                className="w-16 h-16 rounded-2xl bg-black p-2 border border-amber-500/40 object-contain shadow-lg shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    القنوات الوثائقية الأكثر طلباً 🌟
                  </span>
                  <span className="text-amber-400 text-xs font-semibold">بث مباشر عالي الدقة FHD</span>
                </div>
                <h2 className="text-2xl font-black text-white">{natGeoChannel.name} &amp; Nat Geo Wild</h2>
                <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
                  تم تضمين البث المباشر الرسمي لقنوات ناشيونال جيوغرافيك (أبوظبي و Wild) وتنسيق روابطها وبيانات الـ EPG لتكون متوافقة 100% مع كودي ومع معايير iptv-org المعتمدة.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                id="test-natgeo-hero-btn"
                onClick={() => onPlayChannel(natGeoChannel)}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-105"
              >
                <Tv className="w-4 h-4" />
                <span>تشغيل ناشيونال جيوغرافيك</span>
              </button>

              {natGeoWildChannel && (
                <button
                  id="test-natgeo-wild-btn"
                  onClick={() => onPlayChannel(natGeoWildChannel)}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold px-4 py-2.5 rounded-xl border border-amber-500/40 text-xs sm:text-sm flex items-center gap-2 transition-all"
                >
                  <Compass className="w-4 h-4" />
                  <span>Nat Geo Wild</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar Controls */}
      <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Field */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن اسم القناة أو التصنيف..."
              className="w-full bg-slate-950 text-white text-xs sm:text-sm pl-3 pr-9 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
            <button
              id="sync-iptv-org-btn"
              onClick={handleSyncIptvOrg}
              disabled={isSyncingIptvOrg}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${isSyncingIptvOrg ? 'animate-spin' : ''}`} />
              <span>{isSyncingIptvOrg ? 'جاري الاستيراد...' : 'دمج قنوات iptv-org المباشرة'}</span>
            </button>

            <button
              id="open-add-channel-modal"
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة قناة جديدة</span>
            </button>

            <button
              id="copy-filtered-m3u-btn"
              onClick={handleCopyM3uFast}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>نسخ M3U المفلترة</span>
            </button>
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-slate-800/60">
          <button
            onClick={() => setSelectedCategory('الكل')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'الكل'
                ? 'bg-emerald-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            جميع القنوات ({channels.length})
          </button>

          <button
            onClick={() => setSelectedCategory('المفضلة')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'المفضلة'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
            }`}
          >
            ★ المفضلة ({favorites.length})
          </button>

          {CATEGORIES.map((cat) => {
            const count = channels.filter((c) => c.category === cat.name).length;
            const isSelected = selectedCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span>{cat.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950 text-emerald-400' : 'bg-slate-950/60 text-slate-400'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Channel Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredChannels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onPlay={onPlayChannel}
            isFavorite={favorites.includes(channel.id)}
            onToggleFavorite={toggleFavorite}
          />
        ))}
      </div>

      {filteredChannels.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <p className="text-slate-400 text-sm">لم يتم العثور على أي قناة تطابق كلمة البحث أو التصنيف المحدد.</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('الكل');
            }}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-emerald-400 px-4 py-2 rounded-xl border border-slate-700 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الفلتر</span>
          </button>
        </div>
      )}

      {/* Add New Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-lg text-white">إضافة قناة جديدة للقائمة</h3>

            <form onSubmit={handleAddChannelSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">اسم القناة *</label>
                <input
                  type="text"
                  required
                  value={newChannel.name}
                  onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                  placeholder="مثال: قناة الفجر HD"
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رابط البث المباشر (HLS .m3u8) *</label>
                <input
                  type="url"
                  required
                  value={newChannel.url}
                  onChange={(e) => setNewChannel({ ...newChannel, url: e.target.value })}
                  placeholder="https://example.com/live/stream.m3u8"
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">التصنيف</label>
                <select
                  value={newChannel.category}
                  onChange={(e) => setNewChannel({ ...newChannel, category: e.target.value as ChannelCategory })}
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">معرّف TVG (tvg-id)</label>
                <input
                  type="text"
                  value={newChannel.tvgId}
                  onChange={(e) => setNewChannel({ ...newChannel, tvgId: e.target.value })}
                  placeholder="مثال: AlfajrTV.ps"
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">رابط شعار القناة (Logo URL)</label>
                <input
                  type="url"
                  value={newChannel.logo}
                  onChange={(e) => setNewChannel({ ...newChannel, logo: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full bg-slate-950 text-white text-xs p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs py-2.5 rounded-xl transition-colors"
                >
                  إضافة القناة
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2.5 rounded-xl transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
