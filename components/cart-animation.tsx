"use client"

import { useEffect, useRef, useState } from "react"
import type { UnifiedProduct } from "@/lib/product-types"

interface CartAnimationProps {
  product: UnifiedProduct
  trigger: { x: number; y: number } | false
  onComplete?: () => void
}

const CONFETTI_COLORS = ["#009FE3", "#FFD700", "#FF6B6B", "#6BCB77", "#FF9F1C", "#fff"]

function spawnConfetti(x: number, y: number) {
  const count = 18
  for (let i = 0; i < count; i++) {
    const el = document.createElement("div")
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    const size = 6 + Math.random() * 6
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
    const dist = 50 + Math.random() * 60
    const tx = Math.cos(angle) * dist
    const ty = Math.sin(angle) * dist - 30

    el.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      animation: confetti-fly 0.7s ease-out forwards;
      --tx: ${tx}px;
      --ty: ${ty}px;
    `
    document.body.appendChild(el)
    setTimeout(() => el.remove(), 800)
  }
}

// Inject confetti keyframe once
if (typeof document !== "undefined") {
  if (!document.getElementById("confetti-style")) {
    const s = document.createElement("style")
    s.id = "confetti-style"
    s.textContent = `
      @keyframes confetti-fly {
        0%   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.3) rotate(360deg); }
      }
      @keyframes fly-to-cart {
        0%   { transform: translate(-50%, -50%) scale(1);   opacity: 1; }
        60%  { opacity: 1; }
        100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(0.15); opacity: 0; }
      }
    `
    document.head.appendChild(s)
  }
}

export function CartAnimation({ product, trigger, onComplete }: CartAnimationProps) {
  const [anim, setAnim] = useState<{ x: number; y: number; dx: number; dy: number } | null>(null)

  useEffect(() => {
    if (!trigger) return

    // Find visible cart button
    let cartRect: DOMRect | null = null
    document.querySelectorAll("[data-cart-button]").forEach((btn) => {
      const r = btn.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) cartRect = r
    })

    const endX = cartRect ? (cartRect as DOMRect).left + (cartRect as DOMRect).width / 2 : window.innerWidth - 50
    const endY = cartRect ? (cartRect as DOMRect).top + (cartRect as DOMRect).height / 2 : 50

    setAnim({
      x: trigger.x,
      y: trigger.y,
      dx: endX - trigger.x,
      dy: endY - trigger.y,
    })

    // Spawn confetti at cart position when image arrives (~700ms)
    const t1 = setTimeout(() => {
      spawnConfetti(endX, endY)
    }, 680)

    const t2 = setTimeout(() => {
      setAnim(null)
      onComplete?.()
    }, 800)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [trigger])

  if (!anim) return null

  return (
    <div
      className="fixed pointer-events-none z-[9999] w-14 h-14 rounded-xl overflow-hidden shadow-xl border-2 border-white bg-white"
      style={{
        left: anim.x,
        top: anim.y,
        animation: "fly-to-cart 0.75s cubic-bezier(0.4, 0, 0.2, 1) forwards",
        ["--dx" as any]: `${anim.dx}px`,
        ["--dy" as any]: `${anim.dy}px`,
      }}
    >
      <img
        src={product.image || "/placeholder.svg"}
        alt={product.name}
        className="w-full h-full object-contain p-1"
      />
    </div>
  )
}
