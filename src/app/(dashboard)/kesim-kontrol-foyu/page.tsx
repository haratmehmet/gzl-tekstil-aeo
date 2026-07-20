import { KesimKontrolLayout } from "@/features/kesim-kontrol/components/kesim-kontrol-layout"
import { KesimKontrolProvider } from "@/features/kesim-kontrol/kesim-kontrol-store"



export default function KesimKontrolFoyuPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div className="print:hidden">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Kesim Kontrol Föyü</h1>
        <p className="text-sm text-neutral-500 mt-1">Kesim süreçlerinin detaylı takip ve kontrol ekranı.</p>
      </div>
      
      <KesimKontrolProvider>
        <KesimKontrolLayout />
      </KesimKontrolProvider>
    </div>
  )
}
