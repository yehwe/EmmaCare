#include "DataSender.h"
#include <WiFi.h>
#include <HTTPClient.h>
#include "Config.h"
#include <Arduino.h>
void DataSender::sendToServer(float hr, float spo2, float temp) {
if (WiFi.status() != WL_CONNECTED) return;
HTTPClient http;
http.begin(SERVER_URL);
http.addHeader("Content-Type", "application/json");
String json = "{";
json += "\"heart_rate\":" + String(hr,1) + ",";
json += "\"spo2\":" + String(spo2,1) + ",";
json += "\"temperature\":" + String(temp,1);
json += "}";
int code = http.POST(json);
Serial.print("HTTP code: "); Serial.println(code);
http.end();
}