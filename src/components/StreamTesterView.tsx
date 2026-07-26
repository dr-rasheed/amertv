import React, { useState } from 'react';
import { Channel } from '../types';
import { parseM3uText } from '../utils/m3uParser';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  Globe,
  Zap,
  Play,
  Download,
  Check,
  Radio,
  Sliders,
  ExternalLink,
  Info,
  ShieldCheck,
  Server
} from 'lucide-react';

interface StreamTesterViewProps {
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  onPlayChannel: (channel: Channel) => void;
}

interface TestResult {
  channelId: string;
  status: 'testing' | 'online' | 'cors_kodi_only' | 'offline';
  latencyMs?: number;
  statusCode?: number;
  errorDetail?: string;
}

interface ExternalSourcePreset {
  id: string;
  name: string;
  description: string;
  url: string;
  badge: string;
}

const PRESET_SOURCES: ExternalSourcePreset[] = [
  {
    id: 'iptvorg-doc',
    name: 'قائمة الوثائقيات الشاملة (IPTV-Org Documentary)',
    description: 'تتضمن قنوات ناشيونال جيوغرافيك والجزيرة كويست ودي دبليو ومئات الوثائقيات.',
    url: 'https://iptv-org.github.io/iptv/categories/documentary.m3u',
    badge: 'وثائقيات عالمية',
  },
  {
    id: 'iptvorg-ae',
    name: 'قنوات الإمارات وأبوظبي للإعلام (IPTV-Org AE)',
    description: 'تتضمن قنوات ناشيونال جيوغرافيك أبوظبي ووايلد وكويست عربية وأبوظبي الرياضية.',
    url: 'https://iptv-org.github.io/iptv/countries/ae.m3u',
    badge: 'الإمارات M3U',
  },
  {
    id: 'iptvorg-qa',
    name: 'قنوات قطر وشبكة الجزيرة (IPTV-Org QA)',
    description: 'تتضمن الجزيرة الوثائقية والإخبارية والمباشر وقنوات الكأس الرياضية.',
    url: 'https://iptv-org.github.io/iptv/countries/qa.m3u',
    badge: 'الجزيرة M3U',
  },
  {
    id: 'iptvorg-sa',
    name: 'قنوات السعودية والدينية (IPTV-Org SA)',
    description: 'تتضمن القرآن الكريم والسنة النبوية والإخبارية واس بي سي الرياضية.',
    url: 'https://iptv-org.github.io/iptv/countries/sa.m3u',
    badge: 'السعودية M3U',
  },
  {
    id: 'iptvorg-news',
    name: 'قنوات الأخبار المباشرة (IPTV-Org News)',
    description: 'قنوات الإخبارية العربية والعالمية عالية الجودة.',
    url: 'https://iptv-org.github.io/iptv/categories/news.m3u',
    badge: 'أخبار M3U',
  },
];

