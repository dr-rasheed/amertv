import React, { useState, useEffect } from 'react';
import { Channel } from '../types';
import { generateM3uContent } from '../utils/m3uGenerator';
import { generateEpgXmlContent } from '../utils/epgGenerator';
import {
  Github,
  Upload,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Key,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Globe,
  Sparkles,
  FileCode,
  Lock,
  ArrowRight
} from 'lucide-react';

interface GithubGuideViewProps {
  channels: Channel[];
}

export const GithubGuideView: React.FC<GithubGuideViewProps> = ({ channels }) => {
  const [githubUser, setGithubUser] = useState<string>(() => {
    return localStorage.getItem('kodi_github_user') || 'dr-rasheed';
  });
  const [repoName, setRepoName] = useState<string>(() => {
    return localStorage.getItem('kodi_github_repo') || 'amertv';
  });
  const [branch, setBranch] = useState<string>(() => {
    return localStorage.getItem('kodi_github_branch') || 'main';
  });
  const [patToken, setPatToken] = useState<string>(() => {
    return localStorage.getItem('kodi_github_pat') || '';
  });

  const [copiedM3u, setCopiedM3u] = useState<boolean>(false);
  const [copiedPages, setCopiedPages] = useState<boolean>(false);
  const [copiedIptvOrg, setCopiedIptvOrg] = useState<boolean>(false);
  const [copiedEpg, setCopiedEpg] = useState<boolean>(false);

  // GitHub Direct Upload State
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem('kodi_github_user', githubUser);
    localStorage.setItem('kodi_github_repo', repoName);
    localStorage.setItem('kodi_github_branch', branch);
    localStorage.setItem('kodi_github_pat', patToken);
  }, [githubUser, repoName, branch, patToken]);

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

  // Helper to convert UTF-8 string safely to base64 for GitHub API
  const utf8ToBase64 = (str: string): string => {
    const bytes = new TextEncoder().encode(str);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Push file directly to GitHub via REST API
  const pushFileToGitHub = async (filePath: string, fileContent: string, commitMessage: string) => {
    if (!patToken.trim()) {
      throw new Error('يرجى إدخال رمز الوصول الشخصي (GitHub Personal Access Token - PAT) أولاً.');
    }

    const apiUrl = `https://api.github.com/repos/${githubUser}/${repoName}/contents/${filePath}`;

    // Step 1: Check if file already exists to get its sha
    let existingSha: string | undefined = undefined;
    try {
      const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
        headers: {
          Authorization: `Bearer ${patToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (getRes.ok) {
        const data = await getRes.json();
        existingSha = data.sha;
      }
    } catch (err) {
      // File might not exist yet
    }

    // Step 2: Upload or Update
    const base64Content = utf8ToBase64(fileContent);
    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${patToken.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        message: commitMessage,
        content: base64Content,
        sha: existingSha,
        branch: branch,
      }),
    });

    if (!putRes.ok) {
      const errorJson = await putRes.json().catch(() => ({}));
      throw new Error(
        errorJson.message || `خطأ من جيت هاب (كود ${putRes.status}). تأكد من اسم الحساب والمستودع والرمز PAT.`
      );
    }

    return true;
  };

  // Single button full sync handler
  const handleFullGitHubPush = async () => {
    setIsUploading(true);
    setUploadStatus(null);
    setUploadError(null);

    try {
      // Generate M3U content
      const m3uContent = generateM3uContent(channels, {
        includeEpgUrl: true,
        epgUrl: rawEpgUrl,
        autoRefreshHours: 12,
        customHeaderComments: true,
        kodiUserAgent: 'Kodi/21.0 (IPTV Simple Client)',
      });

      // Generate EPG XML content
      const epgXmlContent = generateEpgXmlContent(channels);

      // Generate Standalone Landing index.html for GitHub Pages so visiting dr-rasheed.github.io/amertv is never blank!
      const landingHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>بوابة AmerTV IPTV | M3U & EPG Playlist</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Cairo', sans-serif; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center">
  <div class="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
    <div class="text-center space-y-3">
      <div class="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold border border-emerald-500/20">
        ✨ بوابة IPTV M3U المباشرة الشغالة
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white">AmerTV IPTV Playlist Repository</h1>
      <p class="text-slate-400 text-xs sm:text-sm">مستودع القنوات العربية والدليل الإلكتروني EPG المحدث تلقائياً لبرنامج Kodi و IPTV Simple Client</p>
    </div>

    <div class="space-y-3 bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 text-xs">
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
        <div class="space-y-1">
          <span class="text-emerald-400 font-bold">رابط قائمة القنوات M3U المباشر:</span>
          <p class="font-mono text-slate-300 break-all select-all">https://${githubUser}.github.io/${repoName}/ar.m3u</p>
        </div>
        <a href="./ar.m3u" download class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-2 rounded-lg shrink-0 text-center transition-colors">تحميل M3U</a>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900 rounded-xl border border-slate-800">
        <div class="space-y-1">
          <span class="text-amber-400 font-bold">رابط دليل البرامج EPG المباشر:</span>
          <p class="font-mono text-slate-300 break-all select-all">https://raw.githubusercontent.com/${githubUser}/${repoName}/${branch}/ar.xml</p>
        </div>
        <a href="./ar.xml" download class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-lg shrink-0 text-center transition-colors">تحميل EPG</a>
      </div>
    </div>

    <div class="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs space-y-2">
      <h3 class="font-bold text-slate-200">طريقة الاستخدام في تطبيق Kodi:</h3>
      <ol class="list-decimal list-inside space-y-1 text-slate-400 leading-relaxed">
        <li>افتح إضافة <strong class="text-white">IPTV Simple Client</strong> في Kodi.</li>
        <li>في خانة M3U URL ضع رابط المباشر: <code class="text-emerald-400 font-mono">https://${githubUser}.github.io/${repoName}/ar.m3u</code></li>
        <li>في خانة EPG URL ضع رابط الدليل: <code class="text-amber-400 font-mono">https://raw.githubusercontent.com/${githubUser}/${repoName}/${branch}/ar.xml</code></li>
        <li>أعد تشغيل Kodi وستعمل جميع القنوات فوراً!</li>
      </ol>
    </div>

    <div class="text-center text-[11px] text-slate-500 pt-2 border-t border-slate-800">
      تم إنشاؤه وتحديثه بواسطة تطبيق AmerTV Kodi Manager UI
    </div>
  </div>
</body>
</html>`;

      setUploadStatus('1/4: جاري رفع تحديث M3U (ar.m3u)...');
      await pushFileToGitHub('ar.m3u', m3uContent, 'Auto-update ar.m3u playlist via Kodi Manager UI');

      setUploadStatus('2/4: جاري رفع تحديث دليل EPG (ar.xml)...');
      await pushFileToGitHub('ar.xml', epgXmlContent, 'Auto-update ar.xml EPG guide via Kodi Manager UI');

      setUploadStatus('3/4: جاري رفع واجهة البوابة (index.html)...');
      await pushFileToGitHub('index.html', landingHtml, 'Add standalone portal landing page for GitHub Pages');

      setUploadStatus('4/4: جاري التأكد من وجود ملف .nojekyll...');
      await pushFileToGitHub('.nojekyll', '', 'Ensure .nojekyll exists for GitHub Pages');

      setUploadStatus('🎉 تم رفع وتحديث جميع الملفات وواجهة الموقع بنجاح على GitHub! أصبحت قناتك والموقع المباشر محدثين فوراً.');
    } catch (err: any) {
      setUploadError(err.message || 'حدث خطأ أثناء التحديث عبر GitHub API.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* SECTION 1: Direct 1-Click GitHub API Push Tool */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-bold shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">التحديث المباشر بضغطة زر إلى GitHub</h2>
                <span className="bg-emerald-500/10 text-emerald-400 text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/20">
                  GitHub REST API
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                تحديث ملف القنوات <code className="text-emerald-400 font-mono">ar.m3u</code> ودليل EPG مباشرة من المتصفح إلى مستودعك!
              </p>
            </div>
          </div>
        </div>

        {/* GitHub Credentials Input Grid */}
        <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">اسم الحساب على GitHub:</label>
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

          {/* GitHub Personal Access Token (PAT) Field */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>رمز الوصول الشخصي (GitHub Personal Access Token - PAT):</span>
              </label>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=KodiManagerUI"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>إنشاء توكن جديد بسهولة (مع صلاحية repo)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={patToken}
                onChange={(e) => setPatToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-xl border border-slate-800 focus:border-emerald-500 focus:outline-none pr-10"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              يتم حفظ التوكن محلياً وآمناً في متصفحك فقط لاستخدامه في رفع وتحديث الملفات بنقرة واحدة.
            </p>
          </div>

          {/* Action Button & Feedback */}
          <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              id="push-github-now-btn"
              onClick={handleFullGitHubPush}
              disabled={isUploading}
              className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
              <span>{isUploading ? 'جاري التحديث والتنسيق على GitHub...' : 'تحديث ملفات M3U و EPG على GitHub فوراً'}</span>
            </button>

            {uploadStatus && !uploadError && (
              <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{uploadStatus}</span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-300 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECTION 2: 404 Troubleshooting & Explanation */}
      <div className="bg-amber-950/40 border border-amber-500/40 rounded-3xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg shrink-0">
            🔍
          </div>
          <div>
            <h3 className="text-base font-bold text-amber-300">سر حماية الروابط ومنع ظهور صفحة 404 على GitHub Pages:</h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
              مطور <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">iptv-org</code> قام بأمرين بسيطين جعلت الرابط يفتح فوراً في المتصفح وفي كودي:
            </p>
          </div>
        </div>

        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-4 text-xs">
          <div className="space-y-2">
            <p className="font-bold text-emerald-400 text-sm">1. مطابقة اسم الملف بالضبط (File Name Exact Match):</p>
            <p className="text-slate-300 leading-relaxed pr-2">
              في GitHub Pages، التسميات حساسة لحالة الأحرف.
              الملف المرفوع اسمه <code className="text-amber-300 font-mono">ar.m3u</code> ويجب أن يطابق الرابط تماماً بدون أي امتداد مخفي مثل (<code className="text-rose-400">ar.m3u.txt</code>).
            </p>
          </div>

          <div className="space-y-2">
            <p className="font-bold text-emerald-400 text-sm">2. ملف <code className="text-amber-300 font-mono">.nojekyll</code> لمنع جيت هاب من حجب الملفات:</p>
            <p className="text-slate-300 leading-relaxed pr-2">
              أنشأنا ملفاً فارغاً باسم <code className="text-emerald-400 font-mono">.nojekyll</code> في جذر المستودع للطلب من جيت هاب إتاحة جميع ملفات الـ M3U المباشرة فوراً دون فلترة.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 3: Dynamic Links Preview & Copy */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-700 flex items-center justify-center text-white shrink-0">
            <Github className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">روابط حسابك المباشرة للاستخدام في تطبيق Kodi</h3>
            <p className="text-slate-400 text-xs sm:text-sm">ضع هذه الروابط في إضافة Kodi IPTV Simple Client</p>
          </div>
        </div>

        <div className="space-y-3 pt-2 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded text-[10px]">GitHub Pages</span>
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

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-blue-500/20 text-blue-300 font-bold px-2 py-0.5 rounded text-[10px]">GitHub Raw M3U</span>
              <code className="text-blue-300 font-mono text-[11px] truncate">{rawM3uUrl}</code>
            </div>
            <button
              onClick={() => copyToClipboard(rawM3uUrl, 'm3u')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 text-xs transition-colors"
            >
              {copiedM3u ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedM3u ? 'تم نسخ الرابط' : 'نسخ Raw M3U'}</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2 truncate">
              <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px]">GitHub Raw EPG</span>
              <code className="text-amber-300 font-mono text-[11px] truncate">{rawEpgUrl}</code>
            </div>
            <button
              onClick={() => copyToClipboard(rawEpgUrl, 'epg')}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 shrink-0 text-xs transition-colors"
            >
              {copiedEpg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedEpg ? 'تم نسخ الرابط' : 'نسخ EPG'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
