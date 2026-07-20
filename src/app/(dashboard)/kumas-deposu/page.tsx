"use client"

import React, { useState } from "react"
import { Warehouse } from "lucide-react"
import { KumasDeposuList } from "@/features/kumas-deposu/components/kumas-deposu-list"
import { KumasDeposuForm } from "@/features/kumas-deposu/components/kumas-deposu-form"
import { KumasDeposuRecord } from "@/features/kumas-deposu/kumas-deposu-store"

export default function KumasDeposuPage() {
  const [activeRecord, setActiveRecord] = useState<KumasDeposuRecord | null>(null)

  return (
    <div className="space-y-6">
      {!activeRecord && (
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-800 flex items-center gap-2">
              <Warehouse className="h-6 w-6 text-sky-600" />
              Kumaş Deposu
            </h1>
            <p className="text-sm text-neutral-500 mt-1">Depodaki kumaşların metraj takibi ve kesim işlemleri.</p>
          </div>
        </div>
      )}

      {activeRecord ? (
        <KumasDeposuForm 
          record={activeRecord} 
          onClose={() => setActiveRecord(null)} 
        />
      ) : (
        <KumasDeposuList 
          onEdit={(record) => setActiveRecord(record)} 
        />
      )}
    </div>
  )
}
