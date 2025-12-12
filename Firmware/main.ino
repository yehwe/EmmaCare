#include "Config.h"
#include "SensorManager.h"
#include "WiFiManager.h"
#include "DataSender.h"
#include "SMSManager.h"
#include <HardwareSerial.h>
SensorManager sensors;
WiFiManager wifi;
DataSender sender;
SMSManager smsManager(SIM800L);
unsigned long lastSMSTime = 0;
void setup() {
Serial.begin(115200);
wifi.begin(WIFI_SSID, WIFI_PASS);
sensors.begin();
smsManager.begin(9600, SIM_RX, SIM_TX);
// Tasks
xTaskCreatePinnedToCore([](void* param){
for(;;){
sensors.updatePulseOximeter();
vTaskDelay(10 / portTICK_PERIOD_MS);
}
}, "PulseTask", 4096, NULL, 2, NULL, 1);
xTaskCreatePinnedToCore([](void* param){
for(;;){
sensors.updateTemperature();
6
float hr = sensors.getHeartRate();
float spo2 = sensors.getSpO2();
float temp = sensors.getTemperature();
Serial.printf("HR: %.1f bpm | SpO2: %.1f%% | Temp: %.1f C\n", hr, spo2,
temp);
sender.sendToServer(hr, spo2, temp);
if(sensors.isCritical() && millis()-lastSMSTime>SMS_TIMEOUT_MS){
smsManager.sendSMS("+251900118533", "CRITICAL! HR:" + String(hr) + " 
SpO2:" + String(spo2));
lastSMSTime = millis();
}
vTaskDelay(1000 / portTICK_PERIOD_MS);
}
}, "MainTask", 4096, NULL, 1, NULL, 0);
}
void loop() { }