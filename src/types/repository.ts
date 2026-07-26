export interface SourceLink {
  providerName: string; // e.g. ArabCafe, Akwam, EgyBest, FaselHD, ArabSeed
  quality: '4K' | '1080p' | '720p' | '480p';
  streamUrl: string;
  isDirect: boolean;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  sources: SourceLink[];
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface UnifiedMediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  type: 'movie' | 'series';
  category: 'أفلام عربية' | 'أفلام أجنبية' | 'مسلسلات عربية' | 'مسلسلات أجنبية' | 'أنمي' | 'وثائقيات';
  year: number;
  dateAdded: string; // ISO date for sorting newest to oldest
  poster: string;
  description: string;
  rating?: string;
  sources?: SourceLink[]; // For movies
  seasons?: Season[]; // For series
}

export interface SiteSource {
  id: string;
  name: string;
  domain: string;
  category: 'أفلام' | 'مسلسلات' | 'أنمي' | 'وثائقيات' | 'منوعات';
  status: 'شغال' | 'يحتاج تجديد' | 'تجريبي';
  scraperType: 'html_regex' | 'json_api' | 'youtube_playlist' | 'direct_m3u';
  targetUrlExample: string;
  description: string;
  enabled: boolean;
}

export interface KodiAddonConfig {
  addonId: string; // e.g. plugin.video.amertv
  addonName: string; // e.g. AmerTV Matrix & ZombiB Repository
  version: string; // e.g. 1.0.0
  providerName: string; // e.g. AmerTV Dev
  summary: string;
  repoUrl: string; // e.g. https://dr-rasheed.github.io/amertv
  autoNextEpisode: boolean;
  autoUpdateDb: boolean;
  dbVersion: string;
  sources: SiteSource[];
}

