"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { loginUser } from "@/features/auth/actions"

export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState("")

  const [companyName, setCompanyName] = React.useState("GZL TEKSTİL")
  const [logoUrl, setLogoUrl] = React.useState("/logo.png")

  React.useEffect(() => {
    import("@/features/ayarlar/actions").then(({ getSystemSettings }) => {
      getSystemSettings().then(res => {
        if (res.success && res.data) {
          if (res.data.companyName) setCompanyName(res.data.companyName)
          if (res.data.logoUrl) setLogoUrl(res.data.logoUrl)
        }
      })
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (!email || !password) {
        throw new Error("Lütfen tüm alanları doldurun.")
      }

      const res = await loginUser(email, password)
      
      if (!res.success) {
        throw new Error(res.error)
      }
      
      // Cookie is already set by the server action
      
      if (res.user?.role === "SUPER_ADMIN") {
        router.push("/ayarlar")
      } else {
        router.push("/")
      }
    } catch (err: any) {
      setError(err.message || "Giriş yapılamadı.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md border border-white/40 bg-white/40 backdrop-blur-xl shadow-2xl shadow-neutral-200/30 overflow-hidden rounded-3xl p-6 sm:p-8 select-none">
      {/* Brand logo header */}
      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="flex items-center justify-center p-3 bg-white/70 backdrop-blur-md rounded-2xl shadow-sm border border-white/50">
          <img
            src={logoUrl}
            alt="Logo"
            className="w-48 h-auto object-contain"
          />
        </div>
        <div className="space-y-1 text-center">
          <h2 className="text-xl font-bold tracking-tight text-neutral-800">
            {companyName} Operasyon Yönetim Sistemi
          </h2>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
            Yönetim Paneli Giriş Ekranı
          </p>
        </div>
      </div>

      {/* Form content */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-xl bg-red-50/50 backdrop-blur-sm p-3 text-xs font-semibold text-red-600 border border-red-100/80 animate-in fade-in-50 duration-200">
            {error}
          </div>
        )}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Kullanıcı Adı veya E-posta
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 border-white/40 focus-visible:ring-neutral-400 bg-white/60 backdrop-blur-sm shadow-sm focus:bg-white/80 transition-all duration-200"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Şifre
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 border-white/40 focus-visible:ring-neutral-400 bg-white/60 backdrop-blur-sm shadow-sm focus:bg-white/80 transition-all duration-200"
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 bg-neutral-900/90 hover:bg-neutral-900 text-white font-semibold rounded-xl shadow-md transition-all duration-200"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Giriş yapılıyor...
            </span>
          ) : (
            "Giriş Yap"
          )}
        </Button>
      </form>
    </Card>
  )
}
