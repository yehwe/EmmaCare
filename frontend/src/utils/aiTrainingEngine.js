// AI Training Engine for Maternal Health
class AITrainingEngine {
  constructor() {
    this.trainingData = []
    this.patterns = new Map()
    this.responseTemplates = new Map()
    this.userContexts = new Map()
  }

  // Initialize with existing data
  async initialize() {
    try {
      const response = await fetch('http://localhost:3000/api/interactions')
      const interactions = await response.json()
      this.loadTrainingData(interactions)
      console.log('✅ AI Training Engine initialized with', interactions.length, 'interactions')
    } catch (err) {
      console.error('❌ Failed to initialize AI Training Engine:', err)
    }
  }

  // Load training data from interactions
  loadTrainingData(interactions) {
    this.trainingData = interactions.map(interaction => ({
      question: interaction.question.toLowerCase(),
      response: interaction.response,
      vitals: interaction.vitals_data ? JSON.parse(interaction.vitals_data) : null,
      userRole: interaction.user_role,
      pregnancyWeek: interaction.pregnancy_week,
      rating: interaction.feedback_rating,
      timestamp: new Date(interaction.timestamp)
    }))

    this.analyzePatterns()
    this.buildResponseTemplates()
  }

  // Analyze patterns in user questions
  analyzePatterns() {
    const questionPatterns = new Map()
    
    this.trainingData.forEach(data => {
      const words = data.question.split(' ')
      words.forEach(word => {
        if (word.length > 3) { // Skip short words
          if (!questionPatterns.has(word)) {
            questionPatterns.set(word, [])
          }
          questionPatterns.get(word).push(data)
        }
      })
    })

    this.patterns = questionPatterns
  }

  // Build response templates based on successful interactions
  buildResponseTemplates() {
    const templates = new Map()
    
    // Group by question type and find best responses
    this.trainingData.forEach(data => {
      const questionType = this.categorizeQuestion(data.question)
      if (!templates.has(questionType)) {
        templates.set(questionType, [])
      }
      
      // Only include responses with good ratings
      if (data.rating && data.rating >= 4) {
        templates.get(questionType).push({
          response: data.response,
          rating: data.rating,
          vitals: data.vitals
        })
      }
    })

    this.responseTemplates = templates
  }

  // Categorize questions
  categorizeQuestion(question) {
    const lowerQuestion = question.toLowerCase()
    
    if (lowerQuestion.includes('heart rate') || lowerQuestion.includes('pulse')) {
      return 'heart_rate'
    } else if (lowerQuestion.includes('oxygen') || lowerQuestion.includes('spo2')) {
      return 'oxygen'
    } else if (lowerQuestion.includes('temperature') || lowerQuestion.includes('fever')) {
      return 'temperature'
    } else if (lowerQuestion.includes('blood pressure') || lowerQuestion.includes('bp')) {
      return 'blood_pressure'
    } else if (lowerQuestion.includes('pregnancy') || lowerQuestion.includes('pregnant')) {
      return 'pregnancy_general'
    } else if (lowerQuestion.includes('nutrition') || lowerQuestion.includes('diet') || lowerQuestion.includes('eat')) {
      return 'nutrition'
    } else if (lowerQuestion.includes('exercise') || lowerQuestion.includes('workout')) {
      return 'exercise'
    } else if (lowerQuestion.includes('symptom') || lowerQuestion.includes('normal')) {
      return 'symptoms'
    } else if (lowerQuestion.includes('emergency') || lowerQuestion.includes('urgent')) {
      return 'emergency'
    } else {
      return 'general'
    }
  }

  // Generate response based on training data
  generateResponse(question, vitals = null, userRole = 'patient', pregnancyWeek = 32) {
    const questionType = this.categorizeQuestion(question)
    const lowerQuestion = question.toLowerCase()
    
    // Find similar questions from training data
    const similarQuestions = this.findSimilarQuestions(lowerQuestion)
    
    // Get best response from templates
    const templates = this.responseTemplates.get(questionType) || []
    
    if (templates.length > 0) {
      // Find best matching template
      const bestTemplate = this.findBestTemplate(templates, vitals, userRole)
      return this.personalizeResponse(bestTemplate.response, vitals, pregnancyWeek)
    }
    
    // Fallback to pattern matching
    const patternResponse = this.generateFromPatterns(lowerQuestion, vitals)
    if (patternResponse) {
      return patternResponse
    }
    
    // Final fallback
    return this.generateFallbackResponse(questionType, vitals, userRole)
  }

  // Find similar questions
  findSimilarQuestions(question) {
    const similar = []
    
    this.trainingData.forEach(data => {
      const similarity = this.calculateSimilarity(question, data.question)
      if (similarity > 0.3) { // 30% similarity threshold
        similar.push({ ...data, similarity })
      }
    })
    
    return similar.sort((a, b) => b.similarity - a.similarity).slice(0, 5)
  }

