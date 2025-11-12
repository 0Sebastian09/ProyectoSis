/*
 * ========================================
 * ESTACIÓN FORESTAL INTEGRADA ESP32
 * Versión WiFi con HTTP API
 * ========================================
 * 
 * Este código crea un servidor HTTP que responde
 * con JSON cuando la página web hace peticiones
 * 
 * INSTRUCCIONES:
 * 1. Configurar tu red WiFi abajo
 * 2. Subir el código al ESP32
 * 3. Abrir Monitor Serial (115200 baud)
 * 4. Copiar la IP que aparece
 * 5. En la página web (app/page.tsx), descomentar
 *    la sección "HTTP Polling" y usar esa IP
 */

#include "DHT.h"
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

// ===== CONFIGURACIÓN WIFI =====
const char* WIFI_SSID = "TU_RED_WIFI";        // ⚠️ CAMBIAR
const char* WIFI_PASSWORD = "TU_CONTRASEÑA";  // ⚠️ CAMBIAR

// ===== CONFIGURACIÓN DE PINES =====
#define LED_PIN 2
#define DHT_PIN 4
#define TILT_SENSOR_PIN 18

// ===== CONFIGURACIÓN DHT11 =====
#define DHTTYPE DHT11
DHT dht(DHT_PIN, DHTTYPE);

// ===== PARÁMETROS DETECTOR SÍSMICO =====
#define UMBRAL_VIBRACIONES 3
#define TIEMPO_VENTANA 2000
#define TIEMPO_ALERTA 10000

// ===== VARIABLES GLOBALES =====
WebServer server(80);

float temperatura = 0.0;
float humedad = 0.0;
int luz = 0;
int vibraciones = 0;
bool alertaSismica = false;

// Variables detector sísmico
int estadoActual = LOW;
int estadoAnterior = LOW;
int contadorVibraciones = 0;
unsigned long tiempoUltimoCambio = 0;
unsigned long tiempoInicioAlerta = 0;

// Variables de timing
unsigned long ultimaLecturaDHT = 0;
unsigned long ultimaLecturaLuz = 0;

void setup() {
  Serial.begin(115200);
  
  pinMode(LED_PIN, OUTPUT);
  pinMode(TILT_SENSOR_PIN, INPUT);
  
  dht.begin();
  analogSetAttenuation(ADC_11db);
  
  // Conectar WiFi
  Serial.println("\n╔════════════════════════════════════════════╗");
  Serial.println("║    ESTACIÓN FORESTAL - MODO WIFI/HTTP     ║");
  Serial.println("╚════════════════════════════════════════════╝\n");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\n✓ WiFi conectado!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.println("\n⚠️  Usa esta URL en tu página web:");
  Serial.print("http://");
  Serial.print(WiFi.localIP());
  Serial.println("/data\n");
  
  // Configurar rutas HTTP
  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.enableCORS(true);
  
  server.begin();
  Serial.println("✓ Servidor HTTP iniciado\n");
}

void loop() {
  unsigned long tiempoActual = millis();
  
  server.handleClient();
  
  // Lógica de sensores (igual que antes)
  monitoreoSismico(tiempoActual);
  
  if (tiempoActual - ultimaLecturaDHT >= 5000) {
    leerDHT11();
    ultimaLecturaDHT = tiempoActual;
  }
  
  if (tiempoActual - ultimaLecturaLuz >= 1000 && !alertaSismica) {
    leerSensorLuz();
    ultimaLecturaLuz = tiempoActual;
  }
  
  delay(50);
}

void handleRoot() {
  String html = "<h1>Estación Forestal ESP32</h1>";
  html += "<p>API Endpoint: <a href='/data'>/data</a></p>";
  html += "<p>Temp: " + String(temperatura) + "°C | ";
  html += "Humedad: " + String(humedad) + "% | ";
  html += "Luz: " + String(luz) + " | ";
  html += "Vibraciones: " + String(vibraciones) + "</p>";
  
  server.send(200, "text/html", html);
}

void handleData() {
  StaticJsonDocument<256> doc;
  doc["temperatura"] = temperatura;
  doc["humedad"] = humedad;
  doc["luz"] = luz;
  doc["vibraciones"] = vibraciones;
  doc["alertaSismica"] = alertaSismica;
  doc["timestamp"] = millis();
  
  String json;
  serializeJson(doc, json);
  
  server.sendHeader("Access-Control-Allow-Origin", "*");
  server.send(200, "application/json", json);
}

// Las funciones de sensores son iguales al código original
void leerDHT11() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h) && !isnan(t)) {
    temperatura = t;
    humedad = h;
  }
}

void leerSensorLuz() {
  luz = analogRead(LED_PIN);
}

void monitoreoSismico(unsigned long tiempoActual) {
  estadoActual = digitalRead(TILT_SENSOR_PIN);
  
  if (estadoActual != estadoAnterior) {
    contadorVibraciones++;
    tiempoUltimoCambio = tiempoActual;
    estadoAnterior = estadoActual;
    vibraciones = contadorVibraciones;
  }
  
  if (contadorVibraciones >= UMBRAL_VIBRACIONES && !alertaSismica) {
    alertaSismica = true;
    tiempoInicioAlerta = tiempoActual;
    vibraciones = contadorVibraciones;
    contadorVibraciones = 0;
  }
  
  if (tiempoActual - tiempoUltimoCambio > TIEMPO_VENTANA && !alertaSismica) {
    contadorVibraciones = 0;
    vibraciones = 0;
  }
  
  if (alertaSismica) {
    if ((tiempoActual / 200) % 2 == 0) digitalWrite(LED_PIN, HIGH);
    else digitalWrite(LED_PIN, LOW);
    
    if (tiempoActual - tiempoInicioAlerta > TIEMPO_ALERTA) {
      alertaSismica = false;
      vibraciones = 0;
      digitalWrite(LED_PIN, LOW);
    }
  }
}
