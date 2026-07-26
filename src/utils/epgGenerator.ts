import { Channel } from '../types';

interface SampleProgramTemplate {
  title: string;
  desc: string;
  category: string;
  durationMinutes: number;
}

// Custom channel-specific EPG schedules
const SPECIFIC_CHANNEL_EPG: Record<string, SampleProgramTemplate[]> = {
  // Al Jazeera
  'aljazeera': [
    { title: 'نشرة الأخبار الرئيسة - حصاد اليوم', desc: 'تغطية حيّة ومباشرة لأبرز المستجدات والتطورات السياسية في المنطقة والعالم.', category: 'أخبار', durationMinutes: 60 },
    { title: 'ما خفي أعظم - تحقيقات استقصائية', desc: 'برنامج تحقيقي يتناول كواليس وأسرار القضايا الساخنة بمستندات حصرية.', category: 'وثائقي', durationMinutes: 60 },
    { title: 'الاتجاه المعاكس مع فيصل القاسم', desc: 'حوار ونقاش ساخن حول أبرز القضايا الخلافية والسياسية الشائكة.', category: 'حوارات', durationMinutes: 60 },
    { title: 'بلا حدود - لقاءات خاصة', desc: 'مقابلات حصرية مع قادة وصنّاع القرار للوقوف على التطورات الجارية.', category: 'حوارات', durationMinutes: 60 },
    { title: 'الجزيرة هذا الصباح', desc: 'مجلة صباحية متنوعة تغطي ثقافة وفنون وتكنولوجيا وأخبار مجتمعية.', category: 'منوعات', durationMinutes: 90 },
  ],
  // Al Arabiya
  'alarabiya': [
    { title: 'نشرة الرابعة الإخبارية', desc: 'متابعة ميدانية مكثفة وتغطية شاملة لكل الأحداث العربية والعالمية.', category: 'أخبار', durationMinutes: 60 },
    { title: 'تفاعلكم مع سارة دندراوي', desc: 'استعراض لأبرز القضايا الأكثر تداولاً وتفاعلاً عبر منصات التواصل الاجتماعي.', category: 'ترفيه', durationMinutes: 45 },
    { title: 'سجال سياسي وتحليل الحصاد', desc: 'قراءة وتحليل عميق مع نخبة من الخبراء والاستراتيجيين.', category: 'تحليل', durationMinutes: 60 },
    { title: 'موجز رأس الساعة', desc: 'موجز سريع بآخر الأنباء والتطورات الميدانية.', category: 'أخبار', durationMinutes: 15 },
  ],
  // NatGeo Abu Dhabi
  'natgeo': [
    { title: 'تحقيقات الكوارث الجوية - الموسم 23', desc: 'سلسلة استقصائية تكشف أسرار الحوادث الجوية وكيف أدت لتغيير معايير السلامة.', category: 'وثائقي', durationMinutes: 60 },
    { title: 'سمكة التونة العنيدة', desc: 'مغامرات صيادي الأسماك في مواجهة الأمواج العاتية والمنافسة الشرسة.', category: 'طبيعة', durationMinutes: 60 },
    { title: 'أسرار الكون والمحيطات', desc: 'استكشاف نادٍ لأعماق البحار والمجرات السماوية بأحدث التقنيات.', category: 'علوم', durationMinutes: 60 },
    { title: 'معارك الحيوانات الفتاكة', desc: 'صراع البقاء في أدغال أفريقيا ومواجهات بين أشرس المفترسات.', category: 'طبيعة', durationMinutes: 45 },
  ],
  // Saudi Quran
  'quran': [
    { title: 'بث مباشر - صلاة الفجر والختمة المباركة', desc: 'نقل حي ومباشر للصلوات والتلاوات الخاشعة من المسجد الحرام بمكة المكرمة.', category: 'ديني', durationMinutes: 120 },
    { title: 'تلاوات خاشعة لكبار القراء', desc: 'استماع لأجمل التلاوات القرآنية بأصوات مشاهير قراء العالم الإسلامي.', category: 'قرآن', durationMinutes: 90 },
    { title: 'تفسير معاني آيات الذكر الحكيم', desc: 'دروس ومحاضرات في تفسير وتدبر القرآن الكريم مع العلماء.', category: 'تفسير', durationMinutes: 60 },
  ],
  // Saudi Sunnah
  'sunnah': [
    { title: 'بث مباشر - المسجد النبوي الشريف', desc: 'نقل حي ومباشر لأروقة المسجد النبوي الشريف بالمدينة المنورة.', category: 'ديني', durationMinutes: 120 },
    { title: 'أحاديث صحيح البخاري ومسلم', desc: 'قراءة وشرح الأحكام الفقهية والسيرة النبوية العطرة.', category: 'حديث', durationMinutes: 60 },
  ],
  // Spacetoon / Kids
  'spacetoon': [
    { title: 'أبطال الديجيتال والمغامرات', desc: 'مغامرات فرسان المستقبل في إنقاذ العالم الرقمي من الأخطار.', category: 'أطفال', durationMinutes: 30 },
    { title: 'المحقق كونان - كوكب زمردة وأكشن', desc: 'غموض وألغاز ذكية يحاول كونان حلها لكشف أسرار الجرائم المعقدة.', category: 'أنمي', durationMinutes: 45 },
    { title: 'أغاني وأناشيد سبيستون الكلاسيكية', desc: 'شارات وأغاني كرتون المفضل لدى جيل الشباب والأطفال.', category: 'موسيقى', durationMinutes: 30 },
  ]
};

