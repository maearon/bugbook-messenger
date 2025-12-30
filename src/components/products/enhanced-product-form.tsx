"use client"

import { useEffect, useState } from "react"

export function LoadingDots() {
  const [dots, setDots] = useState(".")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "." : prev + "."))
    }, 500) // đổi tốc độ tại đây (ms)

    return () => clearInterval(interval)
  }, [])

  return <>{dots}</>
}
