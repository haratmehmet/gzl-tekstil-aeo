const fs = require('fs');

const path = './src/app/(dashboard)/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

// The exact string to replace
const oldHook = `    const handleViewerInteraction = (e: MouseEvent | KeyboardEvent) => {
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
    }`;

const newHook = `    // Bulletproof shield for VIEWER role
    const handleViewerFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      const isInput = target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isInput) {
        target.blur();
        setShowViewerToast(true);
        setTimeout(() => setShowViewerToast(false), 3000);
      }
    };

    const handleViewerInteraction = (e: MouseEvent | KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      
      // Allow navigation clicks
      const closestLink = target.closest('a');
      const closestNav = target.closest('nav, aside, .sidebar'); // Removed header just in case table header uses it
      if (closestLink || closestNav) return;

      // Allow export buttons
      const closestBtn = target.closest('button');
      const text = (closestBtn?.innerText || target.innerText || '').toLowerCase();
      const isExport = text.includes('pdf') || text.includes('excel') || text.includes('indir') || target.closest('[data-export]') || target.closest('.export') || text.includes('yazdır');
      if (isExport) return;

      const isInput = target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      const isLabel = target.tagName === 'LABEL' || target.closest('label');
      const isButton = target.tagName === 'BUTTON' || closestBtn || target.getAttribute('role') === 'button';
      const isSvgIcon = target.tagName === 'svg' || target.closest('svg');
      const isTableRow = target.tagName === 'TD' || target.tagName === 'TR' || target.closest('tr');

      // We block buttons, labels, and SVG icons in tables
      if (isButton || isLabel || (isSvgIcon && isTableRow)) {
        if (e.type === 'keydown') return; // Let focus handler catch keyboard interactions on inputs
        
        e.preventDefault();
        e.stopPropagation();
        
        setShowViewerToast(true);
        setTimeout(() => setShowViewerToast(false), 3000);
      }
      
      if (isInput && (e.type === 'mousedown' || e.type === 'click')) {
        e.preventDefault();
        e.stopPropagation();
        target.blur();
        setShowViewerToast(true);
        setTimeout(() => setShowViewerToast(false), 3000);
      }
    };

    document.addEventListener("focus", handleViewerFocus, true);
    document.addEventListener("click", handleViewerInteraction, true);
    document.addEventListener("mousedown", handleViewerInteraction, true);
    document.addEventListener("keydown", handleViewerInteraction, true);
    
    return () => {
      document.removeEventListener("focus", handleViewerFocus, true);
      document.removeEventListener("click", handleViewerInteraction, true);
      document.removeEventListener("mousedown", handleViewerInteraction, true);
      document.removeEventListener("keydown", handleViewerInteraction, true);
    }`;

content = content.replace(oldHook, newHook);
fs.writeFileSync(path, content);