  // Calculate similarity between two questions
  calculateSimilarity(q1, q2) {
    const words1 = new Set(q1.split(' '))
    const words2 = new Set(q2.split(' '))
    
    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])
    
    return intersection.size / union.size
  }

  // Find best template based on context
  findBestTemplate(templates, vitals, userRole) {
    let bestTemplate = templates[0]
    let bestScore = 0
    
    templates.forEach(template => {
      let score = template.rating || 3
      
      // Bonus for matching vital signs context
      if (vitals && template.vitals) {
        const vitalMatch = this.calculateVitalMatch(vitals, template.vitals)
        score += vitalMatch * 2
      }
      
      if (score > bestScore) {
        bestScore = score
        bestTemplate = template
      }
    })
    
    return bestTemplate
  }

  // Calculate vital signs match
  calculateVitalMatch(currentVitals, templateVitals) {
    let match = 0
    let total = 0
    
    Object.keys(currentVitals).forEach(key => {
      if (templateVitals[key] && currentVitals[key] !== null) {
        const diff = Math.abs(currentVitals[key] - templateVitals[key])
        const maxDiff = this.getMaxDiff(key)
        match += Math.max(0, 1 - (diff / maxDiff))
        total++
      }
    })
    
    return total > 0 ? match / total : 0
  }

  // Get maximum acceptable difference for vital signs
  getMaxDiff(vitalType) {
    switch (vitalType) {
      case 'heart_rate': return 20
      case 'spo2': return 10
      case 'temperature': return 2
      case 'systolic': return 30
      default: return 10
    }
  }

  // Personalize response with current vitals
  personalizeResponse(response, vitals, pregnancyWeek) {
    let personalized = response
    
    if (vitals) {
      if (vitals.heart_rate) {
        personalized = personalized.replace(/\{heart_rate\}/g, Math.round(vitals.heart_rate))
      }
      if (vitals.spo2) {
        personalized = personalized.replace(/\{spo2\}/g, vitals.spo2.toFixed(1))
      }
      if (vitals.temperature) {
        personalized = personalized.replace(/\{temperature\}/g, vitals.temperature.toFixed(1))
      }
      if (vitals.systolic) {
        personalized = personalized.replace(/\{systolic\}/g, vitals.systolic.toFixed(0))
      }
    }
    
    personalized = personalized.replace(/\{pregnancy_week\}/g, pregnancyWeek)
    
    return personalized
  }

  // Generate response from patterns
  generateFromPatterns(question, vitals) {
    const relevantPatterns = []
    
    this.patterns.forEach((data, word) => {
      if (question.includes(word)) {
        relevantPatterns.push(...data)
      }
    })
    
    if (relevantPatterns.length > 0) {
      // Find best rated response
      const bestResponse = relevantPatterns
        .filter(r => r.rating && r.rating >= 4)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))[0]
      
      if (bestResponse) {
        return this.personalizeResponse(bestResponse.response, vitals)
      }
    }
    
    return null
  }

  // Generate fallback response
  generateFallbackResponse(questionType, vitals, userRole) {
    const fallbacks = {
      heart_rate: "I understand you're asking about heart rate. A normal resting heart rate is typically 60-100 BPM. During pregnancy, it's common for heart rate to increase by 10-20 beats per minute. For specific concerns about your heart rate, please consult your healthcare provider.",
      oxygen: "Oxygen saturation (SpO2) should normally be 95-100%. During pregnancy, levels should remain above 95%. If you have concerns about your oxygen levels, please contact your doctor.",
      temperature: "Normal body temperature ranges from 97°F to 99°F (36.1°C to 37.2°C). A fever during pregnancy (>100.4°F or 38°C) should be evaluated by a healthcare provider.",
      blood_pressure: "Normal blood pressure is generally below 120/80 mmHg. During pregnancy, blood pressure changes are common. High blood pressure (>140/90) requires immediate medical attention.",
      pregnancy_general: "During pregnancy, it's important to maintain regular prenatal checkups, eat a balanced diet, stay hydrated, and get adequate rest. Always consult with your healthcare provider for personalized advice.",
      nutrition: "A healthy pregnancy diet should include plenty of fruits, vegetables, whole grains, lean proteins, and dairy. Key nutrients include folic acid, iron, calcium, and omega-3 fatty acids.",
      exercise: "Moderate exercise during pregnancy is generally safe and beneficial. Activities like walking, swimming, and prenatal yoga are excellent choices. Always consult your healthcare provider before starting any exercise routine.",
      symptoms: "Normal pregnancy symptoms include morning sickness, fatigue, mood swings, back pain, and swelling. Concerning symptoms requiring medical attention include severe headache, vision changes, severe abdominal pain, and bleeding.",
      emergency: "If you're experiencing severe symptoms like bleeding, severe pain, decreased fetal movement, or other concerning signs, contact your doctor immediately or go to the emergency room.",
      general: "I understand your concern. For specific medical questions or symptoms, I always recommend consulting with your healthcare provider who can give you personalized advice based on your individual situation."
    }
    
    return fallbacks[questionType] || fallbacks.general
  }

  // Save new interaction for training
  async saveInteraction(interaction) {
    try {
      const response = await fetch('http://localhost:3000/api/interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interaction)
      })
      
      if (response.ok) {
        // Add to local training data
        this.trainingData.push({
          question: interaction.question.toLowerCase(),
          response: interaction.response,
          vitals: interaction.vitalsData,
          userRole: interaction.userRole,
          pregnancyWeek: interaction.pregnancyWeek,
          rating: interaction.feedbackRating,
          timestamp: new Date()
        })
        
        // Re-analyze patterns
        this.analyzePatterns()
        this.buildResponseTemplates()
        
        console.log('✅ Interaction saved and training data updated')
      }
    } catch (err) {
      console.error('❌ Failed to save interaction:', err)
    }
  }

  // Get training statistics
  getTrainingStats() {
    return {
      totalInteractions: this.trainingData.length,
      categories: this.responseTemplates.size,
      patterns: this.patterns.size,
      averageRating: this.calculateAverageRating()
    }
  }

  // Calculate average rating
  calculateAverageRating() {
    const ratedInteractions = this.trainingData.filter(d => d.rating)
    if (ratedInteractions.length === 0) return 0
    
    const totalRating = ratedInteractions.reduce((sum, d) => sum + d.rating, 0)
    return (totalRating / ratedInteractions.length).toFixed(2)
  }
}

export default AITrainingEngine; 