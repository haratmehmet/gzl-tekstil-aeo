import { UretimTakipLayout } from "@/features/uretim-takip/components/uretim-takip-layout"
import { UretimTakipProvider } from "@/features/uretim-takip/uretim-takip-store"



export default function UretimTakipFoyuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Ürün Takip Föyü</h1>
        <p className="text-sm text-neutral-500 mt-1">Model bazlı üretim ve atölye süreçlerinin takibi.</p>
      </div>
      <UretimTakipProvider>
        <UretimTakipLayout />
      </UretimTakipProvider>
    </div>
  )
}
