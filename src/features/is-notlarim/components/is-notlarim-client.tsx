"use client"

import React, { useState, useEffect } from "react"
import { getNotes, saveNotes } from "../actions"
import { Plus, Save, Trash2, Loader2, StickyNote } from "lucide-react"

type NoteRow = {
  id: string
  icerik: string
  renk: string // "white" | "red" | "green"
}

export function IsNotlarimClient() {
  const [notes, setNotes] = useState<NoteRow[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    loadNotes()
  }, [])

  useEffect(() => {
    // Automatically adjust textarea heights when notes load or change initially
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(t => {
      t.style.height = 'auto';
      t.style.height = `${t.scrollHeight}px`;
    });
  }, [notes.length]);

  const loadNotes = async () => {
    setIsLoading(true)
    const res = await getNotes()
    if (res.success && res.data) {
      if (res.data.length === 0) {
        // start with empty note
        setNotes([{ id: Math.random().toString(), icerik: "", renk: "white" }])
      } else {
        setNotes(res.data.map((n: any) => ({
          id: n.id,
          icerik: n.icerik,
          renk: n.renk
        })))
      }
    } else {
      setError(res.error || "Notlar yüklenemedi.")
    }
    setIsLoading(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError("")
    // filter out totally empty rows
    const toSave = notes
      // .filter(n => n.icerik.trim() !== "") // optional: remove empty rows on save
      .map((n, idx) => ({
        icerik: n.icerik,
        renk: n.renk,
        sira: idx
      }))

    const res = await saveNotes(toSave)
    if (res.success) {
      alert("Notlar başarıyla kaydedildi.")
      loadNotes()
    } else {
      setError(res.error || "Kaydedilirken hata oluştu. Yetkiniz olmayabilir.")
    }
    setIsSaving(false)
  }

  const addRow = () => {
    setNotes([...notes, { id: Math.random().toString(), icerik: "", renk: "white" }])
  }

  const removeRow = (id: string) => {
    setNotes(notes.filter(n => n.id !== id))
  }

  const updateRow = (id: string, field: "icerik" | "renk", value: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n))
  }

  const getColorClass = (renk: string) => {
    switch (renk) {
      case "red": return "bg-rose-100 focus:bg-rose-50 text-rose-900 border-rose-200"
      case "green": return "bg-emerald-100 focus:bg-emerald-50 text-emerald-900 border-emerald-200"
      default: return "bg-white focus:bg-neutral-50 text-neutral-800 border-transparent"
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-24">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 sm:px-6 rounded-2xl shadow-sm border border-neutral-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-100 text-sky-600 rounded-xl">
            <StickyNote className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-neutral-800">İş Notlarım</h1>
            <p className="text-xs text-neutral-500 font-medium mt-0.5">Önemli notlarınızı alıp renklendirebilirsiniz</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {error && <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-1 rounded-md">{error}</span>}
          <button
            onClick={addRow}
            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" /> Satır Ekle
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm shadow-emerald-200 disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Kaydet
          </button>
        </div>
      </div>

      <div className="bg-[#f9f5ec] p-6 sm:p-10 rounded-2xl shadow-inner border border-[#e4dfd4] relative min-h-[500px]">
        {/* Notebook styling background lines */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 rounded-2xl"
          style={{
            backgroundImage: "repeating-linear-gradient(transparent, transparent 39px, #64748b 40px)",
            backgroundPosition: "0 -10px"
          }}
        />
        
        {/* Notebook red left margin line */}
        <div className="absolute left-6 sm:left-12 top-0 bottom-0 w-0.5 bg-red-400 opacity-40 pointer-events-none" />

        <div className="relative z-10 pl-4 sm:pl-10 space-y-[0px] pt-1">
          {notes.map((note) => (
            <div key={note.id} className="flex items-start gap-2 group min-h-[40px] h-auto">
              <textarea
                value={note.icerik}
                onChange={(e) => {
                  e.target.style.height = "auto";
                  e.target.style.height = `${e.target.scrollHeight}px`;
                  updateRow(note.id, "icerik", e.target.value);
                }}
                rows={1}
                placeholder="Buraya notunuzu yazın..."
                className={`flex-1 min-h-[40px] resize-none overflow-hidden px-3 text-[15px] rounded outline-none transition-colors font-medium ${getColorClass(note.renk)} shadow-sm placeholder:text-neutral-400 placeholder:font-normal`}
                style={{ lineHeight: "40px" }}
              />
              
              <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => updateRow(note.id, "renk", "white")}
                  className={`w-6 h-6 rounded-full border-2 ${note.renk === "white" ? "border-neutral-800 scale-110" : "border-neutral-200 bg-white"} hover:scale-110 transition-transform shadow-sm`}
                  title="Beyaz"
                />
                <button
                  onClick={() => updateRow(note.id, "renk", "red")}
                  className={`w-6 h-6 rounded-full border-2 ${note.renk === "red" ? "border-rose-800 scale-110 bg-rose-200" : "border-rose-200 bg-rose-100"} hover:scale-110 transition-transform shadow-sm`}
                  title="Kırmızı"
                />
                <button
                  onClick={() => updateRow(note.id, "renk", "green")}
                  className={`w-6 h-6 rounded-full border-2 ${note.renk === "green" ? "border-emerald-800 scale-110 bg-emerald-200" : "border-emerald-200 bg-emerald-100"} hover:scale-110 transition-transform shadow-sm`}
                  title="Yeşil"
                />
                
                <div className="w-px h-5 bg-neutral-300 mx-1" />
                
                <button
                  onClick={() => removeRow(note.id)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Satırı Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {notes.length === 0 && (
            <p className="text-neutral-400 text-sm mt-4 italic pl-3">Henüz bir not eklenmemiş. "Satır Ekle" butonunu kullanabilirsiniz.</p>
          )}
        </div>
      </div>
    </div>
  )
}
