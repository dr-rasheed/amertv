import { Channel, ChannelCategory } from '../types';

export function parseM3uText(m3uText: string): Channel[] {
  const lines = m3uText.split(/\r?\n/);
  const channels: Channel[] = [];

  let currentExtinf: {
    tvgId?: string;
    tvgName?: string;
    tvgLogo?: string;
    groupTitle?: string;
    name?: string;
  } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) continue;

    if (line.startsWith('#EXTINF:')) {
      const extinfContent = line.substring(8);
      
      // Extract tvg-id
      const tvgIdMatch = extinfContent.match(/tvg-id="([^"]*)"/i);
      const tvgId = tvgIdMatch ? tvgIdMatch[1] : undefined;

      // Extract tvg-name
      const tvgNameMatch = extinfContent.match(/tvg-name="([^"]*)"/i);
      const tvgName = tvgNameMatch ? tvgNameMatch[1] : undefined;

      // Extract tvg-logo
      const tvgLogoMatch = extinfContent.match(/tvg-logo="([^"]*)"/i);
      const logo = tvgLogoMatch ? tvgLogoMatch[1] : undefined;

      // Extract group-title
      const groupTitleMatch = extinfContent.match(/group-title="([^"]*)"/i);
      const groupTitle = groupTitleMatch ? groupTitleMatch[1] : undefined;

      // Extract channel display name (after comma)
      const commaIdx = extinfContent.lastIndexOf(',');
      const rawName = commaIdx !== -1 ? extinfContent.substring(commaIdx + 1).trim() : 'قناة غير معروفة';

      currentExtinf = {
        tvgId,
        tvgName,
        tvgLogo: logo,
        groupTitle,
        name: rawName,
      };
    } else if (!line.startsWith('#') && currentExtinf) {
      // This is the stream URL line
      const url = line;

      // Map groupTitle / category to Arabic UI categories
      let category: ChannelCategory = 'الأخبار والمستجدات';
      const gt = (currentExtinf.groupTitle || '').toLowerCase();
      const nm = (currentExtinf.name || '').toLowerCase();

      if (gt.includes('doc') || gt.includes('science') || gt.includes('nature') || nm.includes('nat geo') || nm.includes('national geographic') || nm.includes('وثائق')) {
        category = 'الوثائقيات والمعرفة';
      } else if (gt.includes('sport') || nm.includes('sport') || nm.includes('رياض')) {
        category = 'الرياضة';
      } else if (gt.includes('entertainment') || gt.includes('series') || gt.includes('movie') || nm.includes('mbc') || nm.includes('دراما')) {
        category = 'الترفيه والمسلسلات';
      } else if (gt.includes('religious') || nm.includes('quran') || nm.includes('قرآن') || nm.includes('سنة')) {
        category = 'القرآن الكريم والسيَر';
      } else if (gt.includes('kids') || gt.includes('animation') || nm.includes('اطفال') || nm.includes('براعم') || nm.includes('majd')) {
        category = 'الأطفال والأسرة';
      }

      const channelId = `iptvorg-${channels.length + 1}-${Math.random().toString(36).substr(2, 5)}`;

      channels.push({
        id: channelId,
        name: currentExtinf.name || 'قناة غير معروفة',
        tvgName: currentExtinf.tvgName || currentExtinf.name,
        tvgId: currentExtinf.tvgId,
        logo: currentExtinf.tvgLogo || 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=120&h=120&q=80',
        category,
        url,
        isHd: currentExtinf.name?.includes('HD') || currentExtinf.name?.includes('1080') || currentExtinf.name?.includes('720'),
        quality: currentExtinf.name?.includes('1080') ? 'FHD' : 'HD',
        country: 'عربي',
      });

      currentExtinf = null;
    }
  }

  return channels;
}
