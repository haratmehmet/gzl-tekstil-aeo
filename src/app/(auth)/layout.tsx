import * as React from "react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-50 via-neutral-100 to-neutral-200/50 p-4 antialiased relative overflow-hidden select-none">
      {/* Premium colored mesh gradient blobs behind the card for glassmorphism effect */}
      <div className="absolute top-[25%] left-[20%] w-[350px] h-[350px] rounded-full bg-cyan-300/20 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[25%] right-[20%] w-[400px] h-[400px] rounded-full bg-pink-300/15 blur-[100px] pointer-events-none" />
      
      {/* Clean weave patterns matching fabric theme */}
      <div className="absolute inset-0 opacity-[0.015] bg-[linear-gradient(to_right,#000000_1px,transparent_1px),linear-gradient(to_bottom,#000000_1px,transparent_1px)] bg-[size:32px_32px]" />

      <div className="relative z-10 w-full flex justify-center">
        {children}
      </div>
    </div>
  )
}
