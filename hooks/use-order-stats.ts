import { useEffect, useState } from "react"

interface OrderStats {
  pending: number
  processing: number
  shipped: number
  delivered: number
  total: number
}

export function useOrderStats() {
  const [stats, setStats] = useState<OrderStats>({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/orders/stats", {
          credentials: "include"
        })
        
        if (response.ok) {
          const data = await response.json()
          setStats(data.stats)
        }
      } catch (error) {
        console.error("Error fetching order stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading }
}
