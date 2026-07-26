const fs = require('fs');
let content = fs.readFileSync('src/utils/kodiAddonGenerator.ts', 'utf-8');

const oldHtmlFuncRegex = /export function generateIndexHtml[\s\S]*?<\/html>\`;\n}/;
const newHtmlFunc = `export function generateIndexHtml(config: KodiAddonConfig): string {
  const repoId = \`repository.\${config.addonId.replace('plugin.video.', '')}\`;
  const repoZipName = \`\${repoId}-\${config.version}.zip\`;
  const pluginZipName = \`\${config.addonId}-\${config.version}.zip\`;
  
  const repoZipPath = \`\${repoId}/\${repoZipName}\`;
  const pluginZipPath = \`\${config.addonId}/\${pluginZipName}\`;

  return \`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>\${config.addonName} - مستودع كودي</title>
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; }
        .container { max-width: 600px; width: 100%; background: #1e293b; padding: 2rem; border-radius: 1rem; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); text-align: center; border: 1px solid #334155; }
        h1 { color: #10b981; margin-bottom: 0.5rem; }
        p { color: #94a3b8; margin-bottom: 2rem; line-height: 1.6; }
        .btn { display: inline-block; background: #10b981; color: #fff; padding: 1rem 2rem; border-radius: 0.5rem; text-decoration: none; font-weight: bold; font-size: 1.1rem; transition: background 0.3s; margin-bottom: 2rem; }
        .btn:hover { background: #059669; }
        .links { text-align: left; background: #0f172a; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.9rem; }
        .links a { color: #38bdf8; text-decoration: none; display: block; padding: 0.25rem 0; }
        .links a:hover { text-decoration: underline; }
        .version { margin-top: 1rem; font-size: 0.8rem; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <h1>مستودع \${config.addonName}</h1>
        <p>هذا هو الرابط الخاص بمستودع كودي (Kodi Repository).<br>لإضافة هذا المستودع إلى كودي، يرجى تحميل ملف الـ ZIP بالأسفل وتثبيته من خلال (Install from zip file) داخل إعدادات الإضافات في كودي.</p>
        
        <a href="\${repoZipName}" class="btn">⬇️ تحميل ملف المستودع (Repository ZIP)</a>
        
        <div class="links" dir="ltr">
            <!-- Kodi File Manager requirements -->
            <a href="../">../</a>
            <a href="\${repoId}/">\${repoId}/</a>
            <a href="\${config.addonId}/">\${config.addonId}/</a>
            <a href="\${repoZipName}">\${repoZipName}</a>
            <a href="\${repoZipPath}">\${repoZipPath}</a>
            <a href="\${pluginZipPath}">\${pluginZipPath}</a>
            <a href="addons.xml">addons.xml</a>
            <a href="addons.xml.md5">addons.xml.md5</a>
            <a href="media_database.json">media_database.json</a>
        </div>
        <div class="version">الإصدار: \${config.version} | المطور: \${config.providerName}</div>
    </div>
</body>
</html>\`;
}`;

content = content.replace(oldHtmlFuncRegex, newHtmlFunc);
fs.writeFileSync('src/utils/kodiAddonGenerator.ts', content);
console.log("HTML generation updated");
