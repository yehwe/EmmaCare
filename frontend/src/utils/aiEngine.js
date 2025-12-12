// AI Engine for Maternal Health - V2 with Intent Recognition
class MaternalHealthAI {
  constructor() {
    this.intents = this.initializeIntents();
    this.knowledgeBase = this.initializeKnowledgeBase();
  }

  initializeIntents() {
    return {
      query_heart_rate: {
        keywords: ["heart rate", "pulse", "heartbeat"],
        threshold: 0.8,
      },
      query_spo2: {
        keywords: ["oxygen", "spo2", "saturation"],
        threshold: 0.8,
      },
      query_temperature: {
        keywords: ["temperature", "fever", "hot", "cold"],
        threshold: 0.7,
      },
      query_blood_pressure: {
        keywords: ["blood pressure", "bp"],
        threshold: 0.8,
      },
      general_nutrition: {
        keywords: ["eat", "diet", "nutrition", "food", "drink"],
        threshold: 0.6,
      },
      general_exercise: {
        keywords: ["exercise", "walk", "swim", "yoga", "active", "workout"],
        threshold: 0.6,
      },
      general_sleep: {
        keywords: ["sleep", "tired", "rest", "nap"],
        threshold: 0.6,
      },
      general_pregnancy: {
        keywords: ["pregnancy", "baby", "prenatal"],
        threshold: 0.7,
      },
    };
  }

  initializeKnowledgeBase() {
    return {
      heart_rate: {
        normal: { min: 60, max: 100 },
        warning: { min: 100, max: 120 },
        critical_low: 50,
        critical_high: 120,
      },
      spo2: {
        normal: { min: 95, max: 100 },
        warning: { min: 92, max: 95 },
        critical_low: 92,
      },
      temperature: {
        normal: { min: 36.1, max: 37.5 },
        warning: { min: 37.5, max: 38.0 },
        critical_high: 38.0,
      },
      blood_pressure: {
        normal: { min: 90, max: 120 },
        elevated: { min: 120, max: 140 },
        high: { min: 140, max: 160 },
        critical_high: 160,
      },
      general: {
        nutrition:
          "A healthy pregnancy diet includes a variety of fruits, vegetables, lean proteins, and whole grains. It's important to take a prenatal vitamin with folic acid and iron. Avoid raw fish, unpasteurized dairy, and limit caffeine.",
        exercise:
          "Gentle exercise like walking, swimming, or prenatal yoga is usually recommended. Aim for about 30 minutes of moderate activity on most days. Always consult your doctor before starting a new exercise routine.",
        sleep:
          "Aim for 7-9 hours of sleep per night. Sleeping on your left side can improve blood flow to the baby. Use pillows for support to get comfortable.",
        pregnancy:
          "During pregnancy, it's important to maintain regular prenatal checkups, eat a balanced diet, stay hydrated, and get adequate rest. Always consult with your healthcare provider for personalized advice.",
      },
    };
  }

  getIntent(question) {
    const lowerQuestion = question.toLowerCase();
    let bestMatch = { intent: "fallback", score: 0 };

    for (const intentName in this.intents) {
      const intent = this.intents[intentName];
      let score = 0;
      for (const keyword of intent.keywords) {
        if (lowerQuestion.includes(keyword)) {
          // A simple scoring boost based on keyword length to favor more specific matches
          score += keyword.length;
        }
      }

      // Normalize score by a factor to keep it manageable
      const normalizedScore = score / 10;

      if (normalizedScore > bestMatch.score && normalizedScore >= (intent.threshold || 0.5)) {
        bestMatch = { intent: intentName, score: normalizedScore };
      }
    }

    return bestMatch.intent;
  }
  
