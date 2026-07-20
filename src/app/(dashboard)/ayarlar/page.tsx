import { getSystemSettings, getUsers } from "@/features/ayarlar/actions"
import { AyarlarClient } from "@/features/ayarlar/components/ayarlar-client"



export default async function AyarlarPage() {
  const [settingsRes, usersRes] = await Promise.all([
    getSystemSettings(),
    getUsers()
  ])

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800">Sistem Ayarları</h1>
        <p className="text-sm text-neutral-500 mt-1">Sistem parametreleri, kullanıcı yetkilendirme ve genel tercihler.</p>
      </div>

      <AyarlarClient 
        initialSettings={settingsRes.data || {}} 
        initialUsers={usersRes.data || []} 
      />
    </div>
  )
}
