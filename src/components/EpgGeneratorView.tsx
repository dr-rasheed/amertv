import React, { useState } from 'react';
import { Calendar, Download, Copy, Check, Clock, Radio, Tv } from 'lucide-react';
import { Channel } from '../types';
import { generateEpgXmlContent } from '../utils/epgGenerator';

interface EpgGeneratorViewProps {
  channels: Channel[];
}

export const EpgGeneratorView: React.FC<EpgGeneratorViewProps> = ({ channels }) => {
  const [daysAhead, setDaysAhead] = useState<number>(3);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'xml'>('preview');

  const epgXmlContent = generateEpgXmlContent(channels, daysAhead);

  const handleCopyEpg = () => {
    navigator.clipboard.writeText(epgXmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEpg = () => {
    const blob = new Blob([epgXmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ar.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* EPG Intro Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/20">
                بروتوكول XMLTV القياسي
              </span>
              <span className="text-slate-400 text-xs">تغطية {daysAhead} أيام قادمة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">الدليل الإلكتروني للبرامج EPG</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              ملف XML متوافق بنسبة 100% مع إضافة Kodi IPTV Simple Client لعرض مواعيد البرامج والأسماء والأوصاف مباشرة.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="download-epg-xml-btn"
              onClick={handleDownloadEpg}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف (ar.xml)</span>
            </button>

            <button
              id="copy-epg-xml-btn"
              onClick={handleCopyEpg}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>نسخ كود XML</span>
            </button>
          </div>
        </div>

        {/* View mode Switcher */}
        <div className="pt-6 flex items-center justify-between">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'preview' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              معاينة الجدول الزمني للبرامج
            </button>
            <button
              onClick={() => setActiveTab('xml')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activeTab === 'xml' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              عرض كود XMLTV الخام
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>مدة الدليل:</span>
            <select
              value={daysAhead}
              onChange={(e) => setDaysAhead(Number(e.target.value))}
              className="bg-slate-950 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none"
            >
              <option value={1}>يوم واحد</option>
              <option value={3}>3 أيام (موصى به)</option>
              <option value={7}>7 أيام</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {activeTab === 'preview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {channels.slice(0, 6).map((ch) => (
            <div key={ch.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
                {ch.logo && (
                  <img src={ch.logo} alt={ch.name} className="w-8 h-8 object-contain bg-slate-950 p-1 rounded-lg border border-slate-800" />
                )}
                <div>
                  <h3 className="font-bold text-white text-sm">{ch.name}</h3>
                  <span className="text-[11px] text-slate-400 font-mono">tvg-id: {ch.tvgId}</span>
                </div>
              </div>

              {/* Sample Program Timeline */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800/60 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-200">الآن: تحقيقات الكوارث الجوية</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">استكشاف الأسباب الدقيقة وراء الحوادث الجوية الأكثر تعقيداً.</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/50 rounded-xl border border-slate-800/40 flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-400">التالي: أسرار المحيطات والكون</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">جولة استكشافية فريدة في أعماق البحار والمحيطات.</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 overflow-x-auto">
            <pre className="font-mono text-xs text-amber-300 leading-relaxed whitespace-pre font-medium max-h-[500px] overflow-y-auto">
              {epgXmlContent}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
