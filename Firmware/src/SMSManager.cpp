#include "SMSManager.h"
SMSManager::SMSManager(HardwareSerial& serial) : sim(serial) {}
5
void SMSManager::begin(long baud, uint8_t rxPin, uint8_t txPin) {
sim.begin(baud, SERIAL_8N1, rxPin, txPin); }
void SMSManager::sendSMS(const String& number, const String& message) {
sim.println("AT"); delay(500);
sim.println("AT+CMGF=1"); delay(500);
sim.print("AT+CMGS=\""); sim.print(number); sim.println("\"");
delay(500);
sim.print(message); delay(500);
sim.write(26); delay(5000);
Serial.println("SMS sent");
}