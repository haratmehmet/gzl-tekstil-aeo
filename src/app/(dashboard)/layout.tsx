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
        </main>
      </div>
    </div>
  )
}
