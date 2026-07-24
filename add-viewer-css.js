const fs = require('fs');

const path = './src/app/(dashboard)/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// Inject CSS to completely disable input interaction
const cssInject = `
  React.useEffect(() => {
    if (userRole === "VIEWER") {
      document.body.classList.add('viewer-mode');
    } else {
      document.body.classList.remove('viewer-mode');
    }
  }, [userRole]);
`;

if (!content.includes('viewer-mode')) {
    content = content.replace(
        `  React.useEffect(() => {
    setIsMounted(true)`,
        cssInject + `\n  React.useEffect(() => {
    setIsMounted(true)`
    );
    fs.writeFileSync(path, content);
}

const cssPath = './src/app/globals.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');
const viewerCSS = `
/* VIEWER MODE SHIELD */
body.viewer-mode input:not([type="hidden"]),
body.viewer-mode select,
body.viewer-mode textarea,
body.viewer-mode [contenteditable="true"] {
  pointer-events: none !important;
  user-select: none !important;
}
`;
if (!cssContent.includes('VIEWER MODE SHIELD')) {
    fs.writeFileSync(cssPath, cssContent + '\n' + viewerCSS);
}

