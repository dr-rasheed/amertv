import React, { useState } from 'react';
import { MonitorPlay, Settings, CheckCircle2, AlertTriangle, RefreshCw, Layers, Tv, HelpCircle } from 'lucide-react';

export const KodiGuideView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

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
      title: 'إدخال رابط M3U القصير',
      detail:
        'اضغط على Configure في إضافة IPTV Simple Client -> في تبويب General اختر Location: Remote Path (Internet address) -> في M3U Play List URL أدخل الرابط القصير الخاص بك (مثلاً: https://is.gd/arabm3u).',
      badge: 'إعداد M3U',
    },
    {
      number: 3,
      title: 'إدخال رابط EPG الخاص بدليل البرامج',
      detail:
        'انتقل لتبويب EPG Settings -> اختر Location: Remote Path -> وفي XMLTV URL أدخل رابط EPG القصير (مثلاً: https://is.gd/arabepg).',
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
                الشرح الرسمي المصور
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">كيفية ربط القائمة والدليل بشرائح Kodi IPTV Simple Client</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              اتبع هذه الخطوات الأربع البسيطة لربط الرابط القصير لملف M3U و EPG ببرنامج كودي لتصفح القنوات مباشرة.
            </p>
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
                <code className="text-amber-300 bg-slate-950 px-2 py-1 rounded font-bold">https://is.gd/arabm3u</code>
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
                <code className="text-amber-300 bg-slate-950 px-2 py-1 rounded font-bold">https://is.gd/arabepg</code>
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
          <span>حلول المشاكل الشائعة في Kodi:</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300">1. عدم ظهور القنوات في القائمة الرئيسية؟</h4>
            <p className="text-slate-400 leading-relaxed">
              تأكد من اختيار <strong>Remote Path</strong> بدلاً من Local Path في إعدادات الإضافة، وتأكد من أن الرابط القصير مكتوب بدقة وبدون مسافات.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-amber-300">2. فارق التوقيت في دليل البرامج EPG؟</h4>
            <p className="text-slate-400 leading-relaxed">
              من إعدادات EPG في الإضافة، يمكنك ضبط خيار <strong>EPG Time Shift</strong> بزيادة أو إنقاص ساعات حسب مدينتك ليتطابق توقيت البرامج.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
