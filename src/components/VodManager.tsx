import React, { useState } from 'react';
import { UnifiedMediaItem, SiteSource, KodiAddonConfig, SourceLink } from '../types/repository';
import { INITIAL_UNIFIED_DATABASE } from '../data/unifiedDatabase';
import { generateAddonXml, generatePythonMainScript, generateRepositoryXml } from '../utils/kodiAddonGenerator';
import { 
  Film, PlaySquare, Youtube, Plus, Download, Edit3, Trash2, X, Info, 
  Code2, Server, Globe, CheckCircle2, Copy, Sparkles, Layers, RefreshCw,
  Tv, ListFilter, ShieldCheck, Play, Radio
} from 'lucide-react';

const INITIAL_SOURCES: SiteSource[] = [
  {
    id: 'arabcafe',
    name: 'عرب كافيه (ArabCafe)',
    domain: 'arabcafe.net',
    category: 'مسلسلات',
    status: 'شغال',
    scraperType: 'html_regex',
    targetUrlExample: 'https://arabcafe.net/series',
    description: 'موقع عرب كافيه للأفلام والمسلسلات العربية الحصرية بروابط مباشرة.',
    enabled: true,
  },
  {
    id: 'arabseed',
    name: 'عرب سيد (ArabSeed)',
    domain: 'arabseed.net',
    category: 'أفلام',
    status: 'شغال',
    scraperType: 'html_regex',
    targetUrlExample: 'https://arabseed.net/movies',
    description: 'استخراج الأفلام والبرامج التلفزيونية والمسلسلات بدقة 4K و FHD.',
    enabled: true,
  },
  {
    id: 'akwam',
    name: 'موقع أكوام (Akwam)',
    domain: 'akwam.cz',
    category: 'مسلسلات',
    status: 'شغال',
    scraperType: 'html_regex',
    targetUrlExample: 'https://akwam.cz/series',
    description: 'كشط قائمة الأفلام والمسلسلات العربية والأجنبية المترجمة مباشرة.',
    enabled: true,
  },
  {
    id: 'egybest',
    name: 'إيجي بست (EgyBest)',
    domain: 'egybest.net',
    category: 'أفلام',
    status: 'شغال',
    scraperType: 'html_regex',
    targetUrlExample: 'https://egybest.net/movies',
    description: 'استخراج روابط مشاهدة وتحميل الأفلام بدقات متعددة.',
    enabled: true,
  },
  {
    id: 'faselhd',
    name: 'فاصل إعلاني (FaselHD)',
    domain: 'faselhd.app',
    category: 'مسلسلات',
    status: 'شغال',
    scraperType: 'html_regex',
    targetUrlExample: 'https://faselhd.app/all-movies',
    description: 'جلب الحلقات والأفلام الحصرية مع ترجمات احترافية وسيرفرات سريعة.',
    enabled: true,
  },
  {
    id: 'cima4u',
    name: 'سيما فور يو (Cima4U)',
    domain: 'cima4u.one',
    category: 'أفلام',
    status: 'شغال',
    scraperType: 'html_regex',
    targetUrlExample: 'https://cima4u.one/movies',
    description: 'موقع أفلام ومسلسلات عربية وهندية ومترجمة.',
    enabled: true,
  },
  {
    id: 'yt_playlists',
    name: 'قوائم تشغيل يوتيوب (YouTube Playlists)',
    domain: 'youtube.com',
    category: 'مسلسلات',
    status: 'شغال',
    scraperType: 'youtube_playlist',
    targetUrlExample: 'https://www.youtube.com/playlist?list=PLX2Q5jK_V7F9j9xZ8vD_bY2zL8W_yYv_w',
    description: 'تشغيل مسلسلات ومقاطع يوتيوب عبر إضافة YouTube Plugin في كودي.',
    enabled: true,
  },
];

