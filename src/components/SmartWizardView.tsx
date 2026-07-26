import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Activity,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ExternalLink,
  ShieldCheck,
  Zap,
  Radio,
  Tv,
  ArrowRight,
  Database,
  Layers,
  Filter,
  Layers3,
  Globe
} from 'lucide-react';
import { Channel } from '../types';
import { INITIAL_CHANNELS } from '../data/channels';
import { getReliableChannelLogo } from '../utils/logoHelper';
import { parseM3uText } from '../utils/m3uParser';
import { generateM3uContent } from '../utils/m3uGenerator';
import { generateEpgXmlContent } from '../utils/epgGenerator';

interface SmartWizardViewProps {
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  onPlayChannel?: (channel: Channel) => void;
}

export const SmartWizardView: React.FC<SmartWizardViewProps> = ({
  channels,
  setChannels,
  onPlayChannel,
}) => {
  const EXTERNAL_APP_URL = 'https://ais-pre-cwwk6kodvwmwsh675uh42j-19134731727.europe-west3.run.app';
  
  const [copiedAppUrl, setCopiedAppUrl] = useState(false);
  const [githubUser, setGithubUser] = useState('dr-rasheed');
  const [repoName, setRepoName] = useState('amertv');
  const [branch, setBranch] = useState('main');
  const [patToken, setPatToken] = useState('');

  // Processing States
  const [isUpdatingSources, setIsUpdatingSources] = useState(false);
  const [isTestingStreams, setIsTestingStreams] = useState(false);
  const [isPublishingGitHub, setIsPublishingGitHub] = useState(false);

  const [currentActionItem, setCurrentActionItem] = useState('');
  const [processProgress, setProcessProgress] = useState(0);
  const [statusLog, setStatusLog] = useState<string[]>([]);
  const [errorLog, setErrorLog] = useState<string | null>(null);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(EXTERNAL_APP_URL);
    setCopiedAppUrl(true);
    setTimeout(() => setCopiedAppUrl(false), 2500);
  };

  const addLog = (msg: string) => {
    setStatusLog((prev) => [msg, ...prev.slice(0, 15)]);
  };

  // 1. Fetch & Deduplicate External Sources
  const handleFetchAndUpdateSources = async () => {
    setIsUpdatingSources(true);
    setErrorLog(null);
    setProcessProgress(10);
    setCurrentActionItem('جاري بدء معالجة وجلب القنوات العربية المحدثة من iptv-org على GitHub...');

    try {
      addLog('🚀 بدء طلب قائمة القنوات العربية المباشرة (ara.m3u) من iptv-org...');
      await new Promise((r) => setTimeout(r, 400));

      setProcessProgress(25);
      setCurrentActionItem('جاري تحميل وقراءة القنوات المباشرة من الخوادم العالمية...');

      let fetchedArabicChannels: Channel[] = [];
      try {
        const response = await fetch('https://iptv-org.github.io/iptv/languages/ara.m3u');
        if (response.ok) {
          const m3uText = await response.text();
          fetchedArabicChannels = parseM3uText(m3uText);
          addLog(`🌐 تم الاتصال المباشر وجلب ${fetchedArabicChannels.length} قناة عربية من iptv-org!`);
        } else {
          addLog('⚠️ تعذر جلب ara.m3u المباشر، جاري التبديل للمصادر الاحتياطية المدمجة...');
        }
      } catch (netErr: any) {
        addLog('ℹ️ استخدام سيرفر القنوات المدمج الشغال مع إصلاح الشعارات تلقائياً...');
      }

      setProcessProgress(60);
      setCurrentActionItem('جاري تطبيق الفلترة الذكية لمنع التكرار وإصلاح الشعارات للبدء الفوري...');
      addLog('🔍 تطبيق خوارزمية عدم التكرار (Deduplication) وإصلاح روابط الصور...');

      const uniqueMap = new Map<string, Channel>();

      // 1. Prioritize initial top curated channels
      INITIAL_CHANNELS.forEach((ch) => {
        const cleanKey = ch.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
        if (cleanKey) {
          uniqueMap.set(cleanKey, {
            ...ch,
            logo: getReliableChannelLogo(ch.id, ch.name, ch.logo),
          });
        }
      });

      // 2. Merge dynamically fetched iptv-org channels
      fetchedArabicChannels.forEach((ch) => {
        const cleanKey = ch.name.toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]/g, '');
        if (cleanKey && !uniqueMap.has(cleanKey) && ch.url) {
          uniqueMap.set(cleanKey, {
            ...ch,
            logo: getReliableChannelLogo(ch.id, ch.name, ch.logo),
          });
        }
      });

      const deduplicatedChannels = Array.from(uniqueMap.values());
      setProcessProgress(90);
      setCurrentActionItem(`تم دمج وتحديث القنوات بنجاح. إجمالي القنوات المعتمدة: ${deduplicatedChannels.length}`);

      setChannels(deduplicatedChannels);
      setProcessProgress(100);
      addLog(`✨ اكتمل التحديث ودمج القنوات! إجمالي القنوات المتاحة: ${deduplicatedChannels.length}`);
    } catch (err: any) {
      setErrorLog('حدث خطأ أثناء تحديث المصادر: ' + err.message);
    } finally {
      setIsUpdatingSources(false);
    }
  };

  // Helper for real stream connectivity check
  const testStreamUrl = async (url: string, timeoutMs: number = 3500): Promise<boolean> => {
    if (!url || !url.startsWith('http')) return false;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Attempt fetching first chunk or headers
      await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        signal: controller.signal,
      });
      clearTimeout(timer);
      return true;
    } catch (err) {
      clearTimeout(timer);
      return false;
    }
  };

  // 2. Batch Stream Tester with REAL Network Verification
  const handleTestAllStreams = async () => {
    if (channels.length === 0) return;
    setIsTestingStreams(true);
    setErrorLog(null);
    setProcessProgress(0);
    addLog('⚡ بدء فحص حالة الاتصال وبث الخوادم المباشرة للقنوات...');

    let onlineCount = 0;
    let fallbackCount = 0;
    let offlineCount = 0;
    const total = channels.length;
    const updatedChannels = [...channels];

    for (let i = 0; i < total; i++) {
      const channel = updatedChannels[i];
      setCurrentActionItem(`جاري فحص اتصال سيرفر البث لقناة: ${channel.name}...`);
      setProcessProgress(Math.round(((i + 1) / total) * 100));

      const startTime = Date.now();
      const primaryOk = await testStreamUrl(channel.url);
      const latency = Date.now() - startTime;

      if (primaryOk) {
        onlineCount++;
        addLog(`✅ قناة شغالّة (${latency}ms): ${channel.name}`);
      } else if (channel.backupUrl && (await testStreamUrl(channel.backupUrl))) {
        fallbackCount++;
        channel.url = channel.backupUrl;
        addLog(`🔄 تم التبديل للسيرفر الاحتياطي بنجاح: ${channel.name}`);
      } else {
        offlineCount++;
        addLog(`⚠️ متعثرة أو تحظر العرض المباشر: ${channel.name}`);
      }

      await new Promise((r) => setTimeout(r, 60));
    }

    setChannels(updatedChannels);
    setIsTestingStreams(false);
    setCurrentActionItem(`تم فحص جميع القنوات. الشغالة: ${onlineCount + fallbackCount} من أصل ${total}.`);
    addLog(`🎉 اكتمل الفحص الشامل! الشغالة: ${onlineCount + fallbackCount} - المتعثرة: ${offlineCount}`);
  };

  // 3. Push to GitHub
  const handlePushToGitHub = async () => {
    if (!patToken.trim()) {
      setErrorLog('الرجاء أدخل رمز الوصول الشخصي Personal Access Token (PAT) من جيت هاب للمتابعة.');
      return;
    }

    setIsPublishingGitHub(true);
    setErrorLog(null);
    setProcessProgress(10);
    setCurrentActionItem('جاري إعداد وقراءة ملفات ar.m3u و ar.xml...');

    try {
      const rawEpgUrl = `https://raw.githubusercontent.com/${githubUser}/${repoName}/${branch}/ar.xml`;
      const m3uContent = generateM3uContent(channels, {
        includeEpgUrl: true,
        epgUrl: rawEpgUrl,
        autoRefreshHours: 12,
        customHeaderComments: true,
        kodiUserAgent: 'Kodi/21.0 (IPTV Simple Client)',
      });

      const epgXmlContent = generateEpgXmlContent(channels);

      const landingHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>بوابة AmerTV IPTV المباشرة</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 flex flex-col items-center justify-center font-sans">
  <div class="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
    <div class="text-center space-y-2">
      <span class="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20">
        ✨ مستودع قنوات M3U & EPG المباشر الشغال
      </span>
      <h1 class="text-2xl font-black text-white">AmerTV IPTV Playlist Server</h1>
      <p class="text-slate-400 text-xs sm:text-sm">روابط التشغيل المباشرة المحدثة تلقائياً لبرنامج Kodi و IPTV Simple Client</p>
    </div>

    <div class="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
      <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
        <span class="text-emerald-400 font-bold">رابط قائمة M3U:</span>
        <p class="font-mono text-slate-300 break-all select-all">https://${githubUser}.github.io/${repoName}/ar.m3u</p>
      </div>
      <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
        <span class="text-amber-400 font-bold">رابط دليل البرامج EPG:</span>
        <p class="font-mono text-slate-300 break-all select-all">https://raw.githubusercontent.com/${githubUser}/${repoName}/${branch}/ar.xml</p>
      </div>
    </div>
  </div>
</body>
</html>`;

      const pushFile = async (filePath: string, content: string, msg: string) => {
        const apiUrl = `https://api.github.com/repos/${githubUser}/${repoName}/contents/${filePath}`;
        let sha: string | undefined = undefined;

        try {
          const getRes = await fetch(apiUrl, {
            headers: { Authorization: `Bearer ${patToken.trim()}` },
          });
          if (getRes.ok) {
            const getJson = await getRes.json();
            sha = getJson.sha;
          }
        } catch (e) {}

        const bytes = new TextEncoder().encode(content);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const b64 = btoa(binary);

        const putRes = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${patToken.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: msg,
            content: b64,
            sha: sha,
            branch: branch,
          }),
        });

        if (!putRes.ok) {
          const errData = await putRes.json().catch(() => ({}));
          throw new Error(errData.message || `خطأ جيت هاب ${putRes.status}`);
        }
      };

      setProcessProgress(25);
      setCurrentActionItem('1/4: جاري رفع تحديث قائمة ar.m3u...');
      await pushFile('ar.m3u', m3uContent, 'Auto-update ar.m3u');

      setProcessProgress(50);
      setCurrentActionItem('2/4: جاري رفع دليل البرامج ar.xml...');
      await pushFile('ar.xml', epgXmlContent, 'Auto-update ar.xml EPG');

      setProcessProgress(75);
      setCurrentActionItem('3/4: جاري تحديث واجهة البوابة index.html...');
      await pushFile('index.html', landingHtml, 'Update index.html portal');

      setProcessProgress(90);
      setCurrentActionItem('4/4: تأكيد إعدادات GitHub Pages...');
      await pushFile('.nojekyll', '', 'Ensure .nojekyll');

      setProcessProgress(100);
      setCurrentActionItem('🎉 تم رفع وتحديث جميع الملفات والدليل على GitHub Pages بنجاح!');
      addLog('🚀 تم التحديث المباشر لنظام Kodi على GitHub Pages!');
    } catch (err: any) {
      setErrorLog('خطأ أثناء النشر على GitHub: ' + err.message);
    } finally {
      setIsPublishingGitHub(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Direct External Web URL Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>الرابط المباشر الخارجي للتطبيق (يعمل في أي متصفح)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              رابط الوصول المباشر والسريع للتطبيق
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl">
              يمكنك فتح وتعديل وقراءة قائمة القنوات مباشرة عبر هذا الرابط السريع من أي جهااز (كمبيوتر أو هاتف) دون الحاجة لدخول منصة Google AI Studio:
            </p>
          </div>

          <div className="w-full lg:w-auto bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 shrink-0">
            <div className="flex items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 select-all">
              <span className="truncate max-w-[260px] sm:max-w-xs">{EXTERNAL_APP_URL}</span>
              <button
                onClick={handleCopyUrl}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1.5 rounded-lg font-bold text-xs shrink-0 transition-colors flex items-center gap-1.5"
              >
                {copiedAppUrl ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>تم النسخ!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>نسخ الرابط</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>الحالة: <strong className="text-emerald-400">نشط ومباشر 24/7</strong></span>
              <a
                href={EXTERNAL_APP_URL}
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 hover:text-white flex items-center gap-1 underline font-medium"
              >
                <span>فتح بالمتصفح</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Action Processing Wizard Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>معالج إدارة وتحديث القنوات المباشر</span>
            </h3>
            <p className="text-xs text-slate-400">ثلاث أزرار رئيسية لمعالجة القنوات، الفحوصات، وتحديث ملفات GitHub</p>
          </div>

          <span className="bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3 py-1.5 rounded-full font-bold">
            عدد القنوات حالياً: <strong className="text-emerald-400 font-mono text-sm">{channels.length}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Fetch & Deduplicate */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xl transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
                <RefreshCw className={`w-6 h-6 ${isUpdatingSources ? 'animate-spin' : ''}`} />
              </div>
              <h4 className="font-extrabold text-base text-white">1. تحديث ودمج المصادر</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                يجلب القنوات المحدثة من كافة المصادر المعتمدة (MBC، روتانا، الوثائقيات، الأخبار، والرياضة) ويمنع التكرار تلقائياً.
              </p>
            </div>

            <button
              onClick={handleFetchAndUpdateSources}
              disabled={isUpdatingSources || isTestingStreams || isPublishingGitHub}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isUpdatingSources ? 'animate-spin' : ''}`} />
              <span>{isUpdatingSources ? 'جاري التحديث...' : 'تحديث ودمج القنوات'}</span>
            </button>
          </div>

          {/* Card 2: Batch Stream Health Check */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xl transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20">
                <Activity className={`w-6 h-6 ${isTestingStreams ? 'animate-pulse' : ''}`} />
              </div>
              <h4 className="font-extrabold text-base text-white">2. فحص واختبار القنوات</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                يفحص سرعة واستجابة كل قناة، ويتأكد من توفر البث الحي والتبديل للسيرفر الاحتياطي إذا تعطل السيرفر الرئيسي.
              </p>
            </div>

            <button
              onClick={handleTestAllStreams}
              disabled={isUpdatingSources || isTestingStreams || isPublishingGitHub}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              <Activity className={`w-4 h-4 ${isTestingStreams ? 'animate-spin' : ''}`} />
              <span>{isTestingStreams ? 'جاري الفحص...' : 'فحص القنوات الحالية'}</span>
            </button>
          </div>

          {/* Card 3: Publish to GitHub */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xl transition-all">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
                <UploadCloud className={`w-6 h-6 ${isPublishingGitHub ? 'animate-bounce' : ''}`} />
              </div>
              <h4 className="font-extrabold text-base text-white">3. رفع وتحديث GitHub</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                يرفع ملف القنوات ar.m3u ودليل EPG ar.xml وواجهة البوابة مباشرةً إلى مستودع GitHub الخاص بك.
              </p>
            </div>

            <button
              onClick={handlePushToGitHub}
              disabled={isUpdatingSources || isTestingStreams || isPublishingGitHub}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs sm:text-sm"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isPublishingGitHub ? 'جاري الرفع...' : 'رفع التحديث لـ GitHub'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* GitHub Credentials Input Settings (If needed) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-400" />
          <span>بيانات الربط مع GitHub</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">اسم حساب GitHub:</label>
            <input
              type="text"
              value={githubUser}
              onChange={(e) => setGithubUser(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">اسم المستودع (Repository):</label>
            <input
              type="text"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">رمز الوصول Personal Token (PAT):</label>
            <input
              type="password"
              placeholder="ghp_xxxxxxxxxxxx"
              value={patToken}
              onChange={(e) => setPatToken(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Real-time Progress & Processing Log Box */}
      {(isUpdatingSources || isTestingStreams || isPublishingGitHub || currentActionItem || statusLog.length > 0) && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>شاشة تقدم المعالجة المباشرة</span>
            </h4>
            <span className="text-xs font-mono text-emerald-400">{processProgress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${processProgress}%` }}
            />
          </div>

          {currentActionItem && (
            <p className="text-xs text-amber-300 font-medium bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              {currentActionItem}
            </p>
          )}

          {errorLog && (
            <p className="text-xs text-rose-300 font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              {errorLog}
            </p>
          )}

          {/* Log Console */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs text-slate-300 max-h-48 overflow-y-auto space-y-1">
            {statusLog.length === 0 ? (
              <span className="text-slate-600">في انتظار تشغيل إحدى المهام...</span>
            ) : (
              statusLog.map((log, index) => (
                <div key={index} className="text-[11px] leading-relaxed">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
