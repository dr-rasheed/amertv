import React, { useState } from 'react';
import { Link2, ExternalLink, Copy, Check, Sparkles, Tv, ShieldCheck } from 'lucide-react';

export const ShortnerHelper: React.FC = () => {
  const [inputUrl, setInputUrl] = useState<string>('');
  const [customAlias, setCustomAlias] = useState<string>('arabm3u');
  const [copiedIsGd, setCopiedIsGd] = useState<boolean>(false);

  const sampleRawUrl = inputUrl || 'https://raw.githubusercontent.com/username/kodi-iptv/main/arabic_channels.m3u';
  const isGdGeneratedUrl = `https://is.gd/${customAlias || 'arabm3u'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(isGdGeneratedUrl);
    setCopiedIsGd(true);
    setTimeout(() => setCopiedIsGd(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Shortener Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/20">
            <Link2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">خدمة تقصير الروابط المخصصة لـ Kodi</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              لأن كتابة العناوين الطويلة بريموت التلفاز أو جهاز Android TV شاقة ومملة، نوصي بتقصير رابط GitHub إلى بضعة أحرف فقط.
            </p>
          </div>
        </div>

        {/* Shortener Interactive Tool */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>محاكي أداة التقصير السريع (Ultra Short Link):</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">رابط GitHub المباشر (Raw URL):</label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="https://raw.githubusercontent.com/..."
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">الاسم القصير المفضل (Short Alias):</label>
              <input
                type="text"
                value={customAlias}
                onChange={(e) => setCustomAlias(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
                placeholder="مثال: arabm3u"
                className="w-full bg-slate-900 text-white font-mono text-xs p-2.5 rounded-xl border border-slate-800 focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Generated Result */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">الرابط القصير المقترح:</span>
              <code className="bg-slate-900 text-amber-300 font-bold font-mono px-3 py-1.5 rounded-lg border border-slate-800 text-sm">
                {isGdGeneratedUrl}
              </code>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {copiedIsGd ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedIsGd ? 'تم نسخ الرابط القصير' : 'نسخ الرابط القصير'}</span>
              </button>

              <a
                href={`https://is.gd/create.php?surl=${encodeURIComponent(sampleRawUrl)}`}
                target="_blank"
                rel="noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح موقع is.gd مباشرة</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Link Shortener Websites */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a
          href="https://is.gd"
          target="_blank"
          rel="noreferrer"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">موقع is.gd (المفضل)</h4>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            يدعم اختيار اسم قصير مخصص، دائم ومجاني 100% ولا ينتهي أبداً ومباشر جداً مع Kodi.
          </p>
        </a>

        <a
          href="https://tinyurl.com"
          target="_blank"
          rel="noreferrer"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">موقع TinyURL</h4>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            موقع عالمي موثوق لإنشاء روابط مخصصة بسهولة وسرعة عالية.
          </p>
        </a>

        <a
          href="https://v.gd"
          target="_blank"
          rel="noreferrer"
          className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 rounded-2xl transition-all group space-y-2"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">موقع v.gd</h4>
            <ExternalLink className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            نسخة آمنة وسريعة متوافقة مع جميع أنظمة IPTV و PVR Simple Client.
          </p>
        </a>
      </div>
    </div>
  );
};
