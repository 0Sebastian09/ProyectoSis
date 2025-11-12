
#include "DHT.h"
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <ArduinoJson.h>

// ===== CONFIGURACIÓN WIFI =====
const char* WIFI_SSID = "TU_RED_WIFI";        
const char* WIFI_PASSWORD = "TU_CONTRASEÑA";  

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
AsyncWebServer server(80);
AsyncWebSocket ws("/ws");

// Variables de sensores
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
unsigned long ultimoEnvioWS = 0;
const unsigned long INTERVALO_DHT = 5000;
const unsigned long INTERVALO_LUZ = 1000;
const unsigned long INTERVALO_WS = 1000;  // Enviar datos cada 1 segundo

void setup() {
  Serial.begin(115200);
  
  // Configurar pines
  pinMode(LED_PIN, OUTPUT);
  pinMode(TILT_SENSOR_PIN, INPUT);
  
  // Iniciar DHT11
  dht.begin();
  analogSetAttenuation(ADC_11db);
  
  // Conectar a WiFi
  Serial.println("\n╔════════════════════════════════════════════╗");
  Serial.println("║  ESTACIÓN FORESTAL - MODO WIFI/WEBSOCKET  ║");
  Serial.println("╚════════════════════════════════════════════╝\n");
  
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");
  
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 20) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi conectado!");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.println("\n⚠️  IMPORTANTE: Usa esta IP en tu página web");
    Serial.print("WebSocket URL: ws://");
    Serial.print(WiFi.localIP());
    Serial.println("/ws\n");
  } else {
    Serial.println("\n✗ Error: No se pudo conectar a WiFi");
    Serial.println("Verifica SSID y contraseña en el código");
  }
  
  // Configurar WebSocket
  ws.onEvent(onWebSocketEvent);
  server.addHandler(&ws);
  
  // Ruta HTTP para obtener datos (alternativa a WebSocket)
  server.on("/data", HTTP_GET, [](AsyncWebServerRequest *request) {
    String json = obtenerJSON();
    request->send(200, "application/json", json);
  });
  
  // Página de prueba
  server.on("/", HTTP_GET, [](AsyncWebServerRequest *request) {
    String html = "<html><body>";
    html += "<h1>Estación Forestal ESP32</h1>";
    html += "<p>WebSocket: ws://" + WiFi.localIP().toString() + "/ws</p>";
    html += "<p>HTTP API: http://" + WiFi.localIP().toString() + "/data</p>";
    html += "<div id='datos'>Conectando...</div>";
    html += "<script>";
    html += "const ws = new WebSocket('ws://' + location.host + '/ws');";
    html += "ws.onmessage = (e) => {";
    html += "  document.getElementById('datos').innerHTML = '<pre>' + e.data + '</pre>';";
    html += "};";
    html += "</script>";
    html += "</body></html>";
    request->send(200, "text/html", html);
  });
  
  // Habilitar CORS para peticiones HTTP
  DefaultHeaders::Instance().addHeader("Access-Control-Allow-Origin", "*");
  
  server.begin();
  Serial.println("✓ Servidor web iniciado\n");
  Serial.println("════════════════════════════════════════════\n");
}

void loop() {
  unsigned long tiempoActual = millis();
  
  // Limpiar conexiones WebSocket cerradas
  ws.cleanupClients();
  
  // Monitoreo sísmico
  monitoreoSismico(tiempoActual);
  
  // Lectura DHT11
  if (tiempoActual - ultimaLecturaDHT >= INTERVALO_DHT) {
    leerDHT11();
    ultimaLecturaDHT = tiempoActual;
  }
  
  // Lectura sensor de luz
  if (tiempoActual - ultimaLecturaLuz >= INTERVALO_LUZ && !alertaSismica) {
    leerSensorLuz();
    ultimaLecturaLuz = tiempoActual;
  }
  
  // Enviar datos por WebSocket
  if (tiempoActual - ultimoEnvioWS >= INTERVALO_WS) {
    enviarDatosWebSocket();
    ultimoEnvioWS = tiempoActual;
  }
  
  delay(50);
}

// ===== FUNCIÓN: LECTURA DHT11 =====
void leerDHT11() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  
  if (!isnan(h) && !isnan(t)) {
    temperatura = t;
    humedad = h;
    Serial.printf("🌡️  Temp: %.1f°C | 💧 Humedad: %.1f%%\n", t, h);
  }
}

