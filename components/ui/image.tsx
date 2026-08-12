"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string
  className?: string
}

export function Image({ fallback = "/placeholder.svg", className, onError, ...props }: ImageProps) {
  const [error, setError] = useState(false)

  const handleError: React.ReactEventHandler<HTMLImageElement> = (event) => {
    if (!error) {
      setError(true)
    }
    onError?.(event)
  }

  return (
    <img
      {...props}
      src={error ? fallback : props.src}
      className={cn(className)}
      onError={handleError}
    />
  )
}
