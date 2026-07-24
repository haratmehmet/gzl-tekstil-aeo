const fs = require('fs');

const path = './src/app/(dashboard)/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

const hookLogic = `
  const [showViewerToast, setShowViewerToast] = React.useState(false)

  React.useEffect(() => {
    if (userRole !== "VIEWER") return

    const handleViewerInteraction = (e: MouseEvent | KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (!target) return
      
      // Get the closest button or link if it exists
      const closestBtn = target.closest('button')
      const closestLink = target.closest('a')
      const closestNav = target.closest('nav, header, aside, .sidebar')

      // Allow navigation and sidebar
      if (closestLink || closestNav) return

      // Allow export buttons
      const text = (closestBtn?.innerText || target.innerText || '').toLowerCase()
      const isExport = text.includes('pdf') || text.includes('excel') || text.includes('indir') || target.closest('[data-export]') || target.closest('.export')
      if (isExport) return

      // Form elements and mutating interactions
      const isInput = target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.isContentEditable
      const isLabel = target.tagName === 'LABEL' || target.closest('label')
      const isButton = target.tagName === 'BUTTON' || closestBtn || target.getAttribute('role') === 'button'
      const isTableRow = target.tagName === 'TD' || target.tagName === 'TR' || target.closest('tr')
      const isSvgIcon = target.tagName === 'svg' || target.closest('svg')
      
      // We block inputs, selects, labels (which trigger inputs), buttons, and SVG icons (often edit/delete icons)
      if (isInput || isButton || isLabel || (isSvgIcon && isTableRow)) {
        // Special case: don't block simple clicks on table cells unless they are inputs or buttons, but wait, some tables have inline edit
        if (e.type === 'keydown' && !isInput && !isButton) return;
        
        e.preventDefault()
        e.stopPropagation()
        
        setShowViewerToast(true)
        setTimeout(() => setShowViewerToast(false), 3000)
      }
    }

    // Capture phase ensures we intercept before React's synthetic events
    document.addEventListener("click", handleViewerInteraction, true)
    document.addEventListener("mousedown", handleViewerInteraction, true)
    document.addEventListener("keydown", handleViewerInteraction, true)
    
    return () => {
      document.removeEventListener("click", handleViewerInteraction, true)
      document.removeEventListener("mousedown", handleViewerInteraction, true)
      document.removeEventListener("keydown", handleViewerInteraction, true)
    }
  }, [userRole])
`;

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

if (!content.includes('showViewerToast')) {
    // Inject hook
    content = content.replace(
        `  React.useEffect(() => {
    setIsMounted(true)`,
        hookLogic + `\n  React.useEffect(() => {
    setIsMounted(true)`
    );

    // Inject UI
    content = content.replace(
        `      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">`,
        `      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">` + toastUI
    );
    fs.writeFileSync(path, content);
}
