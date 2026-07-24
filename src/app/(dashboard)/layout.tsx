"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Sidebar, SidebarContent } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { getSystemSettings } from "@/features/ayarlar/actions"
import { getCurrentUser } from "@/features/auth/actions"
import { ShieldAlert } from "lucide-react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)
  const [isMounted, setIsMounted] = React.useState(false)
  const [systemStatus, setSystemStatus] = React.useState("AKTIF")
  const [userRole, setUserRole] = React.useState("USER")


  const [showViewerToast, setShowViewerToast] = React.useState(false)

  React.useEffect(() => {
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") return

    // Bulletproof shield for VIEWER role
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
      const isAllowedExplicitly = target.closest('.allow-viewer');
      if (closestLink || closestNav || isAllowedExplicitly) return;

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
    }
  }, [userRole])


  React.useEffect(() => {
    if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
      document.body.classList.add('viewer-mode');
    } else {
      document.body.classList.remove('viewer-mode');
    }
  }, [userRole]);

  React.useEffect(() => {
    setIsMounted(true)
    
    getCurrentUser().then(res => {
      if (!res.success || !res.user) {
        router.push("/login")
      } else {
        setUserRole(res.user.role)
      }
    })

    getSystemSettings().then(res => {
      if (res.success && res.data?.systemStatus) {
        setSystemStatus(res.data.systemStatus)
      }
    })
  }, [router])

  // Prevent hydration flash before mounting client side auth check
  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <svg className="animate-spin h-6 w-6 text-neutral-800" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    )
  }

  const isLockedOut = (systemStatus === "PASIF" || systemStatus === "BAKIMDA") && userRole !== "SUPER_ADMIN"

  return (
    <div className="flex min-h-screen bg-neutral-50/50 antialiased">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:block w-64 shrink-0 h-screen sticky top-0 print:hidden">
        <Sidebar className="h-full" />
      </aside>

      {/* Mobile Sidebar (Sheet drawer) */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent side="left" className="p-0 w-64 border-r-0 bg-white">
          <SidebarContent onItemClick={() => setIsMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 relative print:block">
        <div className="print:hidden">
          <Header onMenuClick={() => setIsMobileOpen(true)} />
        </div>
        
        {/* Page content view */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full relative print:p-0 print:m-0 print:max-w-none print:w-full print:overflow-visible">
          {systemStatus === "BAKIMDA" && !isLockedOut && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
              <div>
                <h3 className="text-sm font-bold">Sistem Bakımda</h3>
                <p className="text-xs mt-1">Sistem şu anda bakım modundadır. Diğer kullanıcılar sisteme erişemez. Veri kayıpları yaşamamak için lütfen dikkatli işlem yapınız.</p>
              </div>
            </div>
          )}

          {isLockedOut ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="max-w-md w-full p-8 text-center space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${systemStatus === "BAKIMDA" ? "bg-amber-100 text-amber-600" : "bg-rose-100 text-rose-600"}`}>
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-neutral-900">
                  {systemStatus === "BAKIMDA" ? "Sistem Bakımda" : "Sistem Erişime Kapalı"}
                </h2>
                <p className="text-neutral-500 font-medium">
                  {systemStatus === "BAKIMDA" 
                    ? "Sistem şu anda bakım modundadır. Veri güvenliği için geçici olarak işlemler durdurulmuştur." 
                    : "Sistem şu anda pasif durumdadır ve sadece Süper Admin erişimine açıktır. Lütfen daha sonra tekrar deneyiniz."}
                </p>
              </div>
            </div>
          ) : (
            children
          )}
        
      {showViewerToast && (
        <div className="fixed bottom-6 right-6 bg-orange-50 border border-orange-200 shadow-xl rounded-2xl p-4 z-[9999] flex items-start gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300 max-w-sm">
          <div className="p-2 bg-orange-100 text-orange-600 rounded-lg shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-orange-800 text-sm mb-0.5">Yetkisiz İşlem</h4>
            <p className="text-xs text-orange-600 leading-relaxed font-medium">Yetkiniz sınırlandırılmıştır. Bu alana veri giremez veya değişiklik yapamazsınız. Sadece görüntüleme yapabilirsiniz.</p>
          </div>
        </div>
      )}

      </main>
      </div>
    </div>
  )
}
