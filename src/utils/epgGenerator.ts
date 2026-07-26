import { Channel } from '../types';

interface SampleProgramTemplate {
  title: string;
  desc: string;
  category: string;
  durationMinutes: number;
}

const PROGRAM_TEMPLATES: Record<string, SampleProgramTemplate[]> = {
  'الوثائقيات والمعرفة': [
    { title: 'تحقيقات الكوارث الجوية - الموسم 22', desc: 'استكشاف الأسباب الدقيقة وراء الحوادث الجوية الأكثر تعقيداً في التاريخ.', category: 'وثائقي', durationMinutes: 60 },
    { title: 'أسرار المحيطات والكون', desc: 'جولة استكشافية فريدة في أعماق البحار والمحيطات والكائنات النادرة.', category: 'طبيعة', durationMinutes: 60 },
    { title: 'مستكشفو الحياة البرية', desc: 'متابعة نادرة للحيوانات المفترسة في أدغال أفريقيا والقطب الشمالي.', category: 'طبيعة', durationMinutes: 45 },
    { title: 'أعظم الإنجازات الهندسيّة', desc: 'كواليس بناء أضخم الجسور والأنفاق ونطاحات السحاب في العالم.', category: 'علوم', durationMinutes: 60 },
    { title: 'مملكة الحيوانات الفتاكة', desc: 'نظرة مقربة عن استراتيجيات الصيد لدى أشرس الكائنات الحية.', category: 'طبيعة', durationMinutes: 45 },
  ],
  'الأخبار والمستجدات': [
    { title: 'النشرة الإخبارية الرئيسة', desc: 'تغطية شاملة لأهم الأحداث والتطورات السياسية والاقتصادية حول العالم.', category: 'أخبار', durationMinutes: 60 },
    { title: 'حوار الأخبار وتحليل الحصاد', desc: 'مناقشات عميقة مع خبراء ومحللين سياسيين لأبرز ملفات اليوم.', category: 'حوارات', durationMinutes: 60 },
    { title: 'موجز الأنباء والعناوين', desc: 'موجز سريع لأبرز المستجدات والتطورات الميدانية.', category: 'أخبار', durationMinutes: 15 },
    { title: 'عالم الاقتصاد والأسواق', desc: 'قراءة في تحركات البورصة وأسعار الطاقة والعملات العالمية.', category: 'اقتصاد', durationMinutes: 45 },
  ],
  'الرياضة': [
    { title: 'استوديو المباراة المباشرة', desc: 'تحليل تكتيكي ورصد لجاهزية الفريقين وأبرز التشكيلات المتوقعة.', category: 'رياضة', durationMinutes: 45 },
    { title: 'البث المباشر للمباراة', desc: 'تغطية حيّة ومباشرة مع أفضل المعلقين الرياضيين.', category: 'مباشر', durationMinutes: 105 },
    { title: 'الملخص والمجلة الرياضية', desc: 'أبرز أهداف ومهارات واستعراض نتائج دوريات اليوم.', category: 'ملخص', durationMinutes: 60 },
    { title: 'حصاد الجولة والتحكيم', desc: 'مراجعة الحالات التحكيمية المثيرة للجدل واللقطات اللامعة.', category: 'تحليل', durationMinutes: 60 },
  ],
  'الترفيه والمسلسلات': [
    { title: 'المسلسل العربي - الحلقة اليومية', desc: 'أحداث مشوقة ومفاجآت غير متوقعة في الحلقة الجديدة.', category: 'مسلسلات', durationMinutes: 60 },
    { title: 'برنامج الترفيه وحوار النجوم', desc: 'لقاءات حصرية مع أشهر فناني وصنّاع السينما والدراما العربية.', category: 'ترفيه', durationMinutes: 90 },
    { title: 'دراما المساء والمسلسلات التاريخية', desc: 'عروض ملحمية وسير درامية تاريخية مميزة.', category: 'دراما', durationMinutes: 60 },
  ],
  'الأطفال والأسرة': [
    { title: 'أبطال المستقبل والانيميشن', desc: 'مغامرات كرتونية شيقة مليئة بالقيم والتشويق والمرح للأطفال.', category: 'أطفال', durationMinutes: 30 },
    { title: 'عالم العلوم والمبتكرين الصغار', desc: 'فقرات تفاعلية تجيب على تساؤلات الأطفال وتنمي مواهبهم.', category: 'تعليمي', durationMinutes: 45 },
    { title: 'أغاني وأناشيد الأطفال', desc: 'أناشيد ورسومات كرتونية ممتعة ومسلية.', category: 'أغاني', durationMinutes: 30 },
  ],
  'القرآن الكريم والسيَر': [
    { title: 'بث مباشر صلاة اليوم وتلاوة عطرة', desc: 'نقل حي ومباشر للتلاوات والصلوات من المسجد الحرام والمسجد النبوي.', category: 'دين', durationMinutes: 90 },
    { title: 'تفسير وآيات من الذكر الحكيم', desc: 'شرح ودراسة معاني آيات القرآن الكريم مع كبار العلماء.', category: 'تفسير', durationMinutes: 60 },
    { title: 'قصص الأنبياء والسيرة النبوية', desc: 'محطات إيمانية من السيرة العطرة وتاريخ الإسلام.', category: 'سيرة', durationMinutes: 60 },
  ],
  'الأفلام والسينما': [
    { title: 'فيلم السهرة العربي', desc: 'عرض سينمائي مميز لأحدث وأقوى الأعمال السينمائية العربية.', category: 'أفلام', durationMinutes: 120 },
    { title: 'روائع الكلاسيكيات السينمائية', desc: 'أجمل أفلام الزمن الجميل بحودة عالية ومعدلة.', category: 'كلاسيك', durationMinutes: 105 },
  ]
};

