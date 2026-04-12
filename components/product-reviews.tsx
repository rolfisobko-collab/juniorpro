"use client"

import { useEffect, useState } from "react"
import { Star, Pencil, Trash2, Loader2, LogIn } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useTranslation } from "@/lib/i18n/translation-provider"
import Link from "next/link"

interface ReviewUser {
  id: string
  name: string
  avatar: string | null
}

interface Review {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  user: ReviewUser
}

interface ProductReviewsProps {
  productId: string
}

function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: {
  value: number
  onChange?: (v: number) => void
  readOnly?: boolean
  size?: "sm" | "md" | "lg"
}) {
  const [hovered, setHovered] = useState(0)
  const sz = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-5 w-5"
  const active = hovered || value

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(i)}
          onMouseEnter={() => !readOnly && setHovered(i)}
          onMouseLeave={() => !readOnly && setHovered(0)}
          className={readOnly ? "cursor-default" : "cursor-pointer transition-transform hover:scale-110"}
        >
          <Star
            className={`${sz} transition-colors ${
              i <= active
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-4 text-right text-gray-500 text-xs">{label}</span>
      <Star className="h-3 w-3 fill-amber-400 text-amber-400 flex-shrink-0" />
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-right text-xs text-gray-400">{count}</span>
    </div>
  )
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [reviews, setReviews] = useState<Review[]>([])
  const [avg, setAvg] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState("")
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`)
      const data = await res.json()
      setReviews(data.reviews || [])
      setAvg(data.avg || 0)
      setTotal(data.total || 0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchReviews() }, [productId])

  useEffect(() => {
    if (user && reviews.length > 0) {
      const mine = reviews.find((r) => r.user.id === user.id)
      if (mine) {
        setMyRating(mine.rating)
        setMyComment(mine.comment || "")
        setEditing(false)
      }
    }
  }, [reviews, user])

  const myReview = user ? reviews.find((r) => r.user.id === user.id) : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!myRating) { setError("Seleccioná una puntuación"); return }
    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: myRating, comment: myComment }),
        credentials: "include",
      })
      if (!res.ok) { const d = await res.json(); setError(d.error || "Error"); return }
      setEditing(false)
      await fetchReviews()
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Eliminás tu reseña?")) return
    setSubmitting(true)
    try {
      await fetch(`/api/products/${productId}/reviews`, { method: "DELETE", credentials: "include" })
      setMyRating(0)
      setMyComment("")
      await fetchReviews()
    } finally {
      setSubmitting(false)
    }
  }

  // Distribución por estrellas
  const dist = [5, 4, 3, 2, 1].map((s) => ({
    label: String(s),
    count: reviews.filter((r) => r.rating === s).length,
  }))

  return (
    <div className="mt-16 lg:mt-20 border-t border-gray-100 pt-12">
      <div className="mb-8">
        <p className="text-xs font-bold text-[#009FE3] uppercase tracking-widest mb-1">{t('Reviews')}</p>
        <h2 className="text-2xl font-bold text-gray-900">{t('Rating')}</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-10">

          {/* Panel izquierdo: resumen + formulario */}
          <div className="space-y-6">
            {/* Promedio */}
            <div className="bg-gray-50 rounded-2xl p-6 text-center">
              <p className="text-6xl font-black text-gray-900 leading-none">{avg > 0 ? avg.toFixed(1) : "—"}</p>
              <div className="flex justify-center mt-2 mb-1">
                <StarRating value={Math.round(avg)} readOnly size="sm" />
              </div>
              <p className="text-sm text-gray-400">{total} {t('Product reviews')}</p>
            </div>

            {/* Barras distribución */}
            {total > 0 && (
              <div className="space-y-1.5 px-1">
                {dist.map((d) => (
                  <RatingBar key={d.label} label={d.label} count={d.count} total={total} />
                ))}
              </div>
            )}

            {/* Formulario / estado */}
            <div className="border border-gray-100 rounded-2xl p-5">
              {!user ? (
                <div className="text-center space-y-3">
                  <p className="text-sm text-gray-500">Iniciá sesión para dejar tu reseña</p>
                  <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 bg-[#009FE3] hover:bg-[#0088c7] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Iniciar sesión
                  </Link>
                </div>
              ) : myReview && !editing ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Tu reseña</p>
                  <StarRating value={myReview.rating} readOnly size="md" />
                  {myReview.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed">{myReview.comment}</p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-[#009FE3] transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Editar
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={submitting}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Eliminar
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    {myReview ? "Editar reseña" : "Dejá tu reseña"}
                  </p>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Puntuación</p>
                    <StarRating value={myRating} onChange={setMyRating} size="lg" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-gray-400">Comentario (opcional)</p>
                    <textarea
                      value={myComment}
                      onChange={(e) => setMyComment(e.target.value)}
                      placeholder="¿Qué te pareció el producto?"
                      rows={3}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-[#009FE3]/30 focus:border-[#009FE3] transition-all"
                    />
                  </div>
                  {error && <p className="text-xs text-red-500">{error}</p>}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 bg-[#009FE3] hover:bg-[#0088c7] disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {submitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {submitting ? "Guardando..." : "Publicar"}
                    </button>
                    {editing && (
                      <button
                        type="button"
                        onClick={() => setEditing(false)}
                        className="px-4 py-2.5 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Lista de reviews */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-2xl">
                <Star className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Todavía no hay reseñas</p>
                <p className="text-gray-400 text-sm mt-1">Sé el primero en opinar sobre este producto</p>
              </div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-full bg-[#009FE3]/10 flex items-center justify-center flex-shrink-0 text-[#009FE3] font-bold text-sm">
                      {review.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-900">{review.user.name}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(review.createdAt).toLocaleDateString("es-PY", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="mt-1 mb-2">
                        <StarRating value={review.rating} readOnly size="sm" />
                      </div>
                      {review.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
