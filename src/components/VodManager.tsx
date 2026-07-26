import React, { useState } from 'react';
import { UnifiedMediaItem, SiteSource, KodiAddonConfig, SourceLink } from '../types/repository';
import { INITIAL_UNIFIED_DATABASE } from '../data/unifiedDatabase';
import { 
  generateAddonXml, 
  generatePythonMainScript, 
  generateRepositoryXml, 
  generateIndexHtml,
  generateAddonsXml,
  createRepositoryZipBlob,
  createPluginZipBlob,
  createFullRepositoryReleaseBundleZipBlob
} from '../utils/kodiAddonGenerator';
import md5 from 'md5';
import { 
  Film, PlaySquare, Youtube, Plus, Download, Edit3, Trash2, X, Info, 
  Code2, Server, Globe, CheckCircle2, Copy, Sparkles, Layers, RefreshCw,
  Tv, ListFilter, ShieldCheck, Play, Radio, AlertTriangle, FileCode, FolderArchive
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
  const [isGeneratingZip, setIsGeneratingZip] = useState<boolean>(false);
  const [githubToken, setGithubToken] = useState<string>('');
  const [githubRepo, setGithubRepo] = useState<string>('dr-rasheed/amertv');
  const [isDeploying, setIsDeploying] = useState<boolean>(false);
  const [deployLog, setDeployLog] = useState<string[]>([]);

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

  const handleDeployToGithub = async () => {
    if (!githubToken) {
      alert("الرجاء إدخال توكن GitHub أولاً (GitHub Access Token)");
      return;
    }
    if (!githubRepo || !githubRepo.includes('/')) {
      alert("الرجاء إدخال اسم المستودع بصيغة owner/repo");
      return;
    }
    
    setIsDeploying(true);
    setDeployLog(["بدء الاتصال مع GitHub API..."]);
    
    try {
      const branch = 'main'; 
      const baseUrl = `https://api.github.com/repos/${githubRepo}`;
      const headers = {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      };

      const log = (msg: string) => setDeployLog(prev => [...prev, msg]);

      // 1. Get the repository info to verify default branch
      let actualBranch = branch;
      try {
        const repoRes = await fetch(baseUrl, { headers });
        if (repoRes.ok) {
          const repoData = await repoRes.json();
          actualBranch = repoData.default_branch || branch;
          log(`فرع المستودع الافتراضي هو: ${actualBranch}`);
        } else {
          throw new Error("لا يمكن الوصول للمستودع، تأكد من صحة التوكن واسم المستودع");
        }
      } catch (e: any) {
        throw new Error(e.message);
      }

      // Helper to convert Blob to Base64
      const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(blob);
        });
      };

      // Helper for individual file PUT
      const uploadFile = async (path: string, content: string | Blob, isBase64: boolean = false) => {
        log(`جاري رفع ${path}...`);
        
        let base64Content = "";
        if (content instanceof Blob) {
           base64Content = await blobToBase64(content);
        } else if (isBase64) {
           base64Content = content as string;
        } else {
           base64Content = btoa(unescape(encodeURIComponent(content as string)));
        }

        // 1. Get file SHA if it exists
        let sha = undefined;
        try {
          const getRes = await fetch(`${baseUrl}/contents/${path}?ref=${actualBranch}`, { headers });
          if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
          }
        } catch (e) { /* ignore */ }

        // 2. PUT file
        const body = {
          message: `تحديث تلقائي: ${path} (الإصدار ${addonConfig.version})`,
          content: base64Content,
          branch: actualBranch,
          ...(sha ? { sha } : {})
        };

        const putRes = await fetch(`${baseUrl}/contents/${path}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(body)
        });

        if (!putRes.ok) {
          const errData = await putRes.json();
          throw new Error(`فشل رفع ${path}: ${errData.message}`);
        }
        log(`✅ تم رفع ${path} بنجاح`);
      };

      // Generate all files
      log("جاري توليد ملفات المستودع محلياً...");
      
      const rawBaseUrl = `https://raw.githubusercontent.com/${githubRepo}/${actualBranch}`;
      const deployConfig = { ...addonConfig, repoUrl: rawBaseUrl };
      
      const repoId = `repository.${deployConfig.addonId.replace('plugin.video.', '')}`;
      const addonsXmlStr = generateAddonsXml(deployConfig);
      const addonsXmlMd5 = md5(addonsXmlStr);
      const indexHtmlStr = generateIndexHtml(deployConfig);
      
      const sortedItems = [...dbItems].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
      const jsonDbStr = JSON.stringify({
        version: deployConfig.dbVersion,
        updatedAt: new Date().toISOString(),
        items: sortedItems
      }, null, 2);

      const repoZipBlob = await createRepositoryZipBlob(deployConfig);
      const pluginZipBlob = await createPluginZipBlob(deployConfig, dbItems);

      // Upload them sequentially
      await uploadFile('addons.xml', addonsXmlStr);
      await uploadFile('addons.xml.md5', addonsXmlMd5);
      await uploadFile('index.html', indexHtmlStr);
      await uploadFile('media_database.json', jsonDbStr);
      await uploadFile(`${repoId}/${repoId}-${addonConfig.version}.zip`, repoZipBlob);
      await uploadFile(`${addonConfig.addonId}/${addonConfig.addonId}-${addonConfig.version}.zip`, pluginZipBlob);

      log("🎉 تمت العملية بنجاح! مكتبتك الآن محدثة على كودي مباشرة.");
    } catch (err: any) {
      setDeployLog(prev => [...prev, `❌ خطأ: ${err.message}`]);
    } finally {
      setIsDeploying(false);
    }
  };

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

  // Export index.html for GitHub Pages so Kodi can browse ZIP files
  const handleExportIndexHtml = () => {
    const htmlContent = generateIndexHtml(addonConfig);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Generate & Download Repository ZIP (repository.amertv-1.0.0.zip)
  const handleDownloadRepoZip = async () => {
    try {
      setIsGeneratingZip(true);
      const rawBaseUrl = `https://raw.githubusercontent.com/${githubRepo}/main`;
      const downloadConfig = { ...addonConfig, repoUrl: rawBaseUrl };
      
      const zipBlob = await createRepositoryZipBlob(downloadConfig);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `repository.amertv-${addonConfig.version}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // Generate & Download Plugin ZIP (plugin.video.amertv-1.0.0.zip)
  const handleDownloadPluginZip = async () => {
    try {
      setIsGeneratingZip(true);
      const zipBlob = await createPluginZipBlob(addonConfig, dbItems);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${addonConfig.addonId}-${addonConfig.version}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  // Generate & Download FULL Release Bundle ZIP containing ALL repository files
  const handleDownloadFullReleaseBundleZip = async () => {
    try {
      setIsGeneratingZip(true);
      const rawBaseUrl = `https://raw.githubusercontent.com/${githubRepo}/main`;
      const downloadConfig = { ...addonConfig, repoUrl: rawBaseUrl };
      
      const zipBlob = await createFullRepositoryReleaseBundleZipBlob(downloadConfig, dbItems);
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `amertv-github-release-v${addonConfig.version}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingZip(false);
    }
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
  const indexHtml = generateIndexHtml(addonConfig);
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
              onClick={handleDownloadFullReleaseBundleZip}
              disabled={isGeneratingZip}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-900/40 border border-purple-400/30"
            >
              <FolderArchive className="w-4 h-4 text-purple-200 animate-bounce" />
              {isGeneratingZip ? 'جاري تجميع حزمة المستودع...' : '📦 تحميل حزمة المستودع الكاملة (.ZIP)'}
            </button>
            <button
              onClick={handleDownloadRepoZip}
              disabled={isGeneratingZip}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all border border-slate-700"
            >
              <Download className="w-4 h-4 text-purple-400" />
              repository.amertv.zip فقط
            </button>
            <button
              onClick={() => setIsGuideModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-lg"
            >
              <Info className="w-4 h-4" />
              طريقة التثبيت المباشر
            </button>
          </div>
        </div>
      </div>

      {/* CRITICAL SOLUTION CALLOUT FOR EMPTY KODI FOLDER */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-2xl p-5 text-amber-200 space-y-3 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 animate-pulse" />
          <h3 className="font-bold text-base text-amber-100">
            ⚠️ سبب ظهور المجلد فارغاً عند فتح الرابط في Kodi وطريقة الحل المباشرة:
          </h3>
        </div>
        <p className="text-xs text-amber-200/90 leading-relaxed">
          عندما تفتح الرابط <code className="bg-amber-950 px-2 py-0.5 rounded text-emerald-300 font-mono" dir="ltr">https://dr-rasheed.github.io/amertv/</code> في كودي عبر <strong className="text-amber-100">Install from zip file</strong>، يبحث كودي داخل الرابط عن ملف مضغوط <code className="text-purple-300 font-mono">repository.amertv-1.0.0.zip</code> وملف <code className="text-blue-300 font-mono">index.html</code>. إذا لم تكن هذه الملفات مرفوعة داخل مستودعك على GitHub، سيرى كودي المجلد فارغاً!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          {/* Solution 1: Upload to GitHub */}
          <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
            <h4 className="font-bold text-xs text-purple-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px]">1</span>
              الحل الأول: رفع الملفات لـ GitHub لتظهر في كودي مباشرة
            </h4>
            <p className="text-[11px] text-slate-300">حمل الملفات التالية وارفعها إلى مستودعك <code className="text-emerald-400" dir="ltr">dr-rasheed/amertv</code>:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={handleDownloadRepoZip} className="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                <FolderArchive className="w-3.5 h-3.5" /> تحميل repository.amertv.zip
              </button>
              <button onClick={handleExportIndexHtml} className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5" /> تحميل index.html
              </button>
              <button onClick={handleExportJsonDb} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> تحميل media_database.json
              </button>
            </div>
          </div>

          {/* Solution 2: Direct Zip Install */}
          <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2">
            <h4 className="font-bold text-xs text-emerald-300 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
              الحل الثاني: التثبيت المباشر من الذاكرة المحلية (بدون GitHub)
            </h4>
            <p className="text-[11px] text-slate-300">حمل ملف الإضافة المباشر على هاتفك/شاشتك، ثم اختر <strong className="text-white">Install from zip file</strong> واختر الملف من ذاكرة الجهاز المحلية:</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={handleDownloadPluginZip} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-lg font-medium flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> تحميل plugin.video.amertv.zip المباشر
              </button>
            </div>
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

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={handleDownloadRepoZip}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg"
                >
                  <FolderArchive className="w-4 h-4" />
                  تحميل repository.amertv.zip جاهز
                </button>
                <button
                  onClick={handleExportIndexHtml}
                  className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <FileCode className="w-4 h-4" />
                  تحميل index.html
                </button>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-xs text-slate-200 font-mono">index.html</span>
                <button onClick={() => handleCopy(indexHtml, 'index.html')} className="text-xs text-blue-400 hover:underline">
                  {copiedCode === 'index.html' ? 'تم!' : 'نسخ'}
                </button>
              </div>
              <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-blue-300/90 overflow-x-auto max-h-36" dir="ltr">
                <pre>{indexHtml}</pre>
              </div>
            </div>

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
              <div className="bg-slate-950 rounded-lg p-2.5 font-mono text-[11px] text-purple-300/90 overflow-x-auto max-h-36" dir="ltr">
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
              <h3 className="text-lg font-bold text-slate-100">نشر التحديثات تلقائياً على GitHub (Auto-Deploy)</h3>
              <p className="text-xs text-slate-400">لن تحتاج بعد الآن لتحميل الملفات ورفعها يدوياً. فقط بضغطة زر سيتم رفع كل شيء عبر GitHub API.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
            {/* Auto Deploy Form */}
            <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 space-y-4">
              <h4 className="font-bold text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                تحديث المستودع برمجياً بضغطة زر
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">اسم المستودع (Owner/Repo)</label>
                  <input
                    type="text"
                    value={githubRepo}
                    onChange={(e) => setGithubRepo(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">توكن الوصول (GitHub Token)</label>
                  <input
                    type="password"
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 font-mono"
                    dir="ltr"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">يجب أن يملك التوكن صلاحية (repo) لكي يستطيع رفع الملفات.</p>
                </div>

                <button
                  onClick={handleDeployToGithub}
                  disabled={isDeploying || !githubToken}
                  className={`w-full text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                    isDeploying || !githubToken
                      ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/40'
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${isDeploying ? 'animate-spin' : ''}`} />
                  {isDeploying ? 'جاري رفع الملفات ونشر التحديث...' : 'Commit & Push (تحديث مباشر لـ GitHub)'}
                </button>
              </div>

              {/* Deployment Logs */}
              {deployLog.length > 0 && (
                <div className="mt-4 bg-slate-950 rounded-xl p-3 border border-slate-800 h-32 overflow-y-auto">
                  <ul className="space-y-1">
                    {deployLog.map((log, idx) => (
                      <li key={idx} className={`text-[10px] font-mono ${
                        log.includes('✅') ? 'text-emerald-400' : 
                        log.includes('❌') ? 'text-red-400' : 
                        log.includes('🎉') ? 'text-purple-400 font-bold' : 'text-slate-400'
                      }`}>
                        {log}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Manual Method Fallback */}
            <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 space-y-3">
              <h4 className="font-bold text-slate-400 flex items-center gap-2">
                <FolderArchive className="w-4 h-4" />
                الطريقة اليدوية (إذا لم ترغب بوضع التوكن)
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                في حال لم ترغب باستخدام التحديث التلقائي، يمكنك دائماً تحميل الحزمة واستخراجها ورفعها من خلال موقع GitHub مباشرة.
              </p>
              
              <div className="pt-2">
                <button onClick={handleDownloadFullReleaseBundleZip} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-xs px-3 py-2.5 rounded-lg font-bold flex items-center justify-between">
                  <span>تحميل حزمة المستودع (ZIP)</span>
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-6 border-t border-slate-700/50 pt-4">
                <h4 className="font-bold text-blue-400 mb-2 text-xs">طريقة تثبيت المستودع في كودي:</h4>
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-300 leading-relaxed">
                  <li>في Kodi: <strong className="text-white">Settings -&gt; File Manager -&gt; Add source</strong></li>
                  <li>الرابط: <code className="bg-slate-950 px-1.5 py-0.5 rounded text-emerald-400 font-mono" dir="ltr">https://dr-rasheed.github.io/amertv/</code></li>
                  <li>اسم المصدر: <strong className="text-purple-300">AmerTV Repo</strong></li>
                  <li>في <strong className="text-white">Add-ons -&gt; Install from zip file</strong>، اختر المستودع.</li>
                  <li>ثبت ملف <code className="text-emerald-400">repository.amertv...zip</code> ثم ثبت إضافة <code className="text-blue-400">AmerTV Matrix</code> من المستودع!</li>
                </ol>
              </div>
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
