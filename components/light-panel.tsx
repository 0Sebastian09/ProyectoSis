"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sun, Cloud, Sunset, Moon } from "lucide-react"
import { useEffect, useState } from "react"

interface LightPanelProps {
  luz: number
}

export function LightPanel({ luz }: LightPanelProps) {
  const [displayLight, setDisplayLight] = useState(luz)

  useEffect(() => {
    setDisplayLight(luz)
  }, [luz])

  const getLightStatus = () => {
    if (luz < 150) return { text: "Luz Muy Intensa", icon: "🔆", color: "bg-yellow-500", Icon: Sun }
    if (luz < 300) return { text: "Día Soleado", icon: "☀️", color: "bg-yellow-400", Icon: Sun }
    if (luz < 600) return { text: "Día Nublado", icon: "⛅", color: "bg-gray-400", Icon: Cloud }
    if (luz < 1000) return { text: "Atardecer/Amanecer", icon: "🌆", color: "bg-orange-400", Icon: Sunset }
    return { text: "Noche/Muy Oscuro", icon: "🌙", color: "bg-indigo-600", Icon: Moon }
  }

  const status = getLightStatus()
  const IconComponent = status.Icon

  return (
    <Card className="pixel-border bg-card/90 backdrop-blur-sm hover:scale-105 transition-transform">
      <CardHeader>
        <CardTitle className="text-base md:text-lg pixel-text flex items-center gap-2">☀️ LUMINOSIDAD</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Valor analógico */}
        <div className="text-center p-4 rounded-lg bg-secondary/10">
          <div className="text-sm text-muted-foreground mb-2">Valor Analógico</div>
          <div className="text-4xl font-bold pixel-text animate-count-up">{Math.floor(displayLight)}</div>
          <div className="text-xs text-muted-foreground mt-1">/ 4095</div>
        </div>

        {/* Estado interpretado */}
        <div className="flex flex-col items-center gap-3 p-4 rounded-lg bg-muted">
          <IconComponent className="w-12 h-12" />
          <span className="text-4xl">{status.icon}</span>
          <Badge className={`${status.color} text-white pixel-border text-xs`}>{status.text}</Badge>
        </div>

        {/* Barra de progreso invertida (menos luz = más oscuro) */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Brillante</span>
            <span>Oscuro</span>
          </div>
          <div className="h-3 bg-gradient-to-r from-yellow-300 via-orange-400 to-indigo-900 rounded-full overflow-hidden relative">
            <div
              className="absolute right-0 h-full bg-black/40 transition-all duration-500"
              style={{ width: `${100 - Math.min((luz / 4095) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Indicador de zona */}
        <div className="grid grid-cols-5 gap-1 text-xs text-center">
          <div className={`p-1 rounded ${luz < 150 ? "bg-yellow-500 text-white" : "bg-muted"}`}>🔆</div>
          <div className={`p-1 rounded ${luz >= 150 && luz < 300 ? "bg-yellow-400 text-white" : "bg-muted"}`}>☀️</div>
          <div className={`p-1 rounded ${luz >= 300 && luz < 600 ? "bg-gray-400 text-white" : "bg-muted"}`}>⛅</div>
          <div className={`p-1 rounded ${luz >= 600 && luz < 1000 ? "bg-orange-400 text-white" : "bg-muted"}`}>🌆</div>
          <div className={`p-1 rounded ${luz >= 1000 ? "bg-indigo-600 text-white" : "bg-muted"}`}>🌙</div>
        </div>
      </CardContent>
    </Card>
  )
}
