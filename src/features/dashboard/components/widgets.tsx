"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp,
  Warehouse,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet
} from "lucide-react"

interface DashboardWidgetsProps {
  initialData?: {
    totalTakipFoyu: number
    totalMt: string
    activeSeasonsCount: number
    recentTransactions?: any[]
    fabricTypes?: any[]
  }
}

export function DashboardWidgets({ initialData }: DashboardWidgetsProps) {
  const stats = [
    {
      title: "Toplam Takip Föyü",
      value: initialData?.totalTakipFoyu?.toString() || "0",
      description: "Sistemdeki toplam föy sayısı",
      change: "Sürekli güncel",
      trend: "neutral",
      icon: FileSpreadsheet,
      color: "sky",
    },
    {
      title: "Kumaş Deposu (Mt)",
      value: `${initialData?.totalMt || "0"} mt`,
      description: "Kumaş deposu net toplam metraj",
      change: "Sürekli güncel",
      trend: "neutral",
      icon: Warehouse,
      color: "emerald",
    },
    {
      title: "Aktif Sezonlar",
      value: `${initialData?.activeSeasonsCount || "0"} Sezon`,
      description: "Üretim takip edilen sezonlar",
      change: "Değişim yok",
      trend: "neutral",
      icon: TrendingUp,
      color: "indigo",
    }
  ]

  const recentTransactions = initialData?.recentTransactions || []
  const fabricTypes = initialData?.fabricTypes || []

  return (
    <div className="space-y-6 select-none">
      {/* Top statistics grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          const bgColors: any = {
            sky: "bg-sky-50 border-sky-200 shadow-sky-100/50 hover:border-sky-300",
            emerald: "bg-emerald-50 border-emerald-200 shadow-emerald-100/50 hover:border-emerald-300",
            indigo: "bg-indigo-50 border-indigo-200 shadow-indigo-100/50 hover:border-indigo-300",
          }
          const iconColors: any = {
            sky: "bg-sky-100 text-sky-700",
            emerald: "bg-emerald-100 text-emerald-700",
            indigo: "bg-indigo-100 text-indigo-700",
          }

          return (
            <Card
              key={stat.title}
              className={`border transition-all duration-300 overflow-hidden ${bgColors[stat.color]}`}
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <span className="text-xs font-extrabold text-neutral-700 uppercase tracking-wider">
                  {stat.title}
                </span>
                <div className={`p-2 rounded-lg ${iconColors[stat.color]}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </CardHeader>
              <CardContent className="pt-1">
                <div className="text-2xl font-black text-neutral-900 tracking-tight">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${iconColors[stat.color]}`}>
                    {stat.change}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-semibold truncate">
                    {stat.description}
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent actions card */}
        <Card className="col-span-2 border-neutral-200/80 bg-white shadow-sm shadow-neutral-100/30">
          <CardHeader>
            <CardTitle className="text-base font-bold text-neutral-800">
              Son İşlemler
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              Sisteme eklenen son 5 kumaş takip föyü.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50">
                    <th className="px-6 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">Kumaş Kodu</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">Kullanım Türü</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">Miktar</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider">Tarih</th>
                    <th className="px-6 py-3.5 text-xs font-bold text-neutral-500 uppercase tracking-wider text-right">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {recentTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-neutral-50/30 transition-colors duration-150">
                      <td className="px-6 py-4 text-xs font-semibold text-neutral-800">{tx.fabric}</td>
                      <td className="px-6 py-4 text-xs">
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold bg-neutral-100 text-neutral-700 uppercase">
                          {tx.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-neutral-600">{tx.amount}</td>
                      <td className="px-6 py-4 text-xs text-neutral-400 font-medium">{tx.date}</td>
                      <td className="px-6 py-4 text-xs text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentTransactions.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-xs text-neutral-500">
                        Henüz işlem bulunmuyor.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Top Fabric Categories Card */}
        <Card className="border-neutral-200/80 bg-white shadow-sm shadow-neutral-100/30">
          <CardHeader>
            <CardTitle className="text-base font-bold text-neutral-800">
              Kumaş Kullanım Dağılımı
            </CardTitle>
            <CardDescription className="text-xs text-neutral-400">
              Takip föylerine girilen kullanım yerleri (Ana kumaş, Astar vb.) oranları.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fabricTypes.map((type: any, index: number) => {
              const colors = ["bg-sky-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500", "bg-neutral-800"]
              const colorClass = colors[index % colors.length]
              
              return (
                <div key={type.label} className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                    <span className="uppercase">{type.label} <span className="text-[10px] font-normal text-neutral-400 ml-1">({type.count} Föy)</span></span>
                    <span>%{type.percentage}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-100 overflow-hidden">
                    <div className={`h-full ${colorClass} rounded-full transition-all duration-1000`} style={{ width: `${type.percentage}%` }} />
                  </div>
                </div>
              )
            })}
            
            {fabricTypes.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-500">
                Henüz veri yok.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
