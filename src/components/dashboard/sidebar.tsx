"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutUser } from "@/features/auth/actions"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Calendar,
  FileSpreadsheet,
  Layers,
  Warehouse,
  Grid,
  BarChart3,
  Settings,
  Scissors,
  LogOut,
  Ruler,
} from "lucide-react"

export type NavigationItem =
  | { name: string; href: string; icon: React.ElementType; isDivider?: never }
  | { isDivider: true; id: string }

// Export menu list to use in both desktop and mobile sidebar menus
export const navigationItems: NavigationItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { isDivider: true, id: "div-1" },
  { name: "Kumaş Takip Föyü", href: "/kumas-takip-foyu", icon: FileSpreadsheet },
  { name: "Çekme Tablosu", href: "/cekme-tablosu", icon: Ruler },
  { name: "Kalan Kumaş Stok", href: "/kalan-kumas-stok", icon: Layers },
  { name: "Kumas Deposu", href: "/kumas-deposu", icon: Warehouse },
  { isDivider: true, id: "div-2" },
  { name: "Kesim Kontrol Föyü", href: "/kesim-kontrol-foyu", icon: Scissors },
  { name: "Ürün Takip Föyü", href: "/uretim-takip-foyu", icon: Grid },
  { name: "Genel Üretim Takip", href: "/raporlar", icon: BarChart3 },
  { name: "Ayarlar", href: "/ayarlar", icon: Settings },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  onItemClick?: () => void
}

export function Sidebar({ className, onItemClick, ...props }: SidebarProps) {
  return (
    <div
      className={cn(
        "flex flex-col h-full bg-white border-r border-neutral-200/80 text-neutral-800",
        className
      )}
      {...props}
    >
      <SidebarContent onItemClick={onItemClick} />
    </div>
  )
}

import { getSystemSettings } from "@/features/ayarlar/actions"

export function SidebarContent({ onItemClick }: { onItemClick?: () => void }) {
  const pathname = usePathname()
  const [userRole, setUserRole] = React.useState<string | null>(null)
  const [companyName, setCompanyName] = React.useState("GZL TEKSTİL")
  const [logoUrl, setLogoUrl] = React.useState("/logo.png")

  React.useEffect(() => {
    import("@/features/auth/actions").then(({ getCurrentUser }) => {
      getCurrentUser().then(res => {
        if (res.success && res.user) {
          setUserRole(res.user.role)
        }
      })
    })

    getSystemSettings().then(res => {
      if (res.success && res.data) {
        if (res.data.companyName) setCompanyName(res.data.companyName)
        if (res.data.logoUrl) setLogoUrl(res.data.logoUrl)
      }
    })
  }, [])

  return (
    <div className="flex flex-col h-full bg-white select-none">
      {/* Brand area */}
      <div className="flex h-20 items-center px-6 border-b border-neutral-100 bg-neutral-50/50">
        <Link href="/" className="flex items-center gap-3 font-bold text-neutral-800">
          <img
            src={logoUrl}
            alt="Logo"
            className="h-10 w-10 shrink-0 object-contain rounded-lg select-none"
          />
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold tracking-tight text-neutral-800 uppercase leading-none">{companyName}</span>
            <span className="text-[9px] font-medium text-neutral-400 mt-1 leading-tight">
              Operasyon Yönetim Sistemi (AEO)
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
        {navigationItems.map((item) => {
          if (item.isDivider) {
            return <div key={item.id} className="mx-2 my-4 h-px bg-neutral-200/60" />
          }

          // Role based visibility
          if (item.name === "Ayarlar" && userRole !== "SUPER_ADMIN") {
            return null;
          }

          const isActive = pathname === item.href
          const Icon = item.icon!

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onItemClick}
              className={cn(
                "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "bg-neutral-900/5 text-neutral-900 font-semibold shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)] border-l-2 border-neutral-900 pl-[12px]"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
              )}
            >
              <Icon
                className={cn(
                  "h-4.5 w-4.5 shrink-0 transition-colors duration-200",
                  isActive ? "text-neutral-900" : "text-neutral-400 group-hover:text-neutral-800"
                )}
              />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </div>

      {/* Logout button */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/5">
        <button
          onClick={async () => {
            if (typeof window !== "undefined") {
              localStorage.removeItem("isLoggedIn")
              localStorage.removeItem("userEmail")
            }
            await logoutUser()
          }}
          className="flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200"
        >
          <LogOut className="h-4.5 w-4.5 shrink-0 text-red-500" />
          <span>Çıkış Yap</span>
        </button>
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-neutral-100 bg-neutral-50/20 text-[10px] text-neutral-400 font-medium text-center">
        &copy; 2026 GZL Tekstil Yönetici Paneli v1.0
      </div>
    </div>
  )
}
