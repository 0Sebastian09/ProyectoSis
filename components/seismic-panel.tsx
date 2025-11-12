"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Activity, AlertTriangle, CheckCircle2 } from "lucide-react"
import { useEffect, useState } from "react"

interface SeismicPanelProps {
  vibraciones: number
  alertaSismica: boolean
}

export function SeismicPanel({ vibraciones, alertaSismica }: SeismicPanelProps) {
  const [displayVibrations, setDisplayVibrations] = useState(vibraciones)
  const [totalDetections, setTotalDetections] = useState(0)

  useEffect(() => {
    setDisplayVibrations(vibraciones)
    if (vibraciones > 0) {
      setTotalDetections((prev) => prev + vibraciones)
    }
  }, [vibraciones])

  return (
    <Card
      className={`pixel-border bg-card/90 backdrop-blur-sm hover:scale-105 transition-transform ${alertaSismica ? "border-destructive animate-pulse-glow" : ""}`}
    >
      <CardHeader>
        <CardTitle className="text-base md:text-lg pixel-text flex items-center gap-2">📊 DETECTOR SÍSMICO</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estado actual */}
        <div className={`text-center p-4 rounded-lg ${alertaSismica ? "bg-destructive/20" : "bg-primary/10"}`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            {alertaSismica ? (
              <>
                <AlertTriangle className="w-6 h-6 text-destructive animate-pulse" />
                <Badge variant="destructive" className="pixel-border">
                  ⚠️ ALERTA ACTIVA
                </Badge>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 text-primary" />
                <Badge variant="default" className="pixel-border">
                  ✓ NORMAL
                </Badge>
              </>
            )}
          </div>

          <div className="text-sm text-muted-foreground mb-1">Vibraciones Actuales</div>
          <div className={`text-5xl font-bold pixel-text ${alertaSismica ? "text-destructive animate-shake" : ""}`}>
            {displayVibrations}
          </div>
        </div>

        {/* Contador total */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            <span className="text-sm font-medium">Total Detectado</span>
          </div>
          <span className="text-xl font-bold pixel-text">{totalDetections}</span>
        </div>

        {/* Indicador de sensibilidad */}
        <div className="space-y-2">
          <div className="text-xs text-muted-foreground text-center">Umbral de Alerta: ≥3 vibraciones</div>
          <div className="h-4 bg-muted rounded-full overflow-hidden flex">
            <div className="flex-1 bg-primary" />
            <div className="flex-1 bg-accent" />
            <div className="flex-1 bg-destructive" />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Normal</span>
            <span>Moderado</span>
            <span>Alerta</span>
          </div>
        </div>

        {/* Alerta de emergencia */}
        {alertaSismica && (
          <Alert variant="destructive" className="pixel-border animate-pulse">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs pixel-text">Posible sismo detectado</AlertDescription>
          </Alert>
        )}

        {/* Indicador visual de actividad */}
        <div className="grid grid-cols-10 gap-1">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`h-12 rounded transition-all ${
                i < displayVibrations ? (alertaSismica ? "bg-destructive animate-pulse" : "bg-accent") : "bg-muted"
              }`}
              style={{
                height: `${20 + i * 4}px`,
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
