export type VodCategory = 'أفلام' | 'مسلسلات' | 'يوتيوب' | 'أخرى';

export interface VodItem {
  id: string;
  title: string;
  type: 'movie' | 'series' | 'youtube';
  category: VodCategory;
  poster?: string;
  url: string; // The stream URL or YouTube URL
  description?: string;
  year?: string;
  rating?: string;
  featured?: boolean;
}
