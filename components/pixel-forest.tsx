"use client"

import { useEffect, useState } from "react"

interface PixelForestProps {
  alertActive: boolean
}

type TimeOfDay = "morning" | "afternoon" | "night"

export function PixelForest({ alertActive }: PixelForestProps) {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>("morning")
  const [stars, setStars] = useState<{ x: number; y: number; delay: number }[]>([])

  useEffect(() => {
    // Determinar hora del día
    const updateTimeOfDay = () => {
      const hour = new Date().getHours()
      if (hour >= 6 && hour < 12) {
        setTimeOfDay("morning")
      } else if (hour >= 12 && hour < 18) {
        setTimeOfDay("afternoon")
      } else {
        setTimeOfDay("night")
      }
    }

    updateTimeOfDay()
    const interval = setInterval(updateTimeOfDay, 60000) // Actualizar cada minuto

    // Generar estrellas para la noche
    const newStars = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 60,
      delay: Math.random() * 2,
    }))
    setStars(newStars)

    return () => clearInterval(interval)
  }, [])

  const getSkyGradient = () => {
    if (alertActive) {
      return "from-red-900 via-red-700 to-red-600"
    }

    switch (timeOfDay) {
      case "morning":
        return "from-sky-400 via-sky-300 to-sky-200"
      case "afternoon":
        return "from-orange-400 via-amber-300 to-yellow-200"
      case "night":
        return "from-indigo-900 via-blue-900 to-slate-800"
    }
  }

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Cielo con gradiente según hora */}
      <div className={`absolute inset-0 bg-gradient-to-b ${getSkyGradient()} transition-colors duration-2000`} />

      {/* Estrellas (solo de noche) */}
      {timeOfDay === "night" && !alertActive && (
        <div className="absolute inset-0">
          {stars.map((star, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                animationDelay: `${star.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Sol (mañana/tarde) */}
      {(timeOfDay === "morning" || timeOfDay === "afternoon") && !alertActive && (
        <div
          className={`absolute ${timeOfDay === "morning" ? "top-16 right-16" : "top-32 right-12"} w-16 h-16 rounded-full transition-all duration-2000`}
          style={{
            background: timeOfDay === "morning" ? "#FDB813" : "#FF6B35",
            boxShadow: `0 0 40px ${timeOfDay === "morning" ? "#FDB813" : "#FF6B35"}`,
          }}
        />
      )}

      {/* Luna (noche) */}
      {timeOfDay === "night" && !alertActive && (
        <div
          className="absolute top-16 right-16 w-12 h-12 rounded-full bg-gray-200"
          style={{
            boxShadow: "0 0 30px rgba(255, 255, 255, 0.5)",
          }}
        />
      )}

      {/* Nubes animadas */}
      {!alertActive && (
        <>
          <div
            className="absolute top-20 w-32 h-8 bg-white/40 rounded-full animate-slide-cloud"
            style={{ animationDuration: "60s", animationDelay: "0s" }}
          />
          <div
            className="absolute top-32 w-40 h-10 bg-white/30 rounded-full animate-slide-cloud"
            style={{ animationDuration: "80s", animationDelay: "20s" }}
          />
          <div
            className="absolute top-44 w-36 h-9 bg-white/35 rounded-full animate-slide-cloud"
            style={{ animationDuration: "70s", animationDelay: "40s" }}
          />
        </>
      )}

      {/* Montañas de fondo (pixel art) */}
      <svg className="absolute bottom-0 w-full h-64 opacity-40" viewBox="0 0 1200 300" preserveAspectRatio="none">
        <polygon
          points="0,300 0,150 200,80 400,150 600,100 800,160 1000,120 1200,180 1200,300"
          fill="currentColor"
          className="text-primary/60"
        />
        <polygon
          points="0,300 100,200 300,180 500,220 700,200 900,240 1100,220 1200,260 1200,300"
          fill="currentColor"
          className="text-primary/80"
        />
      </svg>

      {/* Árboles pixel art en primer plano */}
      <div className="absolute bottom-0 w-full h-48 flex items-end justify-around px-8">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="animate-float"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + (i % 3)}s`,
            }}
          >
            <Tree size={40 + (i % 3) * 15} />
          </div>
        ))}
      </div>

      {/* Efecto de niebla/atmosfera */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-transparent to-transparent" />
    </div>
  )
}

function Tree({ size }: { size: number }) {
  return (
    <svg width={size} height={size * 1.5} viewBox="0 0 40 60">
      {/* Tronco */}
      <rect x="16" y="40" width="8" height="20" fill="#8B4513" />
      {/* Copa - nivel 3 */}
      <polygon points="20,10 10,25 30,25" fill="#2D5016" />
      {/* Copa - nivel 2 */}
      <polygon points="20,18 8,32 32,32" fill="#3A6B23" />
      {/* Copa - nivel 1 */}
      <polygon points="20,26 6,42 34,42" fill="#4A8030" />
    </svg>
  )
}
