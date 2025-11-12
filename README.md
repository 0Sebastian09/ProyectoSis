# Estación Forestal Integrada ESP32

Sistema de monitoreo ambiental en tiempo real con diseño pixel art retro.

## Características

- **Monitoreo de Clima**: Temperatura y humedad con DHT11
- **Sensor de Luz**: Detección de niveles de luminosidad (0-4095)
- **Detector Sísmico**: Alerta de vibraciones con KY-020
- **Interfaz 8-bits**: Fondo animado que cambia según hora del día
- **Alertas en Tiempo Real**: Sistema visual y sonoro de emergencia

 Ejecutar

\`\`\`bash
npm install
npm run dev
\`\`\`

Abrir [http://localhost:3000](http://localhost:3000)


## Formato de Datos JSON

\`\`\`json
{
  "temperatura": 25.5,
  "humedad": 65.2,
  "luz": 450,
  "vibraciones": 0,
  "alertaSismica": false,
  "timestamp": 1234567890
}
\`\`\`



## Tecnologías

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: ESP32 con WiFi
- **Sensores**: DHT11, Fotoresistor, KY-020
- **Comunicación**: WebSocket / HTTP / Serial
