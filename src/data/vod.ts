import { VodItem } from '../types/vod';

export const INITIAL_VODS: VodItem[] = [
  {
    id: 'yt-maraya',
    title: 'مسلسل مرايا (أفضل الحلقات)',
    type: 'youtube',
    category: 'مسلسلات',
    poster: 'https://i.ytimg.com/vi/j5GfR5yE_P8/hqdefault.jpg',
    url: 'plugin://plugin.video.youtube/play/?video_id=j5GfR5yE_P8',
    description: 'حلقات مختارة من المسلسل السوري الشهير مرايا عبر يوتيوب (يحتاج إضافة YouTube في Kodi)',
    year: '1982-2013',
  },
  {
    id: 'yt-ziersalem',
    title: 'مسلسل الزير سالم (كامل)',
    type: 'youtube',
    category: 'مسلسلات',
    poster: 'https://i.ytimg.com/vi/bXjXz_x5Gj8/hqdefault.jpg',
    url: 'plugin://plugin.video.youtube/play/?playlist_id=PLX2Q5jK_V7F9j9xZ8vD_bY2zL8W_yYv_w',
    description: 'جميع حلقات مسلسل الزير سالم عبر يوتيوب (يحتاج إضافة YouTube)',
    year: '2000',
  },
  {
    id: 'movie-archive-1',
    title: 'فيلم الرسالة (نسخة مجانية من Archive.org)',
    type: 'movie',
    category: 'أفلام',
    poster: 'https://upload.wikimedia.org/wikipedia/ar/5/5e/The_Message_poster.jpg',
    url: 'https://archive.org/download/al-risalah-the-message-1976/Al-Risalah-The-Message-1976.mp4',
    description: 'فيلم الرسالة التاريخي - مصرح بالنشر على الإنترنت (Archive.org)',
    year: '1976',
  }
];
