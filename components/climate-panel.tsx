"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Thermometer, Droplets } from "lucide-react"
import { useEffect, useState } from "react"

interface ClimatePanelProps {
  temperatura: number
  humedad: number
}

export function ClimatePanel({ temperatura, humedad }: ClimatePanelProps) {
  const [displayTemp, setDisplayTemp] = useState(temperatura)
  const [displayHumidity, setDisplayHumidity] = useState(humedad)

  useEffect(() => {
    setDisplayTemp(temperatura)
  }, [temperatura])

  useEffect(() => {
    setDisplayHumidity(humedad)
  }, [humedad])

  const getTemperatureIcon = () => {
    if (temperatura > 30) return "🔥"
    if (temperatura > 25) return "☀️"
    if (temperatura > 20) return "🌤️"
    return "❄️"
  }

  const getHumidityIcon = () => {
    if (humedad > 70) return "💧"
    if (humedad > 50) return "💦"
    return "🌫️"
  }

  return (
    <Card className="pixel-border bg-card/90 backdrop-blur-sm hover:scale-105 transition-transform">
      <CardHeader>
        <CardTitle className="text-base md:text-lg pixel-text flex items-center gap-2">🌡️ CLIMA</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperatura */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
          <div className="flex items-center gap-2">
            <Thermometer className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium">Temperatura</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-count-up">{getTemperatureIcon()}</span>
            <span className="text-2xl font-bold pixel-text">{displayTemp.toFixed(1)}°C</span>
          </div>
        </div>

        {/* Humedad */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-accent/10">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-accent" />
            <span className="text-sm font-medium">Humedad</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-count-up">{getHumidityIcon()}</span>
            <span className="text-2xl font-bold pixel-text">{displayHumidity.toFixed(1)}%</span>
          </div>
        </div>

        {/* Barra de temperatura */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0°C</span>
            <span>50°C</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${Math.min((temperatura / 50) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Barra de humedad */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>100%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-accent transition-all duration-500"
              style={{ width: `${Math.min(humedad, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
