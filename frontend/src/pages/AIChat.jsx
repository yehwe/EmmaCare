"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Send, Bot, User, MessageCircle, Baby, Stethoscope, Loader, Sparkles, Menu } from "lucide-react"
import aiEngine from "../utils/aiEngine"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL


const AIChat = ({ user, userRole, onLogout }) => {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your AI health assistant. I can answer questions about your measured vital signs and provide general pregnancy advice. How can I assist you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [vitals, setVitals] = useState(null)
  const [lastValidVitals, setLastValidVitals] = useState({
    heart_rate: null,
    spo2: null,
    temperature: null,
    systolic: null,
  })
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/data`)
        console.log(`${API_BASE_URL}/api/data`)
        if (response.ok) {
          const data = await response.json()
          if (data && data.length > 0) {
            const latest = data[0]
            const newVitals = {
              heart_rate: latest.heart_rate,
              spo2: latest.spo2,
              temperature: latest.temperature,
              systolic: latest.blood_pressure,
            }
            setVitals(newVitals)
            setLastValidVitals(prev => ({
              heart_rate: (newVitals.heart_rate && newVitals.heart_rate > 0) ? newVitals.heart_rate : prev.heart_rate,
              spo2: (newVitals.spo2 && newVitals.spo2 > 0) ? newVitals.spo2 : prev.spo2,
              temperature: (newVitals.temperature && newVitals.temperature > 20 && newVitals.temperature !== -127) ? newVitals.temperature : prev.temperature,
              systolic: (newVitals.systolic && newVitals.systolic > 60 && newVitals.systolic < 180) ? newVitals.systolic : prev.systolic,
            }))
          }
        }
      } catch (err) {
        console.error("Failed to fetch vitals for AI Chat:", err)
      }
    }

    fetchVitals()
    const interval = setInterval(fetchVitals, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // Load lastValidVitals from localStorage on mount
    const stored = localStorage.getItem('lastValidVitals')
    if (stored) {
      try {
        setLastValidVitals(JSON.parse(stored))
      } catch {}
    }
  }, [])

  useEffect(() => {
    // Save lastValidVitals to localStorage whenever it changes
    localStorage.setItem('lastValidVitals', JSON.stringify(lastValidVitals))
  }, [lastValidVitals])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    setTimeout(() => {
      const aiResponseText = aiEngine.generateResponse(inputMessage, lastValidVitals)

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponseText,
        sender: "ai",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickQuestions = [
    "Is my heart rate normal?",
    "Check my oxygen level",
    "How is my temperature?",
    "What about my blood pressure?",
    "Advice on nutrition",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-blue-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-3 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(userRole === "patient" ? "/patient" : "/doctor")}
                className="p-1.5 hover:bg-gray-100 rounded-lg mr-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 rounded-lg shadow-sm">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-800">AI Health Assistant</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Get personalized guidance based on your vitals</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2">
              <div className="flex items-center bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1 rounded-lg mr-1.5">
                  {userRole === "patient" ? (
                    <Baby className="w-3 h-3 text-white" />
                  ) : (
                    <Stethoscope className="w-3 h-3 text-white" />
                  )}
                </div>
                <span className="text-xs text-gray-600 capitalize font-medium">{userRole}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 transition-colors text-xs font-medium"
              >
                Exit
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="sm:hidden mt-3 pt-3 border-t border-gray-200">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2 p-2">
                  <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1 rounded-lg">
                    {userRole === "patient" ? (
                      <Baby className="w-3 h-3 text-white" />
                    ) : (
                      <Stethoscope className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700 capitalize">{userRole}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-sm text-gray-700">Exit</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 py-4 h-[calc(100vh-80px)] flex flex-col">
        <div className="flex-1 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start space-x-2 max-w-[85%] ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                >
                  <div
                    className={`p-2 rounded-lg shadow-sm ${message.sender === "user" ? "bg-gradient-to-r from-purple-500 to-indigo-600" : "bg-gradient-to-r from-blue-500 to-cyan-600"}`}
                  >
                    {message.sender === "user" ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg shadow-sm ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-purple-500 to-indigo-600 text-white"
                        : "bg-white border border-gray-200 text-gray-800"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-1 ${message.sender === "user" ? "text-purple-200" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-2 max-w-[85%]">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 shadow-sm">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 text-gray-800 p-3 rounded-lg shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Loader className="w-4 h-4 animate-spin text-blue-600" />
                      <p className="text-sm">AI is analyzing your data...</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length < 3 && (
            <div className="p-4 border-t bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center mb-2">
                <Sparkles className="w-3 h-3 text-blue-600 mr-1" />
                <p className="text-xs font-medium text-gray-700">Quick questions to get started:</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setInputMessage(question)}
                    className="text-xs bg-white hover:bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full border border-blue-200 transition-all shadow-sm"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about your vital signs or general pregnancy topics..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none transition-colors"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 text-white p-2 rounded-lg transition-all shadow-sm disabled:shadow-none"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              This AI assistant provides general information based on your sensor data. Always consult your healthcare
              provider for medical advice.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default AIChat
