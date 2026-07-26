import React, { useState } from 'react';
import { Github, Upload, ExternalLink, Copy, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export const GithubGuideView: React.FC = () => {
  const [githubUser, setGithubUser] = useState<string>('username');
  const [repoName, setRepoName] = useState<string>('kodi-arabic-iptv');
  const [branch, setBranch] = useState<string>('main');
  const [copiedM3u, setCopiedM3u] = useState<boolean>(false);
  const [copiedEpg, setCopiedEpg] = useState<boolean>(false);

  const rawM3uUrl = `https://raw.githubusercontent.com/${githubUser}/${repoName}/${branch}/arabic_channels.m3u`;
  const rawEpgUrl = `https://raw.githubusercontent.com/${githubUser}/${repoName}/${branch}/epg.xml`;

  const copyToClipboard = (text: string, type: 'm3u' | 'epg') => {
    navigator.clipboard.writeText(text);
    if (type === 'm3u') {
      setCopiedM3u(true);
      setTimeout(() => setCopiedM3u(false), 2000);
    } else {
      setCopiedEpg(true);
      setTimeout(() => setCopiedEpg(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* GitHub Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-white shrink-0">
            <Github className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">دليل إنشاء واستضافة الملفات على GitHub</h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
              خطوات سهلة ومضمونة 100% لاستضافة ملفات M3U و EPG مجاناً على حسابك في GitHub بأعلى سرعة وبدون توقف.
            </p>
          </div>
        </div>

        {/* Dynamic Link Customizer Box */}
        <div className="mt-6 bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>محاكي توليد الروابط المباشرة (Raw Links Generator)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">اسم حسابك على GitHub:</label>
              <input
                type="text"
                value={githubUser}
                onChange={(e) => setGithubUser(e.target.value.trim() || 'username')}
                placeholder="اسم المستخدم"
                className="w-full bg-slate-900 text-white p-2.5 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">اسم المستودع (Repository):</label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value.trim() || 'kodi-arabic-iptv')}
                placeholder="kodi-arabic-iptv"
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

          {/* Generated Raw Results */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold shrink-0">رابط M3U المباشر (Raw):</span>
              <code className="bg-slate-950 px-2.5 py-1 rounded text-emerald-400 font-mono text-[11px] truncate flex-1">
                {rawM3uUrl}
              </code>
              <button
                onClick={() => copyToClipboard(rawM3uUrl, 'm3u')}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0"
              >
                {copiedM3u ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedM3u ? 'تم النسخ' : 'نسخ'}</span>
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
                <span>{copiedEpg ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step by Step Walkthrough */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white px-2">الخطوات الشاملة بالترتيب لتجهيز مستودع GitHub:</h3>

        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              1
            </span>
            <h4 className="font-bold text-white text-base">إنشاء مستودع جديد (Create Repository)</h4>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pr-11">
            سجّل الدخول إلى موقع <a href="https://github.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">GitHub.com</a>، ثم اضغط على زر <strong>New Repository (+)</strong>. سمِّ المستودع باسم مثلاً <code className="bg-slate-950 text-emerald-400 px-1.5 py-0.5 rounded">kodi-arabic-iptv</code> واجعله <strong>Public (عام)</strong> حتى يستطيع برنامج Kodi الوصول إليه.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              2
            </span>
            <h4 className="font-bold text-white text-base">رفع الملفين (Add file &gt; Upload files)</h4>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pr-11">
            من داخل المستودع، اضغط على <strong>Add File</strong> ثم <strong>Upload Files</strong>، وقم بسحب وإفلات الملفين اللذين قمت بتحميلهما من التطبيق:
          </p>
          <div className="pr-11 flex flex-wrap gap-2 text-xs">
            <span className="bg-slate-950 text-emerald-400 px-3 py-1 rounded-lg border border-slate-800 font-mono font-semibold">
              📄 arabic_channels.m3u
            </span>
            <span className="bg-slate-950 text-amber-300 px-3 py-1 rounded-lg border border-slate-800 font-mono font-semibold">
              📄 epg.xml
            </span>
          </div>
          <p className="text-slate-400 text-xs pr-11">ثم اضغط على زر <strong>Commit Changes</strong> لحفظ الملفات.</p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              3
            </span>
            <h4 className="font-bold text-white text-base">استخراج رابط Raw المباشر</h4>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pr-11">
            افتح ملف <code className="bg-slate-950 text-emerald-400 px-1 py-0.5 rounded">arabic_channels.m3u</code> واضغط على زر <strong>Raw</strong> في أعلى اليمين. انسخ رابط الصفحة بالكامل من المتصفح. سيكون شكله مثل:
          </p>
          <div className="pr-11">
            <code className="block bg-slate-950 p-3 rounded-xl border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto">
              https://raw.githubusercontent.com/username/repo/main/arabic_channels.m3u
            </code>
          </div>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-extrabold flex items-center justify-center text-sm shrink-0">
              4
            </span>
            <h4 className="font-bold text-white text-base">اختياري: تقصير الرابط لتسهيل كتابته بريموت التلفاز</h4>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pr-11">
            توجه إلى موقع <a href="https://is.gd" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">is.gd</a> أو <a href="https://tinyurl.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">TinyURL</a> ولصق رابط Raw للحصول على رابط قصير جداً مثل <code className="bg-slate-950 text-amber-300 px-1.5 py-0.5 rounded font-mono">is.gd/arabm3u</code> ليسهل كتابته في Kodi.
          </p>
        </div>
      </div>
    </div>
  );
};