  generateResponse(question, vitals) {
    const intent = this.getIntent(question);

    switch (intent) {
      case "query_heart_rate":
        return this.handleHeartRateQuestion(vitals);
      case "query_spo2":
        return this.handleOxygenQuestion(vitals);
      case "query_temperature":
        return this.handleTemperatureQuestion(vitals);
      case "query_blood_pressure":
        return this.handleBloodPressureQuestion(vitals);
      case "general_nutrition":
        return this.knowledgeBase.general.nutrition;
      case "general_exercise":
        return this.knowledgeBase.general.exercise;
      case "general_sleep":
        return this.knowledgeBase.general.sleep;
       case "general_pregnancy":
        return this.knowledgeBase.general.pregnancy;
      default:
        return "I can help with questions about your vital signs and general pregnancy topics like nutrition, exercise, and sleep. How can I assist you?";
    }
  }

  handleHeartRateQuestion(vitals) {
    if (vitals && vitals.heart_rate) {
      const hr = Math.round(vitals.heart_rate);
      const limits = this.knowledgeBase.heart_rate;

      let response = `Your current heart rate is ${hr} BPM. `;

      if (hr < limits.critical_low) {
        response += `This is critically low. Please contact your doctor immediately.`;
      } else if (hr < limits.normal.min) {
        response += `This is lower than the typical resting range. While sometimes normal, it's good to mention it to your doctor.`;
      } else if (hr <= limits.normal.max) {
        response += `This is within the normal resting range.`;
      } else if (hr <= limits.warning.max) {
        response += `This is slightly elevated. An increased heart rate is common during pregnancy, but it's good to monitor.`;
      } else {
        response += `This is high and requires attention. Please contact your doctor for guidance.`;
      }
      return response;
    }
    return "I can't access your current heart rate data right now. Please ensure your monitor is connected.";
  }

  handleOxygenQuestion(vitals) {
    if (vitals && vitals.spo2) {
      const spo2 = vitals.spo2.toFixed(1);
      const limits = this.knowledgeBase.spo2;

      let response = `Your current oxygen saturation is ${spo2}%. `;

      if (spo2 < limits.critical_low) {
        response += `This is below the recommended level. Please sit upright, take some deep breaths, and contact your doctor.`;
      } else if (spo2 < limits.normal.min) {
        response += `This is slightly lower than ideal. It's important to monitor this. Ensure you are in a well-ventilated area.`;
      } else {
        response += `This is a healthy oxygen level.`;
      }
      return response;
    }
    return "I am unable to retrieve your oxygen saturation data at the moment. Please check if the sensor is properly attached.";
  }

  handleTemperatureQuestion(vitals) {
    if (vitals && vitals.temperature) {
      const temp = vitals.temperature.toFixed(1);
      const limits = this.knowledgeBase.temperature;

      let response = `Your current temperature is ${temp}°C. `;

      if (temp >= limits.critical_high) {
        response += `This indicates a fever, which requires immediate medical attention during pregnancy. Please contact your doctor.`;
      } else if (temp >= limits.warning.min) {
        response += `This is elevated. Please rest, drink plenty of fluids, and monitor your temperature closely.`;
      } else {
        response += `This is within the normal range.`;
      }
      return response;
    }
    return "I cannot access your temperature data right now. Please ensure the sensor is working correctly.";
  }

  handleBloodPressureQuestion(vitals) {
    if (vitals && vitals.systolic) {
      const bp = Math.round(vitals.systolic);
      const limits = this.knowledgeBase.blood_pressure;

      let response = `Your current systolic blood pressure is approximately ${bp} mmHg. `;

      if (bp >= limits.critical_high) {
        response += `This is very high and requires immediate medical attention. Please contact your doctor or proceed to the nearest clinic.`;
      } else if (bp >= limits.high.min) {
        response += `This is considered high. It's important to report this to your doctor for further evaluation.`;
      } else if (bp >= limits.elevated.min) {
        response += `This is in the elevated range. Please monitor it and discuss with your doctor at your next appointment.`;
      } else if (bp < limits.normal.min) {
        response += `This is on the lower side. Make sure you are staying hydrated and stand up slowly to avoid dizziness.`;
      } else {
        response += `This is within the normal range.`;
      }
      return response;
    }
    return "Your blood pressure data is currently unavailable. Please note that this is an estimate and not a diagnostic measurement.";
  }
}

export default new MaternalHealthAI(); 