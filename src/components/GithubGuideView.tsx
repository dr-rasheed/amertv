import React, { useState } from 'react';
import { Github, Upload, ExternalLink, Copy, Check, ArrowRight, ShieldCheck, Sparkles, Globe, Zap } from 'lucide-react';

export const GithubGuideView: React.FC = () => {
  const [githubUser, setGithubUser] = useState<string>('dr-rasheed');
  const [repoName, setRepoName] = useState<string>('amertv');
  const [branch, setBranch] = useState<string>('main');
  const [copiedM3u, setCopiedM3u] = useState<boolean>(false);
  const [copiedPages, setCopiedPages] = useState<boolean>(false);
  const [copiedIptvOrg, setCopiedIptvOrg] = useState<boolean>(false);
  const [copiedEpg, setCopiedEpg] = useState<boolean>(false);

  const rawM3uUrl = `https://raw.githubusercontent.com/${githubUser}/${repoName}/${branch}/ar.m3u`;
  const pagesM3uUrl = `https://${githubUser}.github.io/${repoName}/ar.m3u`;
  const iptvOrgUrl = `https://iptv-org.github.io/iptv/languages/ara.m3u`;
  const rawEpgUrl = `https://raw.githubusercontent.com/${githubUser}/${repoName}/${branch}/ar.xml`;

  const copyToClipboard = (text: string, type: 'm3u' | 'pages' | 'iptvorg' | 'epg') => {
    navigator.clipboard.writeText(text);
    if (type === 'm3u') {
      setCopiedM3u(true);
      setTimeout(() => setCopiedM3u(false), 2000);
    } else if (type === 'pages') {
      setCopiedPages(true);
      setTimeout(() => setCopiedPages(false), 2000);
    } else if (type === 'iptvorg') {
      setCopiedIptvOrg(true);
      setTimeout(() => setCopiedIptvOrg(false), 2000);
    } else {
      setCopiedEpg(true);
      setTimeout(() => setCopiedEpg(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Explanation for the 404 Screenshot Issue */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
            🔍
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-300">السر التقني: كيف جعل مطور iptv-org الرابط يشتغل ومظهر الملف؟</h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
              مطور <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded">iptv-org</code> قام بأمرين بسيطين للغاية جعلت الرابط يفتح فوراً في المتصفح وفي كودي دون ظهور صفحة 404:
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <div className="space-y-2">
            <p className="font-bold text-emerald-400 text-sm">1. التأكد من اسم الملف في المستودع (File Name Exact Match):</p>
            <p className="text-slate-300 leading-relaxed pr-2">
              في Linux و GitHub Pages، التسميات حساسة جداً لحالة الأحرف والامتدادات.
              إذا كان الملف المرفوع في مستودعك اسمه <code className="text-amber-300 font-mono">ar.m3u</code> أو <code className="text-amber-300 font-mono">ara.m3u</code> أو <code className="text-amber-300 font-mono">arabic_channels.m3u</code>، يجب أن يطابق الرابط في المتصفح الاسم المرفوع تماماً بالأحرف الصغيرة وبدون امتداد مخفي مثل (<code className="text-rose-400">ar.m3u.txt</code>).
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-emerald-400 text-sm">2. إضافة ملف <code className="text-amber-300 font-mono">.nojekyll</code> لمنع جيت هاب من حجب الملفات:</p>
            <p className="text-slate-300 leading-relaxed pr-2">
              افتراضياً يقتطع جيت هاب بعض الامتدادات أو يعالجها عبر محرّك Jekyll. مطور iptv-org أنشأ ملفاً فارغاً في جِذر مستودعه باسم <code className="text-emerald-400 font-mono">.nojekyll</code> (بدون أي محتوى) للطلب من جيت هاب إتاحة جميع ملفات الـ M3U المباشرة فوراً!
            </p>
          </div>

          <div className="p-3.5 bg-emerald-950/60 rounded-xl border border-emerald-500/40 text-emerald-200 font-semibold space-y-1.5">
            <p className="text-white font-bold">🛠️ الخطوات الـ 3 المباشرة للحل فوراً:</p>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-200 pr-2 font-normal">
              <li>حمل الملف من التطبيق باسم <strong className="text-amber-300">ar.m3u</strong> أو <strong className="text-amber-300">ara.m3u</strong>.</li>
              <li>افتح مستودعك <code className="text-white font-mono bg-slate-900 px-1 py-0.5 rounded">amertv</code> وامسح أي ملفات قديمة ثم ارفع <strong className="text-emerald-400 font-mono">ar.m3u</strong> واضغط Commit.</li>
              <li>اضغط <strong className="text-white">Add file -&gt; Create new file</strong> واكتب اسم الملف بالضبط: <strong className="text-emerald-400 font-mono">.nojekyll</strong> (يبدأ بنقطة) واضغط Commit.</li>
            </ol>
            <p className="text-amber-300 text-[11px] pt-1">
              ألف مبروك! بعدها سيعمل رابطك المباشر <code className="bg-slate-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">https://dr-rasheed.github.io/amertv/ar.m3u</code> في المتصفح وفي كودي 100%!
            </p>
          </div>
        </div>
      </div>

      {/* GitHub Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-white shrink-0">
            <Github className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-semibold border border-emerald-500/20 flex items-center gap-1">
                <Zap className="w-3 h-3" /> روابط مباشرة 100% بدون تقصير وبدون توقف
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">استضافة وتوفير روابط GitHub و GitHub Pages المباشرة</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              يمكنك استخدام روابط GitHub المباشرة (سواء عبر GitHub Pages أو Raw URLs) في إضافة Kodi IPTV Simple Client فوراً بدون حاجة لأي اختصار روابط!
            </p>
          </div>
        </div>

        {/* Feature Banner for Direct GitHub Pages & iptv-org */}
        <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 text-xs space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
            <Globe className="w-4 h-4" />
            <span>الروابط المباشرة الموصى بها لـ Kodi IPTV Simple Client:</span>
          </div>
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">مستودعك (Pages)</span>
                <code className="text-emerald-400 font-mono text-[11px] truncate">{pagesM3uUrl}</code>
              </div>
              <button
                onClick={() => copyToClipboard(pagesM3uUrl, 'pages')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shrink-0 text-xs transition-colors"
              >
                {copiedPages ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPages ? 'تم نسخ الرابط المباشر' : 'نسخ رابط GitHub Pages'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 truncate">
                <span className="bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">قائمة IPTV-Org الشاملة</span>
                <code className="text-blue-300 font-mono text-[11px] truncate">{iptvOrgUrl}</code>
              </div>
              <button
                onClick={() => copyToClipboard(iptvOrgUrl, 'iptvorg')}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 text-xs transition-colors"
              >
                {copiedIptvOrg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedIptvOrg ? 'تم نسخ الرابط' : 'نسخ رابط IPTV-Org العربي'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Link Customizer Box */}
        <div className="mt-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>توليد روابط حسابك المباشرة (Direct GitHub URLs):</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">اسم حسابك على GitHub:</label>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value.trim() || 'dr-rasheed')}
                placeholder="dr-rasheed"
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">اسم المستودع (Repository):</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value.trim() || 'amertv')}
                placeholder="amertv"
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">الفرع (Branch):</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value.trim() || 'main')}
                placeholder="main"
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Generated Raw & Pages Results */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold shrink-0">رابط M3U المباشر (Raw URL):</span>
              <code className="bg-slate-950 px-2.5 py-1 rounded text-emerald-400 font-mono text-[11px] truncate flex-1">
                {rawM3uUrl}
              </code>
              <button
                onClick={() => copyToClipboard(rawM3uUrl, 'm3u')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0"
              >
                {copiedM3u ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedM3u ? 'تم النسخ' : 'نسخ Raw'}</span>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold shrink-0">رابط EPG المباشر (Raw):</span>
              <code className="bg-slate-950 px-2.5 py-1 rounded text-amber-300 font-mono text-[11px] truncate flex-1">
                {rawEpgUrl}
              </code>
              <button
                onClick={() => copyToClipboard(rawEpgUrl, 'epg')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0"
              >
                {copiedEpg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEpg ? 'تم النسخ' : 'نسخ EPG'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step Walkthrough */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white px-2">خطوات إعداد المستودع وتفعيل GitHub Pages للاستخدام المباشر:</h3>

        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              1
            </span>
            <h4 className="font-bold text-white text-base">إنشاء المستودع (Create Public Repository)</h4>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pr-11">
            سجّل الدخول إلى موقع <a href="https://github.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">GitHub.com</a>، واضغط على <strong>New Repository (+)</strong>. سمِّ المستودع بـ <code className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded">amertv</code> واجعله <strong>Public (عام)</strong> ليتمكن برنامج Kodi من الوصول إليه مباشرة.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              2
            </span>
            <h4 className="font-bold text-white text-base">رفع الملفات (Upload Files)</h4>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pr-11">
            اضغط <strong>Add File &gt; Upload Files</strong> وقم بإفلات ملف القنوات <code className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-mono">ar.m3u</code> وملف <code className="bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded font-mono">ar.xml</code> ثم اضغط <strong>Commit Changes</strong>.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              3
            </span>
            <h4 className="font-bold text-white text-base">استخدام رابط GitHub المباشر في Kodi فوراً</h4>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pr-11">
            تم اعتماد الاسم المختصر <code className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded font-bold">ar.m3u</code> لتسهيل الكتابة على كيبورد التلفزيون. يمكنك تفعيل <strong>GitHub Pages</strong> للحصول على رابط مباشر فائق السرعة:
          </p>
          <div className="pr-11 space-y-2">
            <code className="block bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
              https://dr-rasheed.github.io/amertv/ar.m3u
            </code>
            <p className="text-slate-400 text-xs">ضع هذا الرابط فوراً داخل إضافة Kodi IPTV Simple Client دون حاجة لأي اختصار!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

