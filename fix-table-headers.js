const fs = require('fs');

const path = './src/features/ayarlar/components/ayarlar-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file might have: <th className="px-5 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Kullanıcı Adı</th>
// or it might have: <th className="px-4 py-3 text-xs font-bold text-neutral-500 bg-neutral-100 uppercase tracking-wider">Ad Soyad</th>

content = content.replace(/<th[^>]*>Kullanıcı Adı<\/th>\s*<th[^>]*>E-posta<\/th>/, '<th className="px-5 py-3 text-[10px] font-bold text-neutral-500 uppercase tracking-wider" colSpan={2}>Kullanıcı Adı</th>');

fs.writeFileSync(path, content);
