import { Channel, M3uOptions } from '../types';

export function generateM3uContent(channels: Channel[], options: M3uOptions): string {
  const lines: string[] = [];

  // M3U Header
  let header = `#EXTM3U refresh="${options.autoRefreshHours * 3600}"`;
  if (options.includeEpgUrl && options.epgUrl.trim()) {
    header += ` x-tvg-url="${options.epgUrl.trim()}"`;
  }
  lines.push(header);

  if (options.customHeaderComments) {
    lines.push('#####################################################################');
    lines.push('# Arabic IPTV Playlist for Kodi PVR IPTV Simple Client');
    lines.push('# Auto-generated & Optimized for High Quality Streams');
    lines.push('# Features: NatGeo Abu Dhabi, News, Sports, Series, Quran & Kids');
    lines.push('#####################################################################');
  }

  channels.forEach((ch) => {
    // Kodi attributes
    const tvgId = ch.tvgId || ch.id;
    const tvgName = ch.tvgName || ch.name;
    const tvgLogo = ch.logo || '';
    const groupTitle = ch.category;

    const extinf = `#EXTINF:-1 tvg-id="${tvgId}" tvg-name="${tvgName}" tvg-logo="${tvgLogo}" group-title="${groupTitle}",${ch.name}`;
    lines.push(extinf);

    // Kodi User Agent if set
    if (options.kodiUserAgent) {
      lines.push(`#EXTVLCOPT:http-user-agent=${options.kodiUserAgent}`);
    }

    if (ch.userAgent) {
      lines.push(`#EXTVLCOPT:http-user-agent=${ch.userAgent}`);
    }

    lines.push(ch.url);
  });

  return lines.join('\n');
}

export function generateShortM3uSample(channels: Channel[], shortEpgUrl: string): string {
  return generateM3uContent(channels.slice(0, 5), {
    includeEpgUrl: true,
    epgUrl: shortEpgUrl || 'https://raw.githubusercontent.com/username/repo/main/epg.xml',
    autoRefreshHours: 12,
    customHeaderComments: true,
    kodiUserAgent: 'Kodi/21.0 (IPTV Simple Client)',
  });
}
