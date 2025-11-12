"use client"

import { Card } from "@/components/ui/card"

export function UniversityBadge() {
  return (
    <Card className="pixel-border bg-card/95 backdrop-blur-sm p-3 text-xs">
      <div className="flex items-center gap-3">
        {/* Logo de la Universidad (placeholder) */}
        <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          UNILLANOS
        </div>

        <div className="space-y-1">
          <div className="font-bold text-primary leading-tight">Universidad de los Llanos</div>
          <div className="text-muted-foreground leading-tight">
            <div>Sebastian Claros - 161004413</div>
            <div>David Barrera - 161004303</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
