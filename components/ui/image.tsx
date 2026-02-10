"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
  className?: string
}

export function Image({ fallback = "/placeholder.svg", className, ...props }: ImageProps) {
  const [error, setError] = useState(false)

  const handleError = () => {
    if (!error) {
      setError(true)
    }
  }

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gray-100 text-gray-400",
        "w-full h-full",
        className
      )}>
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    )
  }

  return (
    <img
      {...props}
      className={cn(className)}
      onError={handleError}
    />
  )
}
