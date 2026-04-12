"use client"

import type React from "react"
import { useEffect } from "react"

export default function PanelRootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.body.classList.add("panel-dark")
    document.documentElement.classList.add("panel-dark")
    return () => {
      document.body.classList.remove("panel-dark")
      document.documentElement.classList.remove("panel-dark")
    }
  }, [])

  return <>{children}</>
}