export const VodManager: React.FC = () => {
  const [dbItems, setDbItems] = useState<UnifiedMediaItem[]>(INITIAL_UNIFIED_DATABASE);
  const [sources, setSources] = useState<SiteSource[]>(INITIAL_SOURCES);
  const [activeTab, setActiveTab] = useState<'database' | 'generator' | 'scrapers' | 'deploy'>('generator');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');

  // Kodi Generator Configuration with AmerTV repository defaults
  const [addonConfig, setAddonConfig] = useState<KodiAddonConfig>({
    addonId: 'plugin.video.amertv',
    addonName: 'AmerTV Matrix & ZombiB Repository',
    version: '1.0.0',
    providerName: 'AmerTV Developer',
    summary: 'مستودع AmerTV الموحد لجلب الأفلام والمسلسلات مع الانتهاء المباشر والانتقال التلقائي للحلقة التالية',
    repoUrl: 'https://dr-rasheed.github.io/amertv',
    autoNextEpisode: true,
    autoUpdateDb: true,
    dbVersion: '1.0.2',
    sources: INITIAL_SOURCES,
  });

  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isAddMediaModalOpen, setIsAddMediaModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);

  // New Media Form State
  const [newMedia, setNewMedia] = useState<Partial<UnifiedMediaItem>>({
    title: '',
    type: 'movie',
    category: 'أفلام عربية',
    year: 2025,
    poster: '',
    description: '',
    rating: '8.5',
  });

  // Source link fields
  const [newSource, setNewSource] = useState<SourceLink>({
    providerName: 'عرب كافيه (ArabCafe)',
    quality: '1080p',
    streamUrl: '',
    isDirect: true,
  });

  const [tempSources, setTempSources] = useState<SourceLink[]>([]);

  const toggleSourceEnabled = (id: string) => {
    const updated = sources.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    setSources(updated);
    setAddonConfig({ ...addonConfig, sources: updated });
  };

  const handleCopy = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(label);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Export JSON database for GitHub
  const handleExportJsonDb = () => {
    const jsonDb = {
      version: addonConfig.dbVersion,
      updatedAt: new Date().toISOString(),
      repository: 'https://github.com/dr-rasheed/amertv',
      items: dbItems.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()),
    };

    const blob = new Blob([JSON.stringify(jsonDb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'media_database.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add source link to temporary creation list
  const handleAddTempSource = () => {
    if (!newSource.streamUrl) return;
    setTempSources([...tempSources, { ...newSource }]);
    setNewSource({ providerName: 'عرب كافيه (ArabCafe)', quality: '1080p', streamUrl: '', isDirect: true });
  };

  // Save new media item to database
  const handleSaveMediaItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedia.title) return;

    const item: UnifiedMediaItem = {
      id: `item-${Date.now()}`,
      title: newMedia.title,
      type: newMedia.type as 'movie' | 'series',
      category: newMedia.category as any,
      year: Number(newMedia.year) || 2025,
      dateAdded: new Date().toISOString(),
      poster: newMedia.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80',
      description: newMedia.description || '',
      rating: newMedia.rating || '8.0',
      sources: newMedia.type === 'movie' ? [...tempSources] : undefined,
      seasons: newMedia.type === 'series' ? [
        {
          seasonNumber: 1,
          title: 'الموسم الأول',
          episodes: [
            {
              episodeNumber: 1,
              title: 'الحلقة 1',
              sources: [...tempSources]
            }
          ]
        }
      ] : undefined
    };

    setDbItems([item, ...dbItems]);
    setIsAddMediaModalOpen(false);
    setTempSources([]);
    setNewMedia({ title: '', type: 'movie', category: 'أفلام عربية', year: 2025, poster: '', description: '', rating: '8.5' });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العمل من قاعدة البيانات الموحدة؟')) {
      setDbItems(dbItems.filter(i => i.id !== id));
    }
  };

  // Filtered and Sorted (Newest to Oldest) Items
  const sortedItems = [...dbItems].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
  const filteredItems = selectedCategory === 'الكل'
    ? sortedItems
    : sortedItems.filter(i => i.category === selectedCategory);

  const pythonScript = generatePythonMainScript(addonConfig, dbItems);
  const addonXml = generateAddonXml(addonConfig);
  const repoXml = generateRepositoryXml(addonConfig);
  const jsonDbString = JSON.stringify({
    version: addonConfig.dbVersion,
    updatedAt: new Date().toISOString(),
    items: sortedItems
  }, null, 2);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/30 shadow-inner">
              <Code2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">AmerTV Matrix & ZombiB Scraper Engine</h2>
                <span className="bg-purple-500/20 text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-purple-500/30">
                  https://github.com/dr-rasheed/amertv
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                نظام كشط ميديا موحد لـ Kodi مع سيرفرات متعددة (عرب كافيه، أكوام، إيجي بست، فاصل إعلاني)، تشغيل تلقائي للحلقة التالية، وتحديث تلقائي دائم لقاعدة البيانات.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg"
            >
              <Info className="w-4 h-4" />
              طريقة التثبيت والشرح
            </button>
            <button
              onClick={handleExportJsonDb}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-900/20"
            >
              <Download className="w-4 h-4" />
              تصدير media_database.json
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('generator')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium text-sm transition-all border-b-2 ${
            activeTab === 'generator'
              ? 'bg-purple-600/10 text-purple-400 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
          }`}
        >
          <Code2 className="w-4 h-4" />
          مولد كود Kodi Python & Repo
        </button>

        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium text-sm transition-all border-b-2 ${
            activeTab === 'database'
              ? 'bg-purple-600/10 text-purple-400 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
          }`}
        >
          <Layers className="w-4 h-4" />
          قاعدة البيانات الموحدة للأفلام والمسلسلات ({dbItems.length})
        </button>

        <button
          onClick={() => setActiveTab('scrapers')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium text-sm transition-all border-b-2 ${
            activeTab === 'scrapers'
              ? 'bg-purple-600/10 text-purple-400 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
          }`}
        >
          <Globe className="w-4 h-4" />
          مواقع وسيرفرات الكشط ({sources.filter(s => s.enabled).length})
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`flex items-center gap-2 px-5 py-3 rounded-t-xl font-medium text-sm transition-all border-b-2 ${
            activeTab === 'deploy'
              ? 'bg-purple-600/10 text-purple-400 border-purple-500 font-bold'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
          }`}
        >
          <Server className="w-4 h-4" />
          نشر المستودع على dr-rasheed/amertv
        </button>
      </div>

      {/* TAB 1: CODE GENERATOR */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-slate-100 flex items-center gap-2 text-base border-b border-slate-800 pb-3">
                <Sparkles className="w-5 h-5 text-purple-400" />
                إعدادات إضافة ومستودع AmerTV
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">اسم الإضافة في كودي</label>
                <input
                  type="text"
                  value={addonConfig.addonName}
                  onChange={(e) => setAddonConfig({ ...addonConfig, addonName: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">معرف الإضافة (Addon ID)</label>
                <input
                  type="text"
                  value={addonConfig.addonId}
                  onChange={(e) => setAddonConfig({ ...addonConfig, addonId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">رابط مستودع GitHub Pages</label>
                <input
                  type="text"
                  value={addonConfig.repoUrl}
                  onChange={(e) => setAddonConfig({ ...addonConfig, repoUrl: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-2 border-t border-slate-800 pt-3">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addonConfig.autoNextEpisode}
                    onChange={(e) => setAddonConfig({ ...addonConfig, autoNextEpisode: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-purple-600"
                  />
                  <span>تشغيل تلقائي للحلقة التالية (Auto Next Episode)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={addonConfig.autoUpdateDb}
                    onChange={(e) => setAddonConfig({ ...addonConfig, autoUpdateDb: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-purple-600"
                  />
                  <span>تحديث قاعدة البيانات تلقائياً عند تشغيل Kodi</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">إصدار قاعدة البيانات (DB Version)</label>
                <input
                  type="text"
                  value={addonConfig.dbVersion}
                  onChange={(e) => setAddonConfig({ ...addonConfig, dbVersion: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Code Output Viewer */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-slate-100 text-base">كود بايثون الرئيسي (<code className="text-purple-400 text-sm">main.py</code>)</h3>
                </div>
                <button
                  onClick={() => handleCopy(pythonScript, 'main.py')}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                >
                  {copiedCode === 'main.py' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode === 'main.py' ? 'تم النسخ!' : 'نسخ الكود'}
                </button>
              </div>

              <div className="bg-slate-950 rounded-xl p-4 overflow-x-auto font-mono text-xs text-slate-300 border border-slate-800/80 flex-1 max-h-[500px]" dir="ltr">
                <pre>{pythonScript}</pre>
              </div>
            </div>
          </div>

          {/* Additional Files Manifests */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs text-slate-200 font-mono">addon.xml</span>
                <button onClick={() => handleCopy(addonXml, 'addon.xml')} className="text-xs text-purple-400 hover:underline">
                  {copiedCode === 'addon.xml' ? 'تم!' : 'نسخ'}
                </button>
              </div>
              <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-emerald-400/90 overflow-x-auto max-h-36" dir="ltr">
                <pre>{addonXml}</pre>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs text-slate-200 font-mono">repository.xml</span>
                <button onClick={() => handleCopy(repoXml, 'repoXml')} className="text-xs text-blue-400 hover:underline">
                  {copiedCode === 'repoXml' ? 'تم!' : 'نسخ'}
                </button>
              </div>
              <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-blue-300/90 overflow-x-auto max-h-36" dir="ltr">
                <pre>{repoXml}</pre>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs text-slate-200 font-mono">media_database.json</span>
                <button onClick={() => handleCopy(jsonDbString, 'jsonDb')} className="text-xs text-amber-400 hover:underline">
                  {copiedCode === 'jsonDb' ? 'تم!' : 'نسخ'}
                </button>
              </div>
              <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-amber-300/90 overflow-x-auto max-h-36" dir="ltr">
                <pre>{jsonDbString}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UNIFIED DATABASE MANAGEMENT */}
      {activeTab === 'database' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div>
              <h3 className="font-bold text-slate-100 text-base">دليل الأعمال والمرئيات الموحد (مرتب من الأحدث للأقدم)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                كل عمل أو حلقة مرتبطة بمجموعة سيرفرات مختلفة (عرب كافيه، أكوام، إيجي بست، إلخ).
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddMediaModalOpen(true)}
                className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                إضافة عمل أو مسلسل جديد
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {['الكل', 'أفلام عربية', 'أفلام أجنبية', 'مسلسلات عربية', 'مسلسلات أجنبية', 'أنمي'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-purple-500/40 transition-colors">
                <div className="flex gap-4">
                  <img src={item.poster} alt={item.title} className="w-20 h-28 object-cover rounded-xl bg-slate-800 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-md">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">{item.year}</span>
                    </div>
                    <h4 className="font-bold text-slate-100 text-base mt-1 truncate" title={item.title}>{item.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                    <div className="text-[11px] text-slate-500 mt-2">
                      تاريخ الإضافة: {new Date(item.dateAdded).toLocaleDateString('ar-EG')}
                    </div>
                  </div>
                </div>

                {/* Sources or Episodes list */}
                <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800/80 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block border-b border-slate-800/80 pb-1">
                    {item.type === 'movie' ? 'سيرفرات البث والمصادر:' : `الحلقات والمواسم (${item.seasons?.length || 0} مواسم):`}
                  </span>

                  {item.type === 'movie' && item.sources && (
                    <div className="space-y-1">
                      {item.sources.map((s, idx) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] text-slate-300">
                          <span className="text-purple-300 font-medium">🔗 {s.providerName}</span>
                          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400">{s.quality}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {item.type === 'series' && item.seasons && (
                    <div className="text-xs text-slate-400 space-y-1">
                      {item.seasons.map((season, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{season.title}</span>
                          <span className="text-purple-400">{season.episodes.length} حلقات</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <button onClick={() => handleDeleteItem(item.id)} className="text-slate-500 hover:text-red-400 text-xs flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                    حذف العمل
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCRAPER SOURCES */}
      {activeTab === 'scrapers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sources.map((source) => (
              <div key={source.id} className={`bg-slate-900 border ${source.enabled ? 'border-purple-500/40 bg-purple-950/5' : 'border-slate-800'} rounded-2xl p-5 space-y-4 transition-all`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${source.enabled ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-slate-800 text-slate-500'}`}>
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-200 text-base">{source.name}</h4>
                      <span className="text-xs font-mono text-slate-400" dir="ltr">{source.domain}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleSourceEnabled(source.id)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                      source.enabled 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {source.enabled ? 'مفعل' : 'معطل'}
                  </button>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2">{source.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: GITHUB DEPLOYMENT INSTRUCTIONS FOR dr-rasheed/amertv */}
      {activeTab === 'deploy' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-12 h-12 bg-purple-500/10 text-purple-400 rounded-xl flex items-center justify-center border border-purple-500/20">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">دليل رفع وتحديث مستودع AmerTV على GitHub</h3>
              <p className="text-xs text-slate-400" dir="ltr">https://github.com/dr-rasheed/amertv</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 space-y-3">
              <h4 className="font-bold text-purple-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">1</span>
                الملفات المطلوبة في المستودع الرئيسي
              </h4>
              <p className="text-xs text-slate-400">احفظ الملفات التالية وارفعها على مستودع GitHub الخاص بك:</p>
              <ul className="space-y-1.5 text-xs text-slate-200 font-mono" dir="ltr">
                <li>• media_database.json (دليل الأفلام والمسلسلات)</li>
                <li>• main.py (كود الكشط والتشغيل الرئيسي)</li>
                <li>• addon.xml (ملف تعريف الإضافة)</li>
                <li>• repository.xml (ملف تعريف المستودع)</li>
              </ul>
            </div>

            <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 space-y-3">
              <h4 className="font-bold text-purple-400 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">2</span>
                طريقة ربط Kodi بـ AmerTV
              </h4>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                <li>في كودي انتقل إلى <strong className="text-white">File Manager -&gt; Add source</strong>.</li>
                <li>ضع الرابط: <code className="bg-slate-950 px-2 py-0.5 rounded text-emerald-400 font-mono" dir="ltr">https://dr-rasheed.github.io/amertv/</code></li>
                <li>سمّه <strong className="text-purple-300">AmerTV Repo</strong>.</li>
                <li>ثبت المستودع من zip وسيتم تحديث المكتبة والسيرفرات تلقائياً عند كل تشغيل لـ Kodi!</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Add Media Modal */}
      {isAddMediaModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddMediaModalOpen(false)} className="absolute top-4 left-4 text-slate-500 hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-100 mb-6">إضافة عمل جديد لقاعدة البيانات الموحدة</h3>

            <form onSubmit={handleSaveMediaItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">اسم الفلم أو المسلسل *</label>
                <input 
                  type="text" 
                  required
                  value={newMedia.title}
                  onChange={(e) => setNewMedia({...newMedia, title: e.target.value})}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200" 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">النوع</label>
                  <select 
                    value={newMedia.type}
                    onChange={(e) => setNewMedia({...newMedia, type: e.target.value as any})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200"
                  >
                    <option value="movie">فيلم</option>
                    <option value="series">مسلسل</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">التصنيف</label>
                  <select 
                    value={newMedia.category}
                    onChange={(e) => setNewMedia({...newMedia, category: e.target.value as any})}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-slate-200"
                  >
                    <option value="أفلام عربية">أفلام عربية</option>
                    <option value="أفلام أجنبية">أفلام أجنبية</option>
                    <option value="مسلسلات عربية">مسلسلات عربية</option>
                    <option value="مسلسلات أجنبية">مسلسلات أجنبية</option>
                    <option value="أنمي">أنمي</option>
                  </select>
                </div>
              </div>

              {/* Add Source section */}
              <div className="border-t border-slate-800 pt-3 space-y-2">
                <label className="block text-xs font-bold text-purple-400">إضافة سيرفر / مصدر للبث:</label>
                <div className="flex gap-2">
                  <select
                    value={newSource.providerName}
                    onChange={(e) => setNewSource({...newSource, providerName: e.target.value})}
                    className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200"
                  >
                    <option value="عرب كافيه (ArabCafe)">عرب كافيه</option>
                    <option value="أكوام (Akwam)">أكوام</option>
                    <option value="إيجي بست (EgyBest)">إيجي بست</option>
                    <option value="فاصل إعلاني (FaselHD)">فاصل إعلاني</option>
                    <option value="عرب سيد (ArabSeed)">عرب سيد</option>
                  </select>
                  <input
                    type="text"
                    placeholder="رابط الفيديو المباشر https://..."
                    value={newSource.streamUrl}
                    onChange={(e) => setNewSource({...newSource, streamUrl: e.target.value})}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 text-left font-mono"
                    dir="ltr"
                  />
                  <button type="button" onClick={handleAddTempSource} className="bg-purple-600 text-white text-xs px-3 py-1.5 rounded-lg">
                    إضافة
                  </button>
                </div>

                {tempSources.length > 0 && (
                  <div className="bg-slate-950 p-2 rounded-lg text-xs space-y-1">
                    {tempSources.map((s, i) => (
                      <div key={i} className="flex justify-between text-slate-300 text-[11px]">
                        <span>{s.providerName}</span>
                        <span className="font-mono text-purple-400 truncate max-w-[200px]" dir="ltr">{s.streamUrl}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2.5 rounded-xl font-medium">
                  حفظ العمل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Guide Modal */}
      {isGuideModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsGuideModalOpen(false)} className="absolute top-4 left-4 text-slate-500 hover:text-slate-300">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-slate-100 mb-4">شرح وتفاصيل نظام AmerTV Scraper لكودي</h3>
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <p>
                تم بناء نظام الشفرة هذا كحل كامل ينافس إضافات مثل ZombiB و Matrix عبر الخصائص التالية:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-300">
                <li><strong>تحديث تلقائي مستمر:</strong> يقوم كودي بفحص ملف <code className="text-purple-300 font-mono">media_database.json</code> الموجود على مستودعك <code className="text-emerald-400 font-mono">dr-rasheed/amertv</code> ويحمل التحديثات فوراً بدون الحاجة لإعادة تثبيت الإضافة.</li>
                <li><strong>تشغيل الحلقة التالية تلقائياً:</strong> عند اقتراب انتهاء الحلقة الحالية للمسلسل بـ 8 ثوانٍ، تقوم إضافة بايثون تلقائياً بتحديد وتشغيل الحلقة التالية مباشرة.</li>
                <li><strong>تنوع المصادر:</strong> دعم مواقع مثل عرب كافيه (ArabCafe)، عرب سيد (ArabSeed)، أكوام (Akwam)، إيجي بست (EgyBest)، فاصل إعلاني (FaselHD)، وسيما فور يو (Cima4U).</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
