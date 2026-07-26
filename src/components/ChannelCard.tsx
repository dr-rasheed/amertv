import React, { useState } from 'react';
import { Play, Copy, Check, Star, Radio, ShieldAlert } from 'lucide-react';
import { Channel } from '../types';

interface ChannelCardProps {
  channel: Channel;
  onPlay: (channel: Channel) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({
  channel,
  onPlay,
  isFavorite = false,
  onToggleFavorite,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);

  const handleCopyExtinf = (e: React.MouseEvent) => {
    e.stopPropagation();
    const extinf = `#EXTINF:-1 tvg-id="${channel.tvgId}" tvg-name="${channel.tvgName}" tvg-logo="${channel.logo}" group-title="${channel.category}",${channel.name}\n${channel.url}`;
    navigator.clipboard.writeText(extinf);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isNatGeo = channel.id === 'natgeo-abudhabi';

  return (
    <div
      className={`group relative bg-slate-900 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
        isNatGeo
          ? 'border-amber-500/50 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20 shadow-lg shadow-amber-500/10'
          : 'border-slate-800 hover:border-slate-700'
      } p-4 flex flex-col justify-between`}
    >
      {/* Top badges & Favorite */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              isNatGeo
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700/60'
            }`}
          >
            {channel.category}
          </span>

          <div className="flex items-center gap-1.5">
            {channel.isHd && (
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/20">
                {channel.quality || 'HD'}
              </span>
            )}
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(channel.id);
                }}
                className="p-1 text-slate-500 hover:text-amber-400 transition-colors"
                title="إضافة للمفضلة"
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Channel Icon & Name */}
        <div className="flex items-center gap-3.5 mb-3">
          <div className="relative w-12 h-12 rounded-xl bg-slate-950 p-1.5 border border-slate-800 flex items-center justify-center shrink-0 group-hover:border-slate-700 transition-colors overflow-hidden">
            <img
              src={channel.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=10b981&color=020617&size=64`}
              alt={channel.name}
              className="w-full h-full object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.name)}&background=0f766e&color=fff&size=64`;
              }}
            />
          </div>

          <div className="overflow-hidden">
            <h3 className="font-bold text-slate-100 text-sm group-hover:text-emerald-400 transition-colors truncate flex items-center gap-1.5">
              <span>{channel.name}</span>
              {isNatGeo && <span className="text-amber-400 font-extrabold text-xs">★ مميزة</span>}
            </h3>
            <p className="text-xs text-slate-400 font-mono text-[11px] truncate">
              ID: {channel.tvgId}
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2 mt-2">
        <button
          id={`play-btn-${channel.id}`}
          onClick={() => onPlay(channel)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
            isNatGeo
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold shadow-sm'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>اختبار البث</span>
        </button>

        <button
          id={`copy-extinf-${channel.id}`}
          onClick={handleCopyExtinf}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-colors"
          title="نسخ سطر القناة لملف M3U"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