// Generic templates grouped by category
const CATEGORY_TEMPLATES: Record<string, SampleProgramTemplate[]> = {
  'الوثائقيات والمعرفة': [
    { title: 'روائع الطبيعة والاستكشاف', desc: 'رحلة في أعماق الطبيعة العذراء والكائنات الفريدة حول العالم.', category: 'وثائقي', durationMinutes: 60 },
    { title: 'مستكشفو التكنولوجيا والعلوم', desc: 'نظرة على أحدث الابتكارات والاكتشافات العلمية الحديثة.', category: 'علوم', durationMinutes: 45 },
    { title: 'أسرار الحضارات القديمة', desc: 'استكشاف الآثار التاريخية والأسرار المعمارية للشعوب.', category: 'تاريخ', durationMinutes: 60 },
  ],
  'الأخبار والمستجدات': [
    { title: 'النشرة الإخبارية الشاملة', desc: 'تغطية ومتابعة حيّة لأبرز التطورات السياسية والحدث اليومي.', category: 'أخبار', durationMinutes: 60 },
    { title: 'حوار المساء والتحليل الميداني', desc: 'نقاشات مع مستشارين ومحللين سياسيين حول المستجدات.', category: 'تحليل', durationMinutes: 60 },
    { title: 'موجز الأنباء السريع', desc: 'ملخص مكثف لأهم العناوين والمستجدات على الساحة.', category: 'أخبار', durationMinutes: 15 },
  ],
  'الرياضة': [
    { title: 'الاستوديو التحليلي المباشر', desc: 'قراءة تكتيكية قبل انطلاق المباريات واستعراض خطط الفرق.', category: 'رياضة', durationMinutes: 45 },
    { title: 'البث الحي للمباراة والبطولة', desc: 'تغطية مباشرة وحصرية لأحداث المنافسة الرياضية.', category: 'مباشر', durationMinutes: 105 },
    { title: 'حصاد الأهداف وملخص الجولة', desc: 'استعراض أجمل الأهداف والمهارات واللقطات البارزة.', category: 'ملخص', durationMinutes: 60 },
  ],
  'الأطفال والأسرة': [
    { title: 'عالم المغامرات والكرتون', desc: 'قصص ومغامرات مسلية وممتعة للأطفال مع أبطالهم المفضلين.', category: 'أطفال', durationMinutes: 30 },
    { title: 'برنامج المبتكرين الصغار', desc: 'تجارب علمية وأنشطة تفاعلية لتنمية مواهب الأطفال.', category: 'تعليمي', durationMinutes: 45 },
  ],
  'القرآن الكريم والسيَر': [
    { title: 'بث مباشر الصلوات والتلاوة العطرة', desc: 'نقل حي للصلوات والتلاوات الخاشعة والآيات المباركة.', category: 'قرآن', durationMinutes: 90 },
    { title: 'تفسير القرآن والآداب الإسلامية', desc: 'برنامج توعوي يشرح معاني الآيات العظيمة والسيرة النبوية.', category: 'تفسير', durationMinutes: 60 },
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
    const cleanId = ch.id.toLowerCase();
    
    // Find matching channel specific schedule
    let templates: SampleProgramTemplate[] | undefined;
    for (const key in SPECIFIC_CHANNEL_EPG) {
      if (cleanId.includes(key)) {
        templates = SPECIFIC_CHANNEL_EPG[key];
        break;
      }
    }

    // Fallback to Category
    if (!templates) {
      templates = CATEGORY_TEMPLATES[ch.category];
    }

    // Dynamic generated schedule using channel name if no template matches
    if (!templates || templates.length === 0) {
      templates = [
        { title: `البث المباشر - ${ch.name}`, desc: `متابعة حية ومباشرة للبرامج والفقرات اليومية عبر شاشة ${ch.name}.`, category: 'مباشر', durationMinutes: 120 },
        { title: `نشرة ومتابعة أحداث ${ch.name}`, desc: `تغطية متجددة وأبرز الأخبار والتغطيات الخاصة عبر ${ch.name}.`, category: 'أخبار', durationMinutes: 60 },
        { title: `سهرة ${ch.name} المباشرة`, desc: `عرض ممتع لأبرز البرامج واللقاءات المنوعة لجمهور ${ch.name}.`, category: 'منوعات', durationMinutes: 90 },
      ];
    }

    let currentTime = new Date(startTimeBase.getTime());
    const endTimeLimit = new Date(startTimeBase.getTime() + (daysAhead + 1) * 24 * 60 * 60 * 1000);

    let templateIndex = 0;

    while (currentTime < endTimeLimit) {
      const template = templates[templateIndex % templates.length];
      const progStart = new Date(currentTime.getTime());
      const progEnd = new Date(currentTime.getTime() + template.durationMinutes * 60 * 1000);

      // Customize title if generic template
      const titleText = template.title.includes(ch.name) ? template.title : `${template.title} | ${ch.name}`;

      xmlLines.push(`  <programme start="${formatXmlTvDate(progStart)}" stop="${formatXmlTvDate(progEnd)}" channel="${channelId}">`);
      xmlLines.push(`    <title lang="ar">${escapeXml(titleText)}</title>`);
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

