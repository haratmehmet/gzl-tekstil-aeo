import React from "react"
import { KalanKumasTable } from "@/features/kalan-kumas/components/kalan-kumas-table"



export default function KalanKumasStokPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Kalan Kumaş Stok</h1>
        <p className="text-sm text-neutral-500 font-medium mt-1">
          Kumaş giriş faturalarını ve maliyetlerini takip edin.
        </p>
      </div>

      <KalanKumasTable />
    </div>
  )
}
