#ifndef SENSOR_MANAGER_H
#define SENSOR_MANAGER_H
#include <MAX30100_PulseOximeter.h>
#include <DallasTemperature.h>
#include <OneWire.h>
class SensorManager {
public:
SensorManager();
void begin();
void updatePulseOximeter();
float getHeartRate();
float getSpO2();
void updateTemperature();
float getTemperature();
bool isCritical();
private:
PulseOximeter pox;
OneWire oneWire;
DallasTemperature tempSensor;
float hr;

float spo2;
float temp;
bool critical;
};
#endif