"use client"

// import React from "react"
// import Image from "next/image"
import { Bug, Loader2, MessageCircle } from "lucide-react"

export function Loading() {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      data-auto-id="loading-screen"
    >
      <div className="flex flex-col items-center justify-center w-full transform -translate-y-20 ">
        <div className="relative w-28 h-28 animate-pulse">
          {/* <Image
            src="/logo.png"
            alt="Loading"
            fill
            className="object-contain brightness-0 opacity-10"
            priority
          /> */}
          <div className="flex h-full w-full items-center justify-center">
            <Bug className="size-28 text-[#22C55E]" />
            <Loader2 className="size-28 animate-spin text-purple-600" />
            <MessageCircle className="size-28 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )
}