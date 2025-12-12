#include "SensorManager.h"
#include "Config.h"
#include <Arduino.h>
SensorManager::SensorManager() : oneWire(ONE_WIRE_BUS), tempSensor(&oneWire),
hr(0), spo2(0), temp(0), critical(false) {}
void SensorManager::begin() {
tempSensor.begin();
tempSensor.setWaitForConversion(false);
if (!pox.begin()) {
Serial.println("MAX30100 init failed");
while(1);
}
pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
}
void SensorManager::updatePulseOximeter() {
pox.update();
hr = pox.getHeartRate();
spo2 = pox.getSpO2();
critical = (hr < 50 || hr > 120) || (spo2 < 90);
}
float SensorManager::getHeartRate() { return hr; }
float SensorManager::getSpO2() { return spo2; }
void SensorManager::updateTemperature() {
tempSensor.requestTemperatures();
temp = tempSensor.getTempCByIndex(0);
}
float SensorManager::getTemperature() { return temp; }
bool SensorManager::isCritical() { return critical; }