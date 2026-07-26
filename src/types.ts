export type ChannelCategory =
  | 'الوثائقيات والمعرفة'
  | 'الأخبار والمستجدات'
  | 'الرياضة'
  | 'الترفيه والمسلسلات'
  | 'الأطفال والأسرة'
  | 'القرآن الكريم والسيَر'
  | 'الأفلام والسينما';

export interface Channel {
  id: string;
  name: string;
  tvgName: string;
  tvgId: string;
  logo: string;
  category: ChannelCategory;
  url: string;
  backupUrl?: string;
  isHd?: boolean;
  featured?: boolean;
  quality?: 'FHD' | 'HD' | 'SD';
  country?: string;
  userAgent?: string;
}

export interface EpgProgram {
  id: string;
  channelId: string;
  title: string;
  description: string;
  startTime: string; // YYYYMMDDHHMMSS +0000 format
  endTime: string;
  category?: string;
}

export interface M3uOptions {
  includeEpgUrl: boolean;
  epgUrl: string;
  autoRefreshHours: number;
  customHeaderComments: boolean;
  kodiUserAgent: string;
  catchupType?: string;
  catchupDays?: number;
}

export interface GitHubStep {
  stepNumber: number;
  title: string;
  description: string;
  codeSnippet?: string;
  note?: string;
}
