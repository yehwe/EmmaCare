#include "WiFiManager.h"
#include <Arduino.h>
void WiFiManager::begin(const char* ssid, const char* password) {
WiFi.begin(ssid, password);
Serial.print("Connecting to WiFi");
while (WiFi.status() != WL_CONNECTED) {
delay(500);
Serial.print(".");
}
Serial.println("Connected!");
}
bool WiFiManager::connected() { return WiFi.status() == WL_CONNECTED; }