// ===== FUNCIÓN: LECTURA SENSOR DE LUZ =====
void leerSensorLuz() {
  luz = analogRead(LED_PIN);
  
  Serial.print("☀️  Luz: ");
  Serial.print(luz);
  Serial.print(" → ");
  
  if (luz >= 1000) Serial.println("🌙 Noche");
  else if (luz >= 600) Serial.println("🌆 Atardecer");
  else if (luz >= 300) Serial.println("⛅ Nublado");
  else if (luz >= 150) Serial.println("☀️  Soleado");
  else Serial.println("🔆 Muy Intensa");
}

// ===== FUNCIÓN: MONITOREO SÍSMICO =====
void monitoreoSismico(unsigned long tiempoActual) {
  estadoActual = digitalRead(TILT_SENSOR_PIN);
  
  if (estadoActual != estadoAnterior) {
    contadorVibraciones++;
    tiempoUltimoCambio = tiempoActual;
    estadoAnterior = estadoActual;
    vibraciones = contadorVibraciones;
    
    Serial.printf("📊 Vibración #%d\n", contadorVibraciones);
  }
  
  if (contadorVibraciones >= UMBRAL_VIBRACIONES && !alertaSismica) {
    activarAlertaSismica();
  }
  
  if (tiempoActual - tiempoUltimoCambio > TIEMPO_VENTANA && !alertaSismica) {
    if (contadorVibraciones > 0) {
      Serial.printf("Reset contador (%d vibraciones)\n", contadorVibraciones);
    }
    contadorVibraciones = 0;
    vibraciones = 0;
  }
  
  if (alertaSismica) {
    manejarAlerta(tiempoActual);
  }
}

// ===== FUNCIÓN: ACTIVAR ALERTA SÍSMICA =====
void activarAlertaSismica() {
  alertaSismica = true;
  tiempoInicioAlerta = millis();
  vibraciones = contadorVibraciones;
  contadorVibraciones = 0;
  
  Serial.println("\n╔═══════════════════════════════════════╗");
  Serial.println("║   ⚠️  ALERTA SÍSMICA ACTIVADA  ⚠️    ║");
  Serial.println("╚═══════════════════════════════════════╝\n");
}

// ===== FUNCIÓN: MANEJAR ALERTA =====
void manejarAlerta(unsigned long tiempoActual) {
  // LED intermitente
  if ((tiempoActual / 200) % 2 == 0) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
  
  if (tiempoActual - tiempoInicioAlerta > TIEMPO_ALERTA) {
    desactivarAlerta();
  }
}

// ===== FUNCIÓN: DESACTIVAR ALERTA =====
void desactivarAlerta() {
  alertaSismica = false;
  vibraciones = 0;
  digitalWrite(LED_PIN, LOW);
  
  Serial.println("\n════════════════════════════════════════");
  Serial.println("Alerta desactivada. Sistema normal.");
  Serial.println("════════════════════════════════════════\n");
  
  estadoAnterior = digitalRead(TILT_SENSOR_PIN);
}

// ===== FUNCIÓN: CREAR JSON CON DATOS =====
String obtenerJSON() {
  StaticJsonDocument<256> doc;
  doc["temperatura"] = temperatura;
  doc["humedad"] = humedad;
  doc["luz"] = luz;
  doc["vibraciones"] = vibraciones;
  doc["alertaSismica"] = alertaSismica;
  doc["timestamp"] = millis();
  
  String json;
  serializeJson(doc, json);
  return json;
}

// ===== FUNCIÓN: ENVIAR DATOS POR WEBSOCKET =====
void enviarDatosWebSocket() {
  if (ws.count() > 0) {
    String json = obtenerJSON();
    ws.textAll(json);
  }
}

// ===== FUNCIÓN: EVENTOS WEBSOCKET =====
void onWebSocketEvent(AsyncWebSocket *server, AsyncWebSocketClient *client, 
                      AwsEventType type, void *arg, uint8_t *data, size_t len) {
  if (type == WS_EVT_CONNECT) {
    Serial.printf("✓ Cliente WebSocket conectado: %u\n", client->id());
    // Enviar datos inmediatamente al conectar
    client->text(obtenerJSON());
  } else if (type == WS_EVT_DISCONNECT) {
    Serial.printf("✗ Cliente WebSocket desconectado: %u\n", client->id());
  }
}
