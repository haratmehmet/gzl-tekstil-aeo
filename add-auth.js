const fs = require('fs');
const path = require('path');
const glob = require('glob'); // Not installed, using pure node instead

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/app/api', (filePath) => {
    if (!filePath.endsWith('route.ts')) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;
    
    // Add import if not present
    if (content.includes('export async function POST') || content.includes('export async function PUT') || content.includes('export async function DELETE')) {
        if (!content.includes('requireMutationAuth')) {
            // Find last import
            const lines = content.split('\n');
            let lastImportIndex = 0;
            for(let i = 0; i < lines.length; i++) {
                if(lines[i].startsWith('import ')) lastImportIndex = i;
            }
            lines.splice(lastImportIndex + 1, 0, 'import { requireMutationAuth } from "@/lib/session"');
            content = lines.join('\n');
            modified = true;
        }
        
        // Add check to POST
        content = content.replace(/export async function POST\([^)]*\)\s*{\s*(?:try\s*{)?/g, match => {
            if(match.includes('requireMutationAuth')) return match; // already added somehow?
            return match + '\n    await requireMutationAuth();';
        });
        
        // Add check to PUT
        content = content.replace(/export async function PUT\([^)]*\)\s*{\s*(?:try\s*{)?/g, match => {
            return match + '\n    await requireMutationAuth();';
        });

        // Add check to DELETE
        content = content.replace(/export async function DELETE\([^)]*\)\s*{\s*(?:try\s*{)?/g, match => {
            return match + '\n    await requireMutationAuth();';
        });
        
        if (modified) {
            fs.writeFileSync(filePath, content);
            console.log('Modified', filePath);
        }
    }
});