// Format date to XMLTV format: YYYYMMDDHHMMSS +0000
function formatXmlTvDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hours = pad(date.getUTCHours());
  const minutes = pad(date.getUTCMinutes());
  const seconds = pad(date.getUTCSeconds());
  return `${year}${month}${day}${hours}${minutes}${seconds} +0000`;
}

export function generateEpgXmlContent(channels: Channel[], daysAhead: number = 3): string {
  const xmlLines: string[] = [];
  xmlLines.push('<?xml version="1.0" encoding="UTF-8"?>');
  xmlLines.push('<!DOCTYPE tv SYSTEM "xmltv.dtd">');
  xmlLines.push('<tv generator-info-name="Arabic IPTV EPG Generator" generator-info-url="https://github.com">');

  // Channel Nodes
  channels.forEach((ch) => {
    const channelId = ch.tvgId || ch.id;
    xmlLines.push(`  <channel id="${channelId}">`);
    xmlLines.push(`    <display-name lang="ar">${escapeXml(ch.name)}</display-name>`);
    if (ch.logo) {
      xmlLines.push(`    <icon src="${escapeXml(ch.logo)}" />`);
    }
    xmlLines.push(`  </channel>`);
  });

  // Programs Nodes for today + daysAhead
  const now = new Date();
  const startTimeBase = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  channels.forEach((ch) => {
    const channelId = ch.tvgId || ch.id;
    const templates = PROGRAM_TEMPLATES[ch.category] || PROGRAM_TEMPLATES['الأخبار والمستجدات'];

    let currentTime = new Date(startTimeBase.getTime());
    const endTimeLimit = new Date(startTimeBase.getTime() + (daysAhead + 1) * 24 * 60 * 60 * 1000);

    let templateIndex = 0;

    while (currentTime < endTimeLimit) {
      const template = templates[templateIndex % templates.length];
      const progStart = new Date(currentTime.getTime());
      const progEnd = new Date(currentTime.getTime() + template.durationMinutes * 60 * 1000);

      xmlLines.push(`  <programme start="${formatXmlTvDate(progStart)}" stop="${formatXmlTvDate(progEnd)}" channel="${channelId}">`);
      xmlLines.push(`    <title lang="ar">${escapeXml(template.title)}</title>`);
      xmlLines.push(`    <desc lang="ar">${escapeXml(template.desc)}</desc>`);
      xmlLines.push(`    <category lang="ar">${escapeXml(template.category)}</category>`);
      xmlLines.push(`  </programme>`);

      currentTime = progEnd;
      templateIndex++;
    }
  });

  xmlLines.push('</tv>');
  return xmlLines.join('\n');
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
