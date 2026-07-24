const fs = require('fs');
const path = './src/app/(dashboard)/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const toastUI = `
      {showViewerToast && (
        <div className="fixed bottom-6 right-6 bg-orange-50 border border-orange-200 shadow-xl rounded-2xl p-4 z-[9999] flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-sm">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-orange-800 text-sm mb-0.5">Yetkisiz İşlem</h4>
            <p className="text-xs text-orange-600 leading-relaxed font-medium">Sadece İzleyici (Viewer) yetkisine sahip olduğunuz için bu alana veri giremez veya değişiklik yapamazsınız.</p>
          </div>
        </div>
      )}
`;

if(!content.includes('Yetkisiz İşlem')) {
    content = content.replace('</main>', toastUI + '\n      </main>');
    fs.writeFileSync(path, content);
}
