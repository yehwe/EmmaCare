#ifndef SMS_MANAGER_H
#define SMS_MANAGER_H
#include <HardwareSerial.h>
#include <Arduino.h>
class SMSManager {
public:
SMSManager(HardwareSerial& serial);
void begin(long baud, uint8_t rxPin, uint8_t txPin);
void sendSMS(const String& number, const String& message);
private:
HardwareSerial& sim;
};
#endif