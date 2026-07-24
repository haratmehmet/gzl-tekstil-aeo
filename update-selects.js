const fs = require('fs');

const path = './src/features/ayarlar/components/ayarlar-client.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace the select options
content = content.replace(/<option value="SUPER_ADMIN">SÜPER ADMİN<\/option>/g, '<option value="SUPER_ADMIN">SÜPER ADMİN</option>\n                  <option value="VIEWER">SADECE İZLEYİCİ</option>');

fs.writeFileSync(path, content);
