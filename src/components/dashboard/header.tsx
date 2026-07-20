"use client"

import * as React from "react"
import { useRouter, usePathname } from "next/navigation"
import { Menu } from "lucide-react"
import { getSystemSettings } from "@/features/ayarlar/actions"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  onMenuClick?: () => void
}

// Map url paths to human readable Turkish names
const pathNamesMap: Record<string, string> = {
  "": "Dashboard",
  "kumas-takip-foyu": "Kumaş Takip Föyü",
  "cekme-tablosu": "Çekme Tablosu",
  "kalan-kumas-stok": "Kalan Kumaş Stok",
  "kumas-deposu": "Kumaş Deposu",
  "kesim-kontrol-foyu": "Kesim Kontrol Föyü",
  "uretim-takip-foyu": "Ürün Takip Föyü",
  "raporlar": "Genel Üretim Takip",
  "ayarlar": "Ayarlar",
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname()
  const [companyName, setCompanyName] = React.useState("GZL TEKSTİL")
  const [systemStatus, setSystemStatus] = React.useState("AKTIF")

  React.useEffect(() => {
    getSystemSettings().then(res => {
      if (res.success && res.data) {
        if (res.data.companyName) setCompanyName(res.data.companyName)
        if (res.data.systemStatus) setSystemStatus(res.data.systemStatus)
      }
    })
  }, [])

  // Generate dynamic breadcrumb list based on routing pathname
  const pathSegments = pathname.split("/").filter(Boolean)
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-neutral-200/80 bg-white/70 backdrop-blur-md px-6 sticky top-0 z-30 select-none">
      <div className="flex flex-1 items-center gap-4">
        {/* Mobile menu trigger */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100/50 rounded-lg h-9 w-9"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menüyü Aç</span>
        </Button>

        {/* Dynamic Breadcrumbs */}
        <Breadcrumb className="hidden sm:inline-block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="text-neutral-400 hover:text-neutral-900 text-xs font-medium">
                Ana Sayfa
              </BreadcrumbLink>
            </BreadcrumbItem>
            {pathSegments.length > 0 && <BreadcrumbSeparator className="text-neutral-300" />}
            
            {pathSegments.map((segment, index) => {
              const href = `/${pathSegments.slice(0, index + 1).join("/")}`
              const isLast = index === pathSegments.length - 1
              const turkishName = pathNamesMap[segment] || segment

              return (
                <React.Fragment key={href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="text-neutral-800 font-semibold text-xs">
                        {turkishName}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={href} className="text-neutral-400 hover:text-neutral-900 text-xs font-medium">
                        {turkishName}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator className="text-neutral-300" />}
                </React.Fragment>
              )
            })}
            
            {pathSegments.length === 0 && (
              <>
                <BreadcrumbSeparator className="text-neutral-300" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-neutral-800 font-semibold text-xs">
                    Dashboard
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex-1 flex justify-center">
        <h1 className="text-xl md:text-2xl font-black text-sky-950 uppercase tracking-[0.2em] whitespace-nowrap">
          {companyName}
        </h1>
      </div>

      <div className="flex flex-1 items-center justify-end gap-2">
        {systemStatus === "AKTIF" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-bold text-emerald-700 uppercase">Aktif</span>
          </div>
        )}
        {systemStatus === "BAKIMDA" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            <span className="text-[10px] font-bold text-amber-700 uppercase">Bakımda</span>
          </div>
        )}
        {systemStatus === "PASIF" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            <span className="text-[10px] font-bold text-rose-700 uppercase">Pasif</span>
          </div>
        )}
      </div>
    </header>
  )
}
