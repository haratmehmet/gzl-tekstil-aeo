const fs = require('fs');

const path = './src/features/ayarlar/actions.ts';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('requireMutationAuth')) {
    content = content.replace('import prisma from "@/lib/prisma"', 'import prisma from "@/lib/prisma"\nimport { requireMutationAuth } from "@/lib/session"');
    
    // Add to updateSystemSettings
    content = content.replace(/export async function updateSystemSettings\([^)]*\)\s*{\s*try\s*{/, match => {
        return match + '\n    await requireMutationAuth();';
    });

    // Add to createUser
    content = content.replace(/export async function createUser\([^)]*\)\s*{\s*try\s*{/, match => {
        return match + '\n    await requireMutationAuth();';
    });
    
    // Add to updateUser
    content = content.replace(/export async function updateUser\([^)]*\)\s*{\s*try\s*{/, match => {
        return match + '\n    await requireMutationAuth();';
    });
    
    // Add to deleteUser
    content = content.replace(/export async function deleteUser\([^)]*\)\s*{\s*try\s*{/, match => {
        return match + '\n    await requireMutationAuth();';
    });

    fs.writeFileSync(path, content);
}
