#ifndef CONFIG_H
#define CONFIG_H

// WiFi credentials
constexpr char WIFI_SSID[] = "Yo";
constexpr char WIFI_PASS[] = "yohana23";
constexpr char SERVER_URL[] = "https://hulumoya.zapto.org/api/data";
// MAX30100 LED current
constexpr int IR_LED_CURRENT = 7;
// DS18B20 pin
#define ONE_WIRE_BUS 4
// SIM800L pins
#define SIM_TX 17
#define SIM_RX 16
// SMS timing
constexpr unsigned long SMS_TIMEOUT_MS = 60000; // 1 minute
#endif