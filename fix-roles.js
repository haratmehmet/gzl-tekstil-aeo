const fs = require('fs');

// 1. Fix layout.tsx
const layoutPath = './src/app/(dashboard)/layout.tsx';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');

layoutContent = layoutContent.replace(
    'if (userRole !== "VIEWER") return',
    'if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") return'
);

layoutContent = layoutContent.replace(
    'if (userRole === "VIEWER") {',
    'if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {'
);
fs.writeFileSync(layoutPath, layoutContent);

// 2. Fix session.ts
const sessionPath = './src/lib/session.ts';
let sessionContent = fs.readFileSync(sessionPath, 'utf8');
sessionContent = sessionContent.replace(
    'if (user.role === "VIEWER") {',
    'if (user.role !== "SUPER_ADMIN" && user.role !== "ADMIN") {'
);
fs.writeFileSync(sessionPath, sessionContent);

