"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PixelForest } from "@/components/pixel-forest"
import { ClimatePanel } from "@/components/climate-panel"
import { LightPanel } from "@/components/light-panel"
import { SeismicPanel } from "@/components/seismic-panel"
import { UniversityBadge } from "@/components/university-badge"
import { AlertTriangle } from "lucide-react"

export interface SensorData {
  temperatura: number
  humedad: number
  luz: number
  vibraciones: number
  alertaSismica: boolean
  timestamp: number
}

export default function ForestStation() {
  const [sensorData, setSensorData] = useState<SensorData>({
    temperatura: 25.0,
    humedad: 65.0,
    luz: 450,
    vibraciones: 0,
    alertaSismica: false,
    timestamp: Date.now(),
  })

  const [isConnected, setIsConnected] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const alertTimeoutRef = useRef<NodeJS.Timeout>()

  // 🔁 Leer datos desde la API /api/sensores (llenada por la ESP32)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/sensores", {
          cache: "no-store",
        })

        if (!res.ok) {
          console.error("Error al consultar /api/sensores:", res.status)
          setIsConnected(false)
          return
        }

        const json = await res.json()

        // Esperamos estructura: { ok: boolean, data: {...} }
        if (!json?.data) {
          // Si aún no ha llegado nada desde la ESP32
          setIsConnected(false)
          return
        }

        const data = json.data as SensorData

        const newData: SensorData = {
          temperatura: data.temperatura,
          humedad: data.humedad,
          luz: data.luz,
          vibraciones: data.vibraciones,
          alertaSismica: data.alertaSismica,
          // puedes usar el timestamp de la ESP32 o del servidor
          timestamp: Date.now(),
        }

        setSensorData(newData)
        setIsConnected(true)

        // Manejar alerta sísmica
        if (newData.alertaSismica) {
          setShowAlert(true)
          if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current)
          alertTimeoutRef.current = setTimeout(() => {
            setShowAlert(false)
          }, 10000) // 10 segundos
        }
      } catch (err) {
        console.error("Error al obtener datos de la API:", err)
        setIsConnected(false)
      }
    }

    // Primera lectura inmediata
    fetchData()

    // Polling cada 1 segundo
    const interval = setInterval(fetchData, 1000)

    return () => {
      clearInterval(interval)
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current)
    }
  }, [])

  return (
    <div className={`min-h-screen relative ${showAlert ? "animate-shake" : ""}`}>
      {/* Fondo animado estilo 8-bits */}
      <PixelForest alertActive={showAlert} />

      {/* Overlay para mejorar legibilidad */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/30 to-background/60 pointer-events-none" />

      {/* Contenido principal */}
      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8">
        {/* Header */}
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h1 className="text-xl md:text-3xl font-bold pixel-text text-primary mb-2">
                🌲 ESTACIÓN FORESTAL
              </h1>
              <p className="text-xs md:text-sm text-muted-foreground">
                Sistema de Monitoreo Ambiental en Tiempo Real
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Badge
                variant={isConnected ? "default" : "destructive"}
                className="pixel-border text-xs"
              >
                {isConnected ? "🟢 CONECTADO A API" : "🔴 SIN DATOS DE LA ESP32"}
              </Badge>
              <UniversityBadge />
            </div>
          </div>
        </header>

        {/* Alerta Sísmica */}
        {showAlert && (
          <Alert
            variant="destructive"
            className="mb-6 pixel-border animate-pulse-glow bg-destructive/90 text-destructive-foreground border-destructive"
          >
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-sm md:text-base pixel-text">
              ⚠️ ALERTA SÍSMICA - BUSQUE LUGAR SEGURO
            </AlertDescription>
          </Alert>
        )}

        {/* Paneles de Monitoreo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <ClimatePanel
            temperatura={sensorData.temperatura}
            humedad={sensorData.humedad}
          />

          <LightPanel luz={sensorData.luz} />

          <SeismicPanel
            vibraciones={sensorData.vibraciones}
            alertaSismica={sensorData.alertaSismica}
          />
        </div>

        {/* Footer con instrucciones */}
        <Card className="mt-6 p-4 bg-card/80 backdrop-blur-sm pixel-border">
          <h3 className="text-sm font-bold mb-2 pixel-text">📡 Estado de Conexión</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {isConnected
              ? "✓ Recibiendo datos en tiempo real desde la API /api/sensores (alimentada por la ESP32)."
              : "⚠ No se están recibiendo datos desde la API. Verifica que la ESP32 esté conectada a WiFi y enviando datos al endpoint /api/sensores."}
          </p>
        </Card>
      </div>
    </div>
  )
}
