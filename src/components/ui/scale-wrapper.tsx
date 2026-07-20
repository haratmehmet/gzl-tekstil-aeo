"use client"

import React, { useRef, useState, useEffect } from "react"

interface ScaleWrapperProps {
  children: React.ReactNode
  formWidth: number // Formun gerçek piksel genişliği
}

/**
 * Formu mobil ekranlarda otomatik olarak küçülterek sığdırır.
 * Masaüstünde hiçbir değişiklik yapmaz.
 */
export function ScaleWrapper({ children, formWidth }: ScaleWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const calculate = () => {
      if (!containerRef.current) return
      const containerWidth = containerRef.current.offsetWidth
      const newScale = containerWidth < formWidth
        ? containerWidth / formWidth
        : 1
      setScale(newScale)
    }

    calculate()
    const ro = new ResizeObserver(calculate)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [formWidth])

  return (
    <div ref={containerRef} className="w-full overflow-hidden">
      <div
        style={{
          transformOrigin: "top left",
          transform: `scale(${scale})`,
          width: scale < 1 ? `${(1 / scale) * 100}%` : "100%",
          height: scale < 1 ? `calc(${scale} * 100%)` : "auto",
        }}
      >
        {children}
      </div>
      {/* Gerçek yüksekliği ayarlamak için spacer */}
      {scale < 1 && (
        <div
          style={{
            marginTop: `calc((${scale} - 1) * 100%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </div>
  )
}
