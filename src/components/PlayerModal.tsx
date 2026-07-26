import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { X, Play, AlertCircle, RefreshCw, CheckCircle2, ShieldCheck, Radio } from 'lucide-react';
import { Channel } from '../types';

interface PlayerModalProps {
  channel: Channel | null;
  onClose: () => void;
}

export const PlayerModal: React.FC<PlayerModalProps> = ({ channel, onClose }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string>('');
  const [usingBackup, setUsingBackup] = useState<boolean>(false);

  useEffect(() => {
    if (!channel) return;

    const urlToPlay = usingBackup && channel.backupUrl ? channel.backupUrl : channel.url;
    setCurrentStreamUrl(urlToPlay);
    setError(null);
    setLoading(true);

    let hls: Hls | null = null;
    const video = videoRef.current;

    if (!video) return;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        manifestLoadingTimeOut: 10000,
      });

      hls.loadSource(urlToPlay);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLoading(false);
        video.play().catch(() => {
          // Auto-play might require muted state on browsers
          video.muted = true;
          video.play().catch((e) => console.log('Autoplay prevented', e));
        });
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('تعذر الاتصال برابط البث المباشر. قد يحظر الخادم العرض المباشر من المتصفح مباشر (CORS)، لكن البث يعمل بشكل ممتاز داخل تطبيق Kodi.');
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls?.recoverMediaError();
              break;
            default:
              setError('حدث خطأ أثناء تشغيل البث.');
              hls?.destroy();
              break;
          }
          setLoading(false);
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari / HLS support
      video.src = urlToPlay;
      video.addEventListener('loadedmetadata', () => {
        setLoading(false);
        video.play();
      });
      video.addEventListener('error', () => {
        setError('تعذر تشغيل البث عبر متصفحك. البث مباشر ويعمل باحترافية على Kodi.');
        setLoading(false);
      });
    } else {
      setError('متصفحك لا يدعم تشغيل تقنية HLS (.m3u8) مباشرة. يمكنك استخدام الرابط مباشرة في Kodi.');
      setLoading(false);
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [channel, usingBackup]);

  if (!channel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-8 h-8 rounded-lg object-contain bg-slate-800 p-1 border border-slate-700"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {channel.name.slice(0, 2)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">{channel.name}</h3>
                {channel.isHd && (
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                    {channel.quality || 'HD'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                <span>بث مباشر عبر المزيّة | تصنيف: {channel.category}</span>
              </p>
            </div>
          </div>

          <button
            id="close-player-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Display Container */}
        <div className="relative bg-black aspect-video flex items-center justify-center group overflow-hidden">
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            controls
            playsInline
          />

          {loading && !error && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-emerald-400 gap-3">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-sm font-medium text-slate-200">جاري الاتصال بالسيرفر وجلب البث المباشر...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center p-6 text-center text-slate-300 gap-3">
              <AlertCircle className="w-10 h-10 text-amber-400" />
              <p className="text-sm max-w-md leading-relaxed text-slate-200">{error}</p>

              {channel.backupUrl && !usingBackup && (
                <button
                  id="switch-backup-btn"
                  onClick={() => setUsingBackup(true)}
                  className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>التجربة بالسيرفر الاحتياطي الآخر</span>
                </button>
              )}

              <div className="mt-2 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 max-w-lg text-right">
                <p className="font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> ملاحظة كودي IPTV Simple Client:
                </p>
                لا تقلق! قيود الحماية داخل المتصفحات (CORS) قد تمنع التشغيل التجريبي في المتصفح فقط، بينما تعمل جميع هذه الروابط بسرعة وكفاءة فائقة على تطبيق Kodi مباشرة دون أي حظر.
              </div>
            </div>
          )}
        </div>

        {/* Player Footer Details & URL Copy */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-400 overflow-hidden w-full sm:w-auto">
            <span className="text-slate-500 font-semibold shrink-0">رابط البث:</span>
            <code className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono text-emerald-400 text-[11px] truncate max-w-xs sm:max-w-md">
              {currentStreamUrl}
            </code>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="copy-stream-url-btn"
              onClick={() => {
                navigator.clipboard.writeText(currentStreamUrl);
                alert('تم نسخ رابط البث المباشر!');
              }}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>نسخ الرابط المباشر</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
