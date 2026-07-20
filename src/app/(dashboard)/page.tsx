import { DashboardWidgets } from "@/features/dashboard/components/widgets"
import { getDashboardStats } from "@/features/dashboard/actions"



export default async function DashboardPage() {
  const statsRes = await getDashboardStats()
  const initialData = statsRes.success && statsRes.data ? statsRes.data : { totalTakipFoyu: 0, totalMt: "0", activeSeasonsCount: 0 }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Genel Durum</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Kumaş deposu ve güncel sezon takibine ait özet veriler aşağıda listelenmiştir.
        </p>
      </div>
      <DashboardWidgets initialData={initialData} />
    </div>
  )
}
