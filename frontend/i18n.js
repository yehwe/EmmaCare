import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      //login
      log: "Maternal Health",
      logintro:"Monitor • Care • Protect",
      patient: "Patient",
      doctor:"Doctor",
      signin: "Sign In",
      register: "Register as a new doctor",
      all: "All",
      critical: "Critical",
      warn: "Warning",
      info: "Info",

      //patient dashboard
      dashboard_health_monitor: "Health Monitor",
      con: "Connected",
      sign: "Sign Out",
      preg: "Pregnancy Journey",
      week: "Week",
      of: "Of",
      great: "You're doing great!",
      days: "Days to go",
      data: "Data Status",
      last: "Last Updated",
      reading: "Last Reading",
      emergency: "Emergency Contacts",
      call: "Call Doctor",
      contact: "Contact Family",
      health: "Health Insights",

      //notifications
      notifications: "Notifications Center",
      current: "Current Vitals Status",
      heart: "Hear Rate",
      oxygen: "Oxygen",
      temp: "Temperature",
      bp: "Blood Pressure",
      no: "No Notifications",


      

      navbar_language: "Language",
      navbar_english: "English",
      navbar_amharic: "አማርኛ",
    },
  },
  am: {
    translation: {
      // Login
      log:"የእናት ጤና",
      logintro:"ክትትል • እንክብካቤ • ጥበቃ",
      patient: "ታካሚ",
      doctor: "ሀኪም",
      signin: "ግባ",
      register: "እንደ አዲስ ሀኪም ይመዝገብ",
     

      // PatientDashboard
      dashboard_health_monitor: "የጤና አከታታይ",
      con: "ተገናኝቷል",
      sign: "ይውጡ",
      preg: "የእርግዝና ጊዜ",
      week: "ሳምንት",
      of: "ከ",
      great: "ጥሩ ላይ ነሽ!",
      days: "ቀናት ይቀራል",
      data: "የመረጃ ሁኔታ",
      last: "መጨረሻ የተለካበት ሰአት",
      reading: "መጨረሻ የተነበበበት",
      emergency: "የአደጋ ጊዜ ተጠሪ",
      call: "ወደ ዶክተር ደውል",
      contact: "ወደ ቤተሰብ ደውል",
      health: "የጤና እይታ",

      // Notifications
      notifications: "የማሳወቂያ ማውጫ",
      current: "በአሁኑ ሰአት ያሎት ልኬት",
      heart: "የልብ ምት",
      oxygen: "ኦክሲጅን",
      temp: "ሙቀት",
      bp: "የደም ግፊት",
      all: "ሁሉም",
      critical: "ከባድ",
      warn: "ማስጠንቀቂያ",
      info: "መረጃ",
      no: "ምንም ማሳወቂያ የለም",


      

     

      navbar_language: "ቋንቋ",
      navbar_english: "English",
      navbar_amharic: "አማርኛ",
    },
  },
};

i18n
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources,
    lng: 'am', // Default language
    fallbackLng: 'am', // Fallback language
    interpolation: {
      escapeValue: false, // React already escapes values to prevent XSS
    },
  });

export default i18n;