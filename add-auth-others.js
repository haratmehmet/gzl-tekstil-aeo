const fs = require('fs');

function protectFile(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, 'utf8');
    if (content.includes('requireMutationAuth')) return;
    
    // Add import
    content = content.replace('import prisma from "@/lib/prisma"', 'import prisma from "@/lib/prisma"\nimport { requireMutationAuth } from "@/lib/session"');
    if(!content.includes('requireMutationAuth')) {
        // If there's no prisma import, find another common one
        if(content.includes('import { revalidatePath }')) {
             content = content.replace('import { revalidatePath }', 'import { requireMutationAuth } from "@/lib/session"\nimport { revalidatePath }');
        }
    }

    // Replace export async function with try {
    content = content.replace(/export async function [A-Za-z0-9_]+\([^)]*\)\s*{\s*try\s*{/g, match => {
        if(match.includes('export async function get')) return match; // skip getters
        return match + '\n    await requireMutationAuth();';
    });
    
    fs.writeFileSync(path, content);
}

protectFile('./src/features/ayarlar/data-actions.ts');
protectFile('./src/features/genel-uretim/actions.ts');
