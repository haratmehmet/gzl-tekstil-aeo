"use client"

import * as React from "react"
import { Users, Settings as SettingsIcon, Database, Check, Trash2, Plus, Edit, ShieldAlert } from "lucide-react"
import { updateSystemSettings, createUser, updateUser, deleteUser, getUsers } from "../actions"

interface Props {
  initialSettings: any
  initialUsers: any[]
}

export function AyarlarClient({ initialSettings, initialUsers }: Props) {
  const [activeTab, setActiveTab] = React.useState("genel")
  
  // Settings State
  const [companyName, setCompanyName] = React.useState(initialSettings?.companyName || "GZL TEKSTİL")
  const [logoUrl, setLogoUrl] = React.useState(initialSettings?.logoUrl || "/logo.png")
  const [faviconUrl, setFaviconUrl] = React.useState(initialSettings?.faviconUrl || "/favicon.ico")
  const [systemStatus, setSystemStatus] = React.useState(initialSettings?.systemStatus || "AKTIF")
  const [isSavingSettings, setIsSavingSettings] = React.useState(false)
  
  // Users State
  const [users, setUsers] = React.useState<any[]>(initialUsers)
  const [isAddingUser, setIsAddingUser] = React.useState(false)
  const [newUser, setNewUser] = React.useState({ name: "", email: "", password: "", role: "USER" })

  const [editingUserId, setEditingUserId] = React.useState<string | null>(null)
  const [editUserData, setEditUserData] = React.useState({ name: "", email: "", password: "", role: "USER" })

  const handleStartEdit = (user: any) => {
    setEditingUserId(user.id)
    setEditUserData({ name: user.name, email: user.email, password: "", role: user.role })
  }

  const handleSaveEdit = async () => {
    if (!editUserData.name || !editUserData.email) {
      alert("Ad ve E-posta zorunludur.")
      return
    }
    const updatePayload: any = {
      name: editUserData.name,
      email: editUserData.email,
      role: editUserData.role,
    }
    if (editUserData.password) {
      updatePayload.password = editUserData.password
    }

    const res = await updateUser(editingUserId!, updatePayload)
    if (res.success) {
      alert("Kullanıcı güncellendi.")
      setEditingUserId(null)
      const updatedUsers = await getUsers()
      if (updatedUsers.success) setUsers(updatedUsers.data || [])
    } else {
      alert("Hata: " + res.error)
    }
  }

  const handleSaveSettings = async () => {
    setIsSavingSettings(true)
    const res = await updateSystemSettings({ companyName, logoUrl, faviconUrl, systemStatus })
    setIsSavingSettings(false)
    if (res.success) {
      alert("Ayarlar başarıyla kaydedildi.")
      window.location.reload()
    } else {
      alert("Hata: " + res.error)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.name) {
      alert("Lütfen tüm alanları doldurun.")
      return
    }
    const res = await createUser(newUser)
    if (res.success) {
      alert("Kullanıcı başarıyla eklendi.")
      setIsAddingUser(false)
      setNewUser({ name: "", email: "", password: "", role: "USER" })
      // Refresh user list
      const updatedUsers = await getUsers()
      if (updatedUsers.success) setUsers(updatedUsers.data || [])
    } else {
      alert("Hata: " + res.error)
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Kullanıcıyı silmek istediğinize emin misiniz?")) return
    const res = await deleteUser(id)
    if (res.success) {
      setUsers(users.filter(u => u.id !== id))
    } else {
      alert("Hata: " + res.error)
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[60vh]">
      {/* Sidebar / Tabs */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <button 
          onClick={() => setActiveTab("genel")}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "genel" 
              ? "bg-sky-50 text-sky-700 shadow-sm border border-sky-100" 
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-transparent"
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          Genel Ayarlar
        </button>
        <button 
          onClick={() => setActiveTab("kullanicilar")}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "kullanicilar" 
              ? "bg-sky-50 text-sky-700 shadow-sm border border-sky-100" 
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-transparent"
          }`}
        >
          <Users className="w-4 h-4" />
          Kullanıcı Yönetimi
        </button>
        <button 
          onClick={() => setActiveTab("veri")}
          className={`flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all ${
            activeTab === "veri" 
              ? "bg-sky-50 text-sky-700 shadow-sm border border-sky-100" 
              : "text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 border border-transparent"
          }`}
        >
          <Database className="w-4 h-4" />
          Veri ve Arşiv
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 bg-white border border-neutral-200 rounded-2xl shadow-sm p-6 min-h-[500px]">
        {activeTab === "genel" && (
          <div className="space-y-6 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-lg font-bold text-neutral-800">Genel Ayarlar</h2>
              <p className="text-sm text-neutral-500 mt-1">Uygulamanın genel görünümünü ve marka ayarlarını yönetin.</p>
            </div>
            
            <div className="space-y-4 pt-4 border-t border-neutral-100">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Firma Adı (Uygulama Başlığı)</label>
                <input 
                  type="text" 
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" 
                  placeholder="GZL TEKSTİL"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Logo URL veya Dosya Yükle</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" 
                    placeholder="/logo.png veya https://..."
                  />
                  <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors border border-neutral-200">
                    Gözat
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append("file", file)
                        try {
                          const res = await fetch("/api/upload", { method: "POST", body: formData })
                          const data = await res.json()
                          if (data.success) setLogoUrl(data.url)
                          else alert("Yükleme hatası: " + data.error)
                        } catch (err) {
                          alert("Dosya yüklenemedi.")
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-neutral-400">Harici bir link yapıştırabilir veya bilgisayarınızdan resim seçebilirsiniz.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-neutral-700">Favicon URL veya Dosya Yükle</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={faviconUrl}
                    onChange={e => setFaviconUrl(e.target.value)}
                    className="flex-1 px-3 py-2 border border-neutral-200 rounded-lg text-sm focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" 
                    placeholder="/favicon.ico veya https://..."
                  />
                  <label className="cursor-pointer flex items-center justify-center px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-medium rounded-lg transition-colors border border-neutral-200">
                    Gözat
                    <input 
                      type="file" 
                      accept="image/x-icon,image/png,image/jpeg"
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const formData = new FormData()
                        formData.append("file", file)
                        try {
                          const res = await fetch("/api/upload", { method: "POST", body: formData })
                          const data = await res.json()
                          if (data.success) setFaviconUrl(data.url)
                          else alert("Yükleme hatası: " + data.error)
                        } catch (err) {
                          alert("Dosya yüklenemedi.")
                        }
                      }}
                    />
                  </label>
                </div>
                <p className="text-[11px] text-neutral-400">Tarayıcı sekmesinde görünen küçük ikon. (Örn: .ico veya .png)</p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-slate-700" />
                  <label className="text-sm font-bold text-slate-800">Sistem Durumu (Erişim Kontrolü)</label>
                </div>
                <select 
                  value={systemStatus}
                  onChange={e => setSystemStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-slate-500 font-medium"
                >
                  <option value="AKTIF">🟢 AKTİF (Tüm kullanıcılar erişebilir)</option>
                  <option value="BAKIMDA">🟡 BAKIMDA (Tüm kullanıcılara bakım uyarısı gösterilir)</option>
                  <option value="PASIF">🔴 PASİF (Normal kullanıcılar işlem yapamaz)</option>
                </select>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Sistemi pasife alırsanız, <b>Süper Adminler hariç</b> diğer kullanıcılar sisteme yeni veri giremez ve uyarı mesajı görürler. Bakımda seçeneği ise sadece bilgi amaçlı sarı bir bildirim gösterir.
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white text-sm font-bold rounded-lg hover:bg-sky-500 transition-colors disabled:opacity-50"
                >
                  {isSavingSettings ? "Kaydediliyor..." : <><Check className="w-4 h-4" /> Kaydet</>}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "kullanicilar" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-neutral-800">Kullanıcı Yönetimi</h2>
                <p className="text-sm text-neutral-500 mt-1">Sisteme giriş yapabilen hesapları yönetin.</p>
              </div>
              <button 
                onClick={() => setIsAddingUser(!isAddingUser)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-500 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Yeni Kullanıcı
              </button>
            </div>

            {isAddingUser && (
              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-4">
                <h3 className="text-sm font-bold text-neutral-800">Yeni Kullanıcı Ekle</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input type="text" placeholder="Ad Soyad" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  <input type="email" placeholder="E-posta Adresi" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  <input type="password" placeholder="Şifre" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm" />
                  <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="px-3 py-2 border border-neutral-200 rounded-lg text-sm">
                    <option value="USER">Standart Kullanıcı</option>
                    <option value="ADMIN">Yönetici</option>
                    <option value="SUPER_ADMIN">Süper Admin</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setIsAddingUser(false)} className="px-3 py-1.5 text-xs font-bold text-neutral-600 hover:bg-neutral-200 rounded-lg">İptal</button>
                  <button onClick={handleAddUser} className="px-3 py-1.5 text-xs font-bold bg-sky-600 text-white hover:bg-sky-500 rounded-lg">Kaydet</button>
                </div>
              </div>
            )}

            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">Kullanıcı</th>
                    <th className="px-4 py-3">E-posta</th>
                    <th className="px-4 py-3">Rol</th>
                    <th className="px-4 py-3 text-right">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 bg-white">
                  {users.map(u => (
                    <tr key={u.id} className="hover:bg-neutral-50 transition-colors">
                      {editingUserId === u.id ? (
                        <>
                          <td className="px-4 py-3">
                            <input type="text" value={editUserData.name} onChange={e => setEditUserData({...editUserData, name: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500" placeholder="Ad Soyad" />
                          </td>
                          <td className="px-4 py-3">
                            <input type="email" value={editUserData.email} onChange={e => setEditUserData({...editUserData, email: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500" placeholder="E-posta" />
                          </td>
                          <td className="px-4 py-3 space-y-2">
                            <select value={editUserData.role} onChange={e => setEditUserData({...editUserData, role: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500">
                              <option value="USER">Standart Kullanıcı</option>
                              <option value="ADMIN">Yönetici</option>
                              <option value="SUPER_ADMIN">Süper Admin</option>
                            </select>
                            <input type="password" value={editUserData.password} onChange={e => setEditUserData({...editUserData, password: e.target.value})} className="px-2 py-1.5 border border-neutral-200 rounded-lg text-xs w-full focus:outline-none focus:border-sky-500" placeholder="Yeni şifre (Değiştirmek istemiyorsanız boş bırakın)" />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={handleSaveEdit} className="px-3 py-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-lg text-xs font-bold mr-2 transition-colors">Kaydet</button>
                            <button onClick={() => setEditingUserId(null)} className="px-3 py-1 bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg text-xs font-bold transition-colors">İptal</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-4 py-3 font-medium text-neutral-800">{u.name}</td>
                          <td className="px-4 py-3 text-neutral-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold ${u.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-700' : u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-neutral-100 text-neutral-700'}`}>
                              {u.role === 'SUPER_ADMIN' ? 'SÜPER ADMİN' : u.role === 'ADMIN' ? 'YÖNETİCİ' : 'KULLANICI'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleStartEdit(u)} className="p-1.5 text-neutral-400 hover:text-sky-500 hover:bg-sky-50 rounded transition-colors mr-1" title="Düzenle">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors" title="Sil">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-neutral-500 text-sm">Kayıtlı kullanıcı bulunamadı.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "veri" && (
          <div className="space-y-6 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div>
              <h2 className="text-lg font-bold text-neutral-800">Veri ve Arşiv Yönetimi</h2>
              <p className="text-sm text-neutral-500 mt-1">Sistemdeki tüm verileri bilgisayarınıza indirebilir veya eski bir yedeği sisteme kurabilirsiniz.</p>
            </div>
            
            <div className="space-y-6 pt-4 border-t border-neutral-100">
              
              <div className="p-5 border border-neutral-200 rounded-xl space-y-4">
                <div>
                  <h3 className="font-bold text-neutral-800 text-sm">Sistemi Yedekle (Dışa Aktar)</h3>
                  <p className="text-[11px] text-neutral-500 mt-1">Tüm kullanıcılar, ayarlar, kumaş, üretim ve depo verilerini tek bir JSON dosyası olarak bilgisayarınıza indirir.</p>
                </div>
                <a 
                  href="/api/backup/export" 
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-500 transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Yedek İndir (.json)
                </a>
              </div>

              <div className="p-5 border border-red-200 bg-red-50/30 rounded-xl space-y-4">
                <div>
                  <h3 className="font-bold text-red-800 text-sm">Yedekten Geri Yükle (İçe Aktar)</h3>
                  <p className="text-[11px] text-red-600 mt-1 font-medium">DİKKAT: Bu işlem mevcut sistemdeki tüm verileri (ayarlar ve şifreler dahil) SİLER ve yerine yüklediğiniz dosyadaki verileri kurar.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition-colors">
                    <Database className="w-4 h-4" />
                    Yedek Yükle
                    <input 
                      type="file" 
                      accept=".json"
                      className="hidden" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        
                        const isConfirmed = confirm("DİKKAT: Sistemdeki MEVCUT TÜM VERİLER silinecek ve bu dosyadaki veriler kurulacak. Bu işlem geri alınamaz. Onaylıyor musunuz?")
                        if (!isConfirmed) {
                          e.target.value = ""
                          return
                        }

                        const formData = new FormData()
                        formData.append("file", file)
                        
                        try {
                          const res = await fetch("/api/backup/import", { method: "POST", body: formData })
                          const data = await res.json()
                          if (data.success) {
                            alert("Sistem başarıyla geri yüklendi! Lütfen sayfayı yenileyin veya tekrar giriş yapın.")
                            window.location.reload()
                          } else {
                            alert("Yükleme hatası: " + data.error)
                          }
                        } catch (err) {
                          alert("Dosya yüklenemedi. Formatı kontrol edin.")
                        }
                        
                        e.target.value = ""
                      }}
                    />
                  </label>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  )
}
