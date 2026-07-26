const fs = require('fs');
let content = fs.readFileSync('src/components/VodManager.tsx', 'utf-8');

const targetStr = `{/* Solution 1: Upload to GitHub */}`;
const replacement = `
          {/* Solution 1: Upload to GitHub */}
          <div className="bg-slate-900/80 rounded-xl p-3.5 border border-slate-800 space-y-2 md:col-span-2 border-l-4 border-l-red-500">
            <h4 className="font-bold text-sm text-red-400 flex items-center gap-1.5">
              <AlertTriangle className="w-5 h-5" />
              تنبيه هام جداً: لماذا يظهر المستودع فارغاً في كودي؟
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              إذا قمت بالرفع ولكن كودي يظهر فارغاً أو الرابط لا يعمل، فهذا لأنك <strong>لم تقم بتفعيل GitHub Pages</strong>!
              <br/>
              جيت هاب لا يقوم بنشر الرابط <code className="bg-slate-800 text-emerald-400 px-1 py-0.5 rounded">https://dr-rasheed.github.io/amertv/</code> تلقائياً بمجرد رفع الملفات. <strong>يجب عليك تفعيله يدوياً مرة واحدة فقط</strong>:
            </p>
            <ol className="list-decimal list-inside text-xs text-slate-300 space-y-1 bg-slate-950 p-3 rounded-lg border border-slate-800">
              <li>افتح مستودعك في جيت هاب: <a href="https://github.com/dr-rasheed/amertv/settings/pages" target="_blank" className="text-blue-400 underline">اضغط هنا للذهاب لإعدادات Pages</a></li>
              <li>ضمن قسم <strong>Build and deployment</strong>، ابحث عن <strong>Branch</strong></li>
              <li>غيّر كلمة <code className="text-amber-400">None</code> إلى <code className="text-emerald-400">main</code> ثم اضغط <strong>Save</strong></li>
              <li>انتظر دقيقة واحدة، ثم جرب فتح المستودع مرة أخرى في كودي وستظهر الملفات!</li>
            </ol>
          </div>
          
          {/* Solution 1: Upload to GitHub */}`;

if (content.includes('تنبيه هام جداً')) {
    console.log("Already updated");
} else {
    content = content.replace(targetStr, replacement);
    fs.writeFileSync('src/components/VodManager.tsx', content);
    console.log("UI Updated with GitHub Pages notice");
}
