// Reliable logo map for major Arabic and international channels
const LOGO_MAP: Record<string, string> = {
  // الوثائقيات والمعرفة
  'natgeo-abudhabi': 'https://upload.wikimedia.org/wikipedia/commons/ thumb/6/6a/National_Geographic_Logo.svg/500px-National_Geographic_Logo.svg.png',
  'natgeo': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/National_Geographic_Logo.svg/500px-National_Geographic_Logo.svg.png',
  'aljazeera-doc': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Al_Jazeera_Documentary_Channel_logo.svg/500px-Al_Jazeera_Documentary_Channel_logo.svg.png',
  'dw-doc': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Deutsche_Welle_symbol_2012.svg/500px-Deutsche_Welle_symbol_2012.svg.png',
  'alaraby2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Al_Araby_TV_logo.png/500px-Al_Araby_TV_logo.png',

  // الأخبار
  'aljazeera': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Al_Jazeera_Media_Network_logo.svg/500px-Al_Jazeera_Media_Network_logo.svg.png',
  'alarabiya': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Al_Arabiya_Logo.svg/500px-Al_Arabiya_Logo.svg.png',
  'alhadath': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Al_Hadath_logo.svg/500px-Al_Hadath_logo.svg.png',
  'skynews': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Sky_News_Arabia_logo.svg/500px-Sky_News_Arabia_logo.svg.png',
  'bbcarabic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/BBC_News_Arabic_logo_2022.svg/500px-BBC_News_Arabic_logo_2022.svg.png',
  'france24': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/France24.svg/500px-France24.svg.png',
  'rt-arabic': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/RT_logo.svg/500px-RT_logo.svg.png',

  // MBC
  'mbc1': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBC1.sa.png',
  'mbc2': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBC2.sa.png',
  'mbc3': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBC3.sa.png',
  'mbc4': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBC4.sa.png',
  'mbc-action': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBCAction.sa.png',
  'mbc-drama': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBCDrama.sa.png',
  'mbc-max': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBCMAX.sa.png',
  'mbc-bollywood': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBCBollywood.sa.png',
  'mbc-masr': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBCMasr.eg.png',
  'mbc-iraq': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MBCIraq.iq.png',

  // Rotana
  'rotana-cinema': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/RotanaCinema.sa.png',
  'rotana-drama': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/RotanaDrama.sa.png',
  'rotana-classic': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/RotanaClassic.sa.png',

  // الأطفال
  'spacetoon': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/Spacetoon.ae.png',
  'majid': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/MajidKidsTV.ae.png',

  // القرآن
  'quran': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/SaudiQuran.sa.png',
  'sunnah': 'https://raw.githubusercontent.com/iptv-org/iptv/master/logos/SaudiSunnah.sa.png',
};

export function getReliableChannelLogo(id: string, name: string, currentLogo?: string): string {
  const cleanId = id.toLowerCase();
  for (const key in LOGO_MAP) {
    if (cleanId.includes(key)) {
      return LOGO_MAP[key];
    }
  }

  if (currentLogo && currentLogo.startsWith('http') && !currentLogo.includes('iptv-org.github.io')) {
    return currentLogo;
  }

  if (currentLogo && currentLogo.includes('iptv-org.github.io')) {
    return currentLogo.replace('iptv-org.github.io/iptv/logos', 'raw.githubusercontent.com/iptv-org/iptv/master/logos');
  }

  // High-res UI avatars badge with channel name as fallback
  const encodedName = encodeURIComponent(name.slice(0, 10));
  return `https://ui-avatars.com/api/?name=${encodedName}&background=0f172a&color=34d399&size=128&font-size=0.4&bold=true`;
}
