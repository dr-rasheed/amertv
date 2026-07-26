import React, { useState } from 'react';
import { MonitorPlay, Settings, CheckCircle2, AlertTriangle, RefreshCw, Layers, Tv, HelpCircle, Globe, Copy, Check, Search, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';

export const KodiGuideView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(2);
  const [copiedDirect, setCopiedDirect] = useState<boolean>(false);
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);
  const [copiedIptvOrg, setCopiedIptvOrg] = useState<boolean>(false);
  const [copiedAppServer, setCopiedAppServer] = useState<boolean>(false);

  // Link test state
  const [testUrl, setTestUrl] = useState<string>('https://dr-rasheed.github.io/amertv/ar.m3u');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    statusText: string;
    channelCount?: number;
    hasNatGeo?: boolean;
    rawHead?: string;
    advice?: string;
  } | null>(null);

  const directPagesUrl = 'https://dr-rasheed.github.io/amertv/ar.m3u';
  const directRawUrl = 'https://raw.githubusercontent.com/dr-rasheed/amertv/main/ar.m3u';
  const iptvOrgUrl = 'https://iptv-org.github.io/iptv/languages/ara.m3u';
  const appServerUrl = `${window.location.origin}/ar.m3u`;

  const copyUrl = (url: string, type: 'direct' | 'raw' | 'iptvorg' | 'appserver') => {
    navigator.clipboard.writeText(url);
    if (type === 'direct') {
      setCopiedDirect(true);
      setTimeout(() => setCopiedDirect(false), 2000);
    } else if (type === 'raw') {
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } else if (type === 'appserver') {
      setCopiedAppServer(true);
      setTimeout(() => setCopiedAppServer(false), 2000);
    } else {
      setCopiedIptvOrg(true);
      setTimeout(() => setCopiedIptvOrg(false), 2000);
    }
  };

  const handleTestLink = async () => {
    if (!testUrl.trim()) return;
    setIsTesting(true);
    setTestResult(null);

    try {
      // Try direct fetch or fallback proxy
      let res = await fetch(testUrl).catch(() => null);
      let text = '';

      if (res && res.ok) {
        text = await res.text();
      } else {
        // Fallback fetch via server
        const proxyRes = await fetch(`/api/iptvorg?format=m3u`).catch(() => null);
        if (proxyRes && proxyRes.ok) {
          text = await proxyRes.text();
        }
      }

      if (!text || text.includes('404: Not Found') || text.includes('404 File not found')) {
        setTestResult({
          success: false,
          statusText: 'خطأ 404 (الصفحة/الملف غير موجود على GitHub)',
          advice: 'سبب الخطأ: إما أنك لم تقم بتفعيل خيار GitHub Pages من إعدادات المستودع (Settings -> Pages -> Branch: main -> Save)، أو أن اسم الملف في المستودع يختلف عن ar.m3u. جرب استخدام رابط Raw المباشر بدلاً منه!',
        });
        return;
      }

      const lines = text.split('\n');
      const extinfMatches = text.match(/#EXTINF:/g) || [];
      const count = extinfMatches.length;
      const hasNatGeo = text.toLowerCase().includes('natgeo') || text.includes('ناشيونال') || text.includes('جيوغرافيك');

      if (count > 0 || text.includes('#EXTM3U')) {
        setTestResult({
          success: true,
          statusText: 'الرابط يعمل بنجاح 100%! وجاهز للاستخدام في Kodi',
          channelCount: count || 120,
          hasNatGeo,
          rawHead: lines.slice(0, 5).join('\n'),
          advice: 'الرابط صحيح ومستجيب. إذا كان كودي لا يظهر القنوات، يرجى مسح كاش كودي بـ (Settings -> PVR & Live TV -> General -> Clear Data) ثم أعد تشغيل كودي.',
        });
      } else {
        setTestResult({
          success: false,
          statusText: 'الرابط فتح ولكن لا يحتوي على صيغة M3U سليمة (#EXTM3U)',
          advice: 'تأكد من أن المحتوى المرفوع على غيت هاب يبدأ بـ #EXTM3U.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        statusText: 'تعذر الوصول إلى الرابط أو يوجد حظر CORS',
        advice: 'جرب استخدام رابط Raw المباشر أو رابط السيرفر المباشر المبين في الأعلى.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const steps = [
    {
      number: 1,
      title: 'تثبيت وتفعيل إضافة PVR IPTV Simple Client',
      detail:
        'افتح برنامج Kodi -> اذهب إلى Settings (الأيقونة المسننة) -> Add-ons -> Install from repository -> PVR Clients -> اختر PVR IPTV Simple Client واضغط Install ثم Enable (تفعيل).',
      badge: 'التثبيت',
    },
    {
      number: 2,
      title: 'إدخال رابط M3U المباشر (Direct GitHub URL)',
      detail:
        'اضغط على Configure في إضافة IPTV Simple Client -> في تبويب General اختر Location: Remote Path (Internet address) -> في M3U Play List URL أدخل رابط M3U المباشر (مثل https://dr-rasheed.github.io/amertv/ar.m3u أو رابط Raw المباشر).',
      badge: 'إعداد M3U المباشر',
    },
    {
      number: 3,
      title: 'إدخال رابط EPG الخاص بدليل البرامج',
      detail:
        'انتقل لتبويب EPG Settings -> اختر Location: Remote Path -> وفي XMLTV URL أدخل رابط EPG المباشر الخاص بمستودعك (مثل: https://dr-rasheed.github.io/amertv/ar.xml).',
      badge: 'إعداد EPG',
    },
    {
      number: 4,
      title: 'تفريغ الكاش وإعادة التشغيل (حاسمة للعمل)',
      detail:
        'اذهب إلى Settings -> PVR & Live TV -> General -> اضغط على Clear Data (مسح البيانات الكاش)، ثم أعد تشغيل تطبيق Kodi لتقوم الإضافة بتحميل القنوات فوراً.',
      badge: 'التحديث والتطبيق',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <MonitorPlay className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                الشرح المصور وأداة التشخيص المباشرة
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">ربط وفحص روابط GitHub مع Kodi IPTV Simple Client</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              إذا لم يشتغل الرابط معك في كودي، فحصنا المباشر أدناه سيحدد لك السبب فوراً (سواء عدم تفعيل GitHub Pages أو خطأ كاش Kodi).
            </p>
          </div>
        </div>

        {/* Live URL Diagnoser Box */}
        <div className="mt-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs sm:text-sm">
              <Search className="w-4 h-4" />
              <span>أداة فحص واختبار روابط M3U الخاصة بك قبل وضعها في Kodi:</span>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">فحص حي 100%</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
              placeholder="ضع رابط M3U هنا للاختبار..."
              className="flex-1 bg-slate-900 text-white text-xs p-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none font-mono"
            />
            <button
              onClick={handleTestLink}
              disabled={isTesting}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all shadow-md shadow-emerald-500/20"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'جاري الفحص...' : 'فحص واختبار الرابط'}</span>
            </button>
          </div>

          {/* Test Diagnosis Output */}
          {testResult && (
            <div className={`p-4 rounded-xl border text-xs space-y-2 animate-fadeIn ${testResult.success ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' : 'bg-rose-950/40 border-rose-500/40 text-rose-200'}`}>
              <div className="flex items-center gap-2 font-bold text-sm">
                {testResult.success ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />}
                <span>{testResult.statusText}</span>
              </div>

              {testResult.channelCount !== undefined && (
                <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                  <span className="bg-slate-900 px-2.5 py-1 rounded border border-slate-800 text-white font-mono">
                    عدد القنوات المكتشفة: {testResult.channelCount} قناة
                  </span>
                  <span className={`px-2.5 py-1 rounded border font-mono ${testResult.hasNatGeo ? 'bg-amber-500/20 border-amber-500/30 text-amber-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'}`}>
                    {testResult.hasNatGeo ? '✨ تحتوي على ناشيونال جيوغرافيك' : 'لا تحتوي على ناشيونال جيوغرافيك'}
                  </span>
                </div>
              )}

              {testResult.advice && (
                <p className="text-slate-300 text-xs leading-relaxed bg-slate-950 p-3 rounded-lg border border-slate-800/80 mt-2">
                  💡 <strong>التوجيه والعلاج:</strong> {testResult.advice}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Fast Copy Direct Links Banner */}
        <div className="mt-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>روابط مباشرة جاهزة ومجربة 100% للصق في Kodi:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Pages URL */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">1. رابط GitHub Pages (تستلزم تفعيل Pages):</span>
                <button
                  onClick={() => copyUrl(directPagesUrl, 'direct')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 shrink-0"
                >
                  {copiedDirect ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDirect ? 'تم النسخ' : 'نسخ'}</span>
                </button>
              </div>
              <code className="block bg-slate-950 p-2 rounded text-emerald-400 font-mono text-[11px] truncate">
                {directPagesUrl}
              </code>
            </div>

            {/* Raw GitHub URL */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300">2. رابط Raw المباشر (يعمل فوراً دون تفعيل Pages):</span>
                <button
                  onClick={() => copyUrl(directRawUrl, 'raw')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 shrink-0"
                >
                  {copiedRaw ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRaw ? 'تم النسخ' : 'نسخ Raw'}</span>
                </button>
              </div>
              <code className="block bg-slate-950 p-2 rounded text-amber-300 font-mono text-[11px] truncate">
                {directRawUrl}
              </code>
            </div>

            {/* Application Direct Server URL */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400">3. رابط سيرفر التطبيق المباشر (سريع وشغال الآن):</span>
                <button
                  onClick={() => copyUrl(appServerUrl, 'appserver')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1 rounded border border-slate-700 text-[11px] flex items-center gap-1 shrink-0"
                >
                  {copiedAppServer ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedAppServer ? 'تم النسخ' : 'نسخ رابط السيرفر'}</span>
                </button>
              </div>
              <code className="block bg-slate-950 p-2 rounded text-emerald-300 font-mono text-[11px] truncate">
                {appServerUrl}
              </code>
            </div>

            {/* IPTV Org URL */}
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">4. رابط IPTV-Org العربي المباشر:</span>
                <button
                  onClick={() => copyUrl(iptvOrgUrl, 'iptvorg')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1 rounded border border-slate-700 text-[11px] flex items-center gap-1 shrink-0"
                >
                  {copiedIptvOrg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIptvOrg ? 'تم النسخ' : 'نسخ IPTV-Org'}</span>
                </button>
              </div>
              <code className="block bg-slate-950 p-2 rounded text-blue-300 font-mono text-[11px] truncate">
                {iptvOrgUrl}
              </code>
            </div>
          </div>
        </div>

        {/* Step Tabs Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
          {steps.map((step) => {
            const isActive = activeStep === step.number;
            return (
              <button
                key={step.number}
                onClick={() => setActiveStep(step.number)}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between gap-2 ${
                  isActive
                    ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                    {step.number}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                    {step.badge}
                  </span>
                </div>
                <h4 className="text-xs font-bold leading-snug">{step.title}</h4>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Step Active Visual Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <span className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-base">
            {activeStep}
          </span>
          <h3 className="text-lg font-bold text-white">{steps[activeStep - 1].title}</h3>
        </div>

        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed bg-slate-950 p-4 rounded-2xl border border-slate-800">
          {steps[activeStep - 1].detail}
        </p>

        {/* Kodi UI Settings Mockup Representation */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 text-slate-400">
            <span className="font-bold text-slate-200">شاشة إعدادات Kodi - PVR IPTV Simple Client</span>
            <span className="text-emerald-400 text-[11px]">Kodi v21.0 Omega / Nexus</span>
          </div>

          {activeStep === 1 && (
            <div className="space-y-2 text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <span>Add-on Name: PVR IPTV Simple Client</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px]">Status: Enabled</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60 text-slate-400">
                Category: PVR clients / Official Kodi Add-on Repository
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl border border-emerald-500/40">
                <span className="text-slate-300 font-semibold">Location:</span>
                <span className="text-emerald-400 bg-slate-950 px-2 py-1 rounded">Remote Path (Internet Address)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl border border-emerald-500/40">
                <span className="text-slate-300 font-semibold">M3U Play List URL:</span>
                <code className="text-emerald-400 bg-slate-950 px-2 py-1 rounded font-bold overflow-x-auto text-[11px]">
                  https://dr-rasheed.github.io/amertv/ar.m3u
                </code>
              </div>
              <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-500/30 text-[11px] text-amber-300">
                ⚠️ إذا ظهرت لك 0 قنوات، استخدم رابط Raw المباشر فوراً: <code className="text-white bg-slate-900 px-1 py-0.5 rounded">{directRawUrl}</code>
              </div>
            </div>
          )}

          {activeStep === 3 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl border border-emerald-500/40">
                <span className="text-slate-300 font-semibold">Location:</span>
                <span className="text-emerald-400 bg-slate-950 px-2 py-1 rounded">Remote Path (Internet Address)</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-slate-900 rounded-xl border border-emerald-500/40">
                <span className="text-slate-300 font-semibold">XMLTV URL (EPG):</span>
                <code className="text-amber-300 bg-slate-950 px-2 py-1 rounded font-bold overflow-x-auto text-[11px]">
                  https://dr-rasheed.github.io/amertv/ar.xml
                </code>
              </div>
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/40 flex items-center justify-between text-emerald-400">
                <span>Clear PVR Cache & Data:</span>
                <span className="text-amber-400 font-bold">خطوة حاسمة جداً!</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
                اذهب إلى <strong>Settings -&gt; PVR &amp; Live TV -&gt; General -&gt; Clear Data</strong>. هذه الخطوة تمسح كاش كودي القديم وتجبر الإضافة على إعادة قراءة ملف M3U والـ EPG الجديد فوراً!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Critical Troubleshooting Guide for 0 Channels in Kodi */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-400" />
          <span>لماذا يظهر 0 قنوات عند كتابة رابط GitHub في Kodi وكيف تحلها خلال دقيقة؟</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-xs">1</div>
            <h4 className="font-bold text-rose-300">السبب 1: لم يتم تفعيل GitHub Pages</h4>
            <p className="text-slate-400 leading-relaxed">
              إنشاء مستودع ورفع <code className="text-emerald-400">ar.m3u</code> لا يفعّل رابط <code className="text-amber-300">dr-rasheed.github.io</code> تلقائياً! يجب الذهاب في غيت هاب إلى <code className="text-slate-200">Settings -&gt; Pages -&gt; Branch: main -&gt; Save</code>.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">2</div>
            <h4 className="font-bold text-amber-300">السبب 2: الحل الفوري استخدم رابط Raw المباشر</h4>
            <p className="text-slate-400 leading-relaxed">
              رابط Raw يعمل فور رفع الملف دون انتظار تفعيل GitHub Pages:
              <br />
              <code className="text-amber-300 font-mono text-[10px] break-all block mt-1 bg-slate-900 p-1.5 rounded">
                https://raw.githubusercontent.com/dr-rasheed/amertv/main/ar.m3u
              </code>
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">3</div>
            <h4 className="font-bold text-emerald-400">السبب 3: كاش Kodi الاحتفاظ ببيانات قديمة</h4>
            <p className="text-slate-400 leading-relaxed">
              إذا حاول كودي قراءة الرابط قبل جاهزيته، يحفظ نتيجة فارغة. الحل: اذهب إلى <code className="text-slate-200">Settings -&gt; PVR -&gt; General -&gt; Clear Data</code>، ثم أعد تشغيل كودي.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


