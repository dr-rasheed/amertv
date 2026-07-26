import React, { useState } from 'react';
import { MonitorPlay, Settings, CheckCircle2, AlertTriangle, RefreshCw, Layers, Tv, HelpCircle, Globe, Copy, Check } from 'lucide-react';

export const KodiGuideView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(2);
  const [copiedDirect, setCopiedDirect] = useState<boolean>(false);
  const [copiedIptvOrg, setCopiedIptvOrg] = useState<boolean>(false);

  const directPagesUrl = 'https://dr-rasheed.github.io/amertv/ar.m3u';
  const iptvOrgUrl = 'https://iptv-org.github.io/iptv/languages/ara.m3u';

  const copyUrl = (url: string, type: 'direct' | 'iptvorg') => {
    navigator.clipboard.writeText(url);
    if (type === 'direct') {
      setCopiedDirect(true);
      setTimeout(() => setCopiedDirect(false), 2000);
    } else {
      setCopiedIptvOrg(true);
      setTimeout(() => setCopiedIptvOrg(false), 2000);
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
        'اضغط على Configure في إضافة IPTV Simple Client -> في تبويب General اختر Location: Remote Path (Internet address) -> في M3U Play List URL أدخل رابط GitHub المباشر (مثل: https://dr-rasheed.github.io/amertv/ar.m3u أو https://iptv-org.github.io/iptv/languages/ara.m3u) - تم استخدام اسم ar.m3u القصير جداً لتسهيل الكتابة ببطء بريموت التلفاز.',
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
      title: 'تفعيل التحديث التلقائي بالقنوات والدليل',
      detail:
        'في تبويب Catchup / Auto-refresh فعل خيار Auto Refresh Rate على 12 أو 24 ساعة، واضغط OK ثم قُم بإعادة تشغيل تطبيق Kodi.',
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
                الشرح الرسمي المصور - روابط مباشرة 100%
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">ربط روابط GitHub المباشرة مع إضافة Kodi IPTV Simple Client</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              يمكنك إدخال رابط M3U المباشر فوراً وبشكل مباشر من GitHub أو GitHub Pages بدون أي اختصار روابط أو تعقيد.
            </p>
          </div>
        </div>

        {/* Fast Copy Direct Links Banner */}
        <div className="mt-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <Globe className="w-4 h-4" />
            <span>روابط مباشرة جاهزة للصق المباشر في Kodi:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">رابط مستودعك المباشر (amertv):</span>
                <button
                  onClick={() => copyUrl(directPagesUrl, 'direct')}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-2.5 py-1 rounded text-[11px] flex items-center gap-1 shrink-0"
                >
                  {copiedDirect ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDirect ? 'تم النسخ' : 'نسخ الرابط'}</span>
                </button>
              </div>
              <code className="block bg-slate-950 p-2 rounded text-emerald-400 font-mono text-[11px] truncate">
                {directPagesUrl}
              </code>
            </div>

            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">رابط IPTV-Org العربي المباشر:</span>
                <button
                  onClick={() => copyUrl(iptvOrgUrl, 'iptvorg')}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-2.5 py-1 rounded border border-slate-700 text-[11px] flex items-center gap-1 shrink-0"
                >
                  {copiedIptvOrg ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedIptvOrg ? 'تم النسخ' : 'نسخ الرابط'}</span>
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
              <div className="p-2.5 bg-emerald-950/40 rounded-xl border border-emerald-500/30 text-[11px] text-emerald-300">
                💡 يمكنك أيضاً تجربة رابط iptv-org المباشر: <code className="text-white bg-slate-900 px-1 py-0.5 rounded">https://iptv-org.github.io/iptv/languages/ara.m3u</code>
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
                <span>Auto Refresh M3U & EPG:</span>
                <span>Enabled (Every 12 Hours)</span>
              </div>
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-slate-300">
                بعد الضغط على OK، يرجى إعادة تشغيل كودي (Restart Kodi) لتقوم الإضافة بقراءة قائمة القنوات والدليل فوراً.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Troubleshooting Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>أسئلة شائعة وتوضيحات حول الروابط المباشرة:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-emerald-400">هل أحتاج حتماً لتقصير الرابط؟</h4>
            <p className="text-slate-300 leading-relaxed">
              لا! برنامج Kodi يقرأ رابط GitHub و GitHub Pages المباشر (مثل <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">iptv-org.github.io</code>) مباشرة وبسرعة فائقة. اختصار الروابط هو ميزة اختيارية فقط لتسهيل الكتابة عبر ريموت التلفاز.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300">ما ميزة استخدام GitHub Pages؟</h4>
            <p className="text-slate-400 leading-relaxed">
              يقدم GitHub Pages خدمة استضافة ثابتة ومجانية على شبكة CDN العالمية بـ HTTPS، مما يضمن تحميل القنوات في كودي بسرعة وبدون أي تقطيع.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