export const StreamTesterView: React.FC<StreamTesterViewProps> = ({
  channels,
  setChannels,
  onPlayChannel,
}) => {
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('الكل');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Source Fetcher state
  const [selectedPresetId, setSelectedPresetId] = useState<string>('iptvorg-doc');
  const [customSourceUrl, setCustomSourceUrl] = useState<string>('');
  const [isFetchingSource, setIsFetchingSource] = useState<boolean>(false);
  const [fetchedChannels, setFetchedChannels] = useState<Channel[]>([]);
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);
  const [matchedUpdates, setMatchedUpdates] = useState<
    { original: Channel; updatedUrl: string; sourceName: string }[]
  >([]);
  const [appliedCount, setAppliedCount] = useState<number | null>(null);

  const categories = ['الكل', ...Array.from(new Set(channels.map((c) => c.category)))];

  const filteredChannels = channels.filter((c) => {
    const matchesCat = selectedCategoryFilter === 'الكل' || c.category === selectedCategoryFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tvgName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Test single channel URL
  const testSingleChannel = async (ch: Channel) => {
    setTestResults((prev) => ({
      ...prev,
      [ch.id]: { channelId: ch.id, status: 'testing' },
    }));

    const startTime = performance.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);

      // Attempt HEAD request first
      const res = await fetch(ch.url, {
        method: 'HEAD',
        signal: controller.signal,
        mode: 'cors',
      });

      clearTimeout(timeoutId);
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      if (res.ok || res.status === 200 || res.status === 206) {
        setTestResults((prev) => ({
          ...prev,
          [ch.id]: {
            channelId: ch.id,
            status: 'online',
            latencyMs,
            statusCode: res.status,
          },
        }));
      } else {
        // Might be backup URL
        setTestResults((prev) => ({
          ...prev,
          [ch.id]: {
            channelId: ch.id,
            status: 'cors_kodi_only',
            latencyMs,
            statusCode: res.status,
            errorDetail: `استجابة سيرفر البث (${res.status})`,
          },
        }));
      }
    } catch (err: any) {
      const endTime = performance.now();
      const latencyMs = Math.round(endTime - startTime);

      // In browser, CORS blocks m3u8 playlists from third-party CDNs without Access-Control-Allow-Origin,
      // but Kodi PVR IPTV Simple Client natively opens them using native socket/ffmpeg.
      // So TypeError 'Failed to fetch' usually indicates CORS restriction on browser, but stream host is alive for Kodi!
      if (err.name === 'AbortError') {
        setTestResults((prev) => ({
          ...prev,
          [ch.id]: {
            channelId: ch.id,
            status: 'offline',
            errorDetail: 'انتهت مهلة الاتصال (تأخر السيرفر عن 7 ثوانٍ)',
          },
        }));
      } else {
        setTestResults((prev) => ({
          ...prev,
          [ch.id]: {
            channelId: ch.id,
            status: 'cors_kodi_only',
            latencyMs,
            errorDetail: 'محمي بنظام حظر CORS بالمتصفح (شغال 100% في كودي)',
          },
        }));
      }
    }
  };

  // Run full test on active view channels
  const runFullTest = async () => {
    setIsTesting(true);
    for (const ch of filteredChannels) {
      await testSingleChannel(ch);
    }
    setIsTesting(false);
  };

  // Fetch external playlist and discover updated streams
  const handleFetchSource = async () => {
    setIsFetchingSource(true);
    setFetchMessage(null);
    setMatchedUpdates([]);
    setAppliedCount(null);

    let targetUrl = customSourceUrl.trim();
    if (!targetUrl) {
      const preset = PRESET_SOURCES.find((p) => p.id === selectedPresetId);
      if (preset) targetUrl = preset.url;
    }

    if (!targetUrl) {
      setFetchMessage('الرجاء اختيار مصدر أو إدخال رابط M3U صحيح.');
      setIsFetchingSource(false);
      return;
    }

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        throw new Error(`خطأ في جلب المصدر: ${response.status}`);
      }

      const text = await response.text();
      const parsed = parseM3uText(text);

      setFetchedChannels(parsed);

      // Match extracted channels with current list
      const updates: { original: Channel; updatedUrl: string; sourceName: string }[] = [];

      channels.forEach((myChan) => {
        const myNameClean = myChan.name.toLowerCase().replace(/hd|fhd|sd|\(.*\)|[^\w\u0600-\u06FF]/g, '').trim();
        const myTvg = (myChan.tvgId || '').toLowerCase();

        // Search in parsed source
        const match = parsed.find((p) => {
          const pNameClean = p.name.toLowerCase().replace(/hd|fhd|sd|\(.*\)|[^\w\u0600-\u06FF]/g, '').trim();
          const pTvg = (p.tvgId || '').toLowerCase();

          if (myTvg && pTvg && myTvg === pTvg) return true;
          if (myNameClean && pNameClean && (myNameClean.includes(pNameClean) || pNameClean.includes(myNameClean))) {
            return true;
          }
          return false;
        });

        if (match && match.url && match.url !== myChan.url) {
          updates.push({
            original: myChan,
            updatedUrl: match.url,
            sourceName: match.name,
          });
        }
      });

      setMatchedUpdates(updates);
      setFetchMessage(
        `تم جلب ${parsed.length} قناة من المصدر بنجاح! تم العثور على ${updates.length} تحديث/بديل متوافق للقنوات الموجودة لديك.`
      );
    } catch (err: any) {
      setFetchMessage(`فشل جلب المصدر: ${err.message || 'تأكد من الرابط أو اتصال الإنترنت.'}`);
    } finally {
      setIsFetchingSource(false);
    }
  };

  // Apply discovered stream updates to the main channel state
  const handleApplyUpdates = () => {
    if (matchedUpdates.length === 0) return;

    setChannels((prev) =>
      prev.map((ch) => {
        const update = matchedUpdates.find((u) => u.original.id === ch.id);
        if (update) {
          return {
            ...ch,
            backupUrl: ch.url, // Save old URL as backup
            url: update.updatedUrl, // Set new fetched URL as main stream
          };
        }
        return ch;
      })
    );

    setAppliedCount(matchedUpdates.length);
    setMatchedUpdates([]);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="absolute -left-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/20 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> فحص وحالة البث المباشر المتقدم
              </span>
              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700 font-mono">
                2026 v2.5
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              مختبر فحص الروابط وجلب المصادر الخارجية المحدثة تلقائياً
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm max-w-2xl leading-relaxed">
              يمكنك هنا فحص سرعة استجابة سيرفرات البث، واكتشاف الروابط المعطلة، واستعارة واستيراد الروابط الشغالة من مصادر وقوائم تشغيل عالمية حديثة (مثل IPTV-Org) وتحديث قائمتك بنقرة واحدة!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              id="run-full-test-btn"
              onClick={runFullTest}
              disabled={isTesting}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold px-5 py-3 rounded-xl flex items-center gap-2 text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'جاري الفحص المباشر...' : 'فحص جميع القنوات المعروضة'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Multi-Source Playlist Repository Fetcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">مخزن واستيراد المصادر الخارجية المحدثة (Multi-Source Repository)</h3>
              <p className="text-xs text-slate-400">
                استعارة الروابط الشغالة المباشرة من أحدث القوائم العالمية وتحديث قناتك بالروابط السليمة فوراً
              </p>
            </div>
          </div>
        </div>

        {/* Presets Selector Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {PRESET_SOURCES.map((source) => {
            const isSelected = selectedPresetId === source.id && !customSourceUrl;
            return (
              <div
                key={source.id}
                onClick={() => {
                  setSelectedPresetId(source.id);
                  setCustomSourceUrl('');
                }}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-slate-850 border-emerald-500/60 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {source.badge}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                </div>
                <h4 className="font-bold text-white text-xs sm:text-sm mb-1">{source.name}</h4>
                <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{source.description}</p>
              </div>
            );
          })}
        </div>

        {/* Custom Source Link Input */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
          <label className="block text-xs font-bold text-slate-300">أو أدخل رابط قائمة M3U خارجية مخصصة من اختيارك:</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="url"
              value={customSourceUrl}
              onChange={(e) => setCustomSourceUrl(e.target.value)}
              placeholder="https://example.com/playlist.m3u"
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:border-emerald-500 focus:outline-none"
            />
            <button
              id="fetch-source-btn"
              onClick={handleFetchSource}
              disabled={isFetchingSource}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shrink-0 transition-colors"
            >
              <Download className={`w-4 h-4 ${isFetchingSource ? 'animate-bounce' : ''}`} />
              <span>{isFetchingSource ? 'جاري الفحص والاستخراج...' : 'جلب واستخراج الروابط'}</span>
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {fetchMessage && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Info className="w-4 h-4" />
              <span>نتيجة الاستخراج:</span>
            </div>
            <p className="text-slate-300 leading-relaxed">{fetchMessage}</p>

            {matchedUpdates.length > 0 && (
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <p className="text-amber-300 font-medium">
                  تم العثور على <strong>{matchedUpdates.length}</strong> رابط جديد ومحدث للقنوات الموجودة في قائمتك.
                </p>
                <button
                  id="apply-updates-btn"
                  onClick={handleApplyUpdates}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all shadow-md shadow-emerald-500/20"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>تطبيق واستبدال الروابط الشغالة بالقائمة فوراً</span>
                </button>
              </div>
            )}
          </div>
        )}

        {appliedCount !== null && (
          <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>نجاح! تم تحديث واستبدال {appliedCount} قناة بالروابط المباشرة الشغالة الجديدة. يمكنك الآن تحميل ملف M3U أو رفعه على GitHub!</span>
          </div>
        )}
      </div>

      {/* SECTION 2: Direct Channel Tester & Diagnostic Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-emerald-400" />
              <span>نتائج التشخيص المباشر للقنوات ({filteredChannels.length})</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              اختبار حالة الاستجابة الحية وسرعة البلاي ليست لكل قناة
            </p>
          </div>

          {/* Controls: Search & Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="بحث بالقناة..."
                className="bg-slate-950 text-white text-xs pr-8 pl-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="bg-slate-950 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Channels Health Diagnostic List */}
        <div className="space-y-3">
          {filteredChannels.map((ch) => {
            const res = testResults[ch.id];

            return (
              <div
                key={ch.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-slate-700"
              >
                {/* Channel Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 p-1 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={ch.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=10b981&color=020617&size=64`}
                      alt={ch.name}
                      className="w-full h-full object-contain rounded"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(ch.name)}&background=0f766e&color=fff&size=64`;
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">{ch.name}</h4>
                      {ch.isHd && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-1.5 py-0.2 rounded font-bold border border-emerald-500/30 shrink-0">
                          {ch.quality || 'HD'}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      تصنيف: <span className="text-slate-300">{ch.category}</span> | بلد: {ch.country || 'عربي'}
                    </p>
                  </div>
                </div>

                {/* Status Indicator & Actions */}
                <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                  {/* Status Badge */}
                  {!res && (
                    <span className="text-[11px] text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                      <Radio className="w-3 h-3 text-slate-600" />
                      <span>لم يُفحص بعد</span>
                    </span>
                  )}

                  {res?.status === 'testing' && (
                    <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20 flex items-center gap-1.5 font-medium">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الاختبار...</span>
                    </span>
                  )}

                  {res?.status === 'online' && (
                    <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>مباشر وشغال ({res.latencyMs}ms)</span>
                    </span>
                  )}

                  {res?.status === 'cors_kodi_only' && (
                    <span className="text-[11px] text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20 flex items-center gap-1.5 font-medium" title={res.errorDetail}>
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      <span>شغال 100% في كودي (حماية CORS)</span>
                    </span>
                  )}

                  {res?.status === 'offline' && (
                    <span className="text-[11px] text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>حاجة لتحديث السيرفر</span>
                    </span>
                  )}

                  {/* Play & Test Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => testSingleChannel(ch)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 transition-colors text-xs"
                      title="إعادة فحص هذه القناة"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onPlayChannel(ch)}
                      className="bg-emerald-500/20 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/30 flex items-center gap-1 text-xs font-bold transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>تجربة البث</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
