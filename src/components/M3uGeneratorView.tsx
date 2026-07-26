import React, { useState } from 'react';
import { Download, Copy, Check, Settings, RefreshCw, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { Channel, M3uOptions } from '../types';
import { generateM3uContent } from '../utils/m3uGenerator';

interface M3uGeneratorViewProps {
  channels: Channel[];
}

export const M3uGeneratorView: React.FC<M3uGeneratorViewProps> = ({ channels }) => {
  const [options, setOptions] = useState<M3uOptions>({
    includeEpgUrl: true,
    epgUrl: 'https://dr-rasheed.github.io/amertv/ar.xml',
    autoRefreshHours: 12,
    customHeaderComments: true,
    kodiUserAgent: 'Kodi/21.0 (IPTV Simple Client)',
  });

  const [copied, setCopied] = useState<boolean>(false);

  const m3uContent = generateM3uContent(channels, options);

  const handleCopyM3u = () => {
    navigator.clipboard.writeText(m3uContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadM3u = () => {
    const blob = new Blob([m3uContent], { type: 'audio/x-mpegurl;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ar.m3u';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title & Description */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                مجهزة لـ IPTV Simple Client
              </span>
              <span className="text-slate-400 text-xs">{channels.length} قناة جاهزة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">تخصيص وتنزيل ملف M3U العربي</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              يحتوي الملف على جميع القنوات المنظمة مع خيار التحديث التلقائي والدليل الإلكتروني EPG.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="download-m3u-file-btn"
              onClick={handleDownloadM3u}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف (ar.m3u)</span>
            </button>

            <button
              id="copy-m3u-content-btn"
              onClick={handleCopyM3u}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'تم النسخ!' : 'نسخ الكود بالكامل'}</span>
            </button>
          </div>
        </div>

        {/* Options Customizer Box */}
        <div className="pt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* EPG URL */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="block text-slate-300 font-semibold flex items-center justify-between">
              <span>رابط ملف EPG المرتبط مباشرة داخل M3U:</span>
              <span className="text-emerald-400 text-[11px]">خاصية x-tvg-url للتحديث التلقائي</span>
            </label>
            <input
              type="text"
              value={options.epgUrl}
              onChange={(e) => setOptions({ ...options, epgUrl: e.target.value })}
              placeholder="https://raw.githubusercontent.com/USERNAME/REPO/main/epg.xml"
              className="w-full bg-slate-950 text-emerald-400 font-mono text-xs p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Auto Refresh Hours */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-semibold">معدل التحديث التلقائي (بالساعات):</label>
            <select
              value={options.autoRefreshHours}
              onChange={(e) => setOptions({ ...options, autoRefreshHours: Number(e.target.value) })}
              className="w-full bg-slate-950 text-slate-200 text-xs p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
            >
              <option value={1}>كل ساعة واحد (3600s)</option>
              <option value={6}>كل 6 ساعات</option>
              <option value={12}>كل 12 ساعة (موصى به)</option>
              <option value={24}>كل 24 ساعة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Code Preview Box */}
      <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="bg-slate-900/90 px-6 py-3 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>معاينة محتوى ملف: ar.m3u</span>
          </div>
          <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
            {m3uContent.split('\n').length} خط في الملف
          </span>
        </div>

        <div className="p-6 overflow-x-auto">
          <pre className="font-mono text-xs text-emerald-300 leading-relaxed whitespace-pre font-medium">
            {m3uContent}
          </pre>
        </div>
      </div>
    </div>
  );
};
