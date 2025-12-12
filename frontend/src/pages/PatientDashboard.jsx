"use client"

import React, { useState, useEffect, useRef } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Heart,
  Activity,
  Thermometer,
  Baby,
  Phone,
  Clock,
  Bell,
  Sun,
  AlertTriangle,
  MessageCircle,
  Users,
  Menu,
  Globe,
} from "lucide-react"
import VitalCard from "../components/VitalCard"
import { useTranslation } from 'react-i18next'

// ErrorBoundary component for catching errors in the dashboard
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    // Optionally log error
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="bg-white p-6 rounded shadow text-center">
            <h2 className="text-lg font-bold text-red-600 mb-2">Something went wrong.</h2>
            <p className="text-gray-700 mb-4">{this.state.error?.message || "An unexpected error occurred."}</p>
            <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const PatientDashboard = ({ patientId, onLogout }) => {
  const navigate = useNavigate()
  const [vitals, setVitals] = useState({
    heart_rate: null,
    spo2: null,
    temperature: null,
    systolic: null,
    diastolic: null,
  })
  const [lastValidVitals, setLastValidVitals] = useState({
    heart_rate: null,
    spo2: null,
    temperature: null,
    systolic: null,
    diastolic: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [wsStatus, setWsStatus] = useState("Connected")
  const [retryCount, setRetryCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  // --- Fix: Use useRef for ws and reconnectTimeout ---
  const ws = useRef(null)
  const reconnectTimeout = useRef(null)

  const { t, i18n } = useTranslation()

  // Generate health tips based on current vital signs
  const generateHealthTips = () => {
    const tips = []
  
    // Temperature-based tips
    if (vitals.temperature !== null && vitals.temperature !== -127) {
      if (vitals.temperature > 38.0) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "High Temperature Alert",
          message: `Your temperature is ${(vitals.temperature + 5).toFixed(1)}°C. Rest, stay hydrated, and contact your doctor.`,
        })
      } else if (vitals.temperature > 37.5) {
        tips.push({
          icon: Thermometer,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Elevated Temperature",
          message: `Temperature reading of ${(vitals.temperature + 5).toFixed(1)}°C detected. Monitor closely.`,
        })
      } else {
        tips.push({
          icon: Sun,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Normal Temperature",
          message: "Your temperature is within a healthy range. Keep staying active and hydrated!",
        })
      }
    }
  
    // Heart rate-based tips
    if (vitals.heart_rate !== null && vitals.heart_rate > 0) {
      if (vitals.heart_rate > 120) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "High Heart Rate Alert",
          message: `Heart rate elevated to ${Math.round(vitals.heart_rate)} BPM. Try deep breathing exercises.`,
        })
      } else if (vitals.heart_rate > 100) {
        tips.push({
          icon: Heart,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Elevated Heart Rate",
          message: `Heart rate reading of ${Math.round(vitals.heart_rate)} BPM. Practice relaxation techniques.`,
        })
      } else {
        tips.push({
          icon: Heart,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Healthy Heart Rate",
          message: "Your heart rate is within a normal range. Keep up the good work!",
        })
      }
    }
  
    // Oxygen saturation-based tips
    if (vitals.spo2 !== null && vitals.spo2 > 0) {
      if (vitals.spo2 < 90) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Low Oxygen Alert",
          message: `Oxygen level dropped to ${vitals.spo2.toFixed(1)}%. Sit upright and take deep breaths.`,
        })
      } else if (vitals.spo2 < 95) {
        tips.push({
          icon: Activity,
          color: "text-orange-600",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          title: "Low Oxygen Level",
          message: `Oxygen reading of ${vitals.spo2.toFixed(1)}% detected. Practice deep breathing.`,
        })
      } else {
        tips.push({
          icon: Activity,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Healthy Oxygen Level",
          message: "Your oxygen saturation is optimal. Keep breathing deeply and staying active!",
        })
      }
    }
  
    // Blood pressure-based tips
    if (vitals.systolic !== null && vitals.systolic > 0) {
      if (vitals.systolic > 140) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "High Blood Pressure Alert",
          message: `Your systolic blood pressure is ${vitals.systolic.toFixed(0)} mmHg. Reduce salt intake and consult your doctor.`,
        })
      } else if (vitals.systolic < 90) {
        tips.push({
          icon: AlertTriangle,
          color: "text-red-600",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          title: "Low Blood Pressure Alert",
          message: `Your systolic blood pressure is ${vitals.systolic.toFixed(0)} mmHg. Stay hydrated and eat balanced meals.`,
        })
      } else {
        tips.push({
          icon: Activity,
          color: "text-green-600",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
          title: "Healthy Blood Pressure",
          message: "Your blood pressure is within a normal range. Keep maintaining a healthy lifestyle!",
        })
      }
    }
  
    // Default wellness tip if no alerts
    if (tips.length === 0) {
      tips.push({
        icon: Sun,
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        title: "All Good!",
        message: "Your vital signs are within normal range. Keep up the great work!",
      })
    }
  
    return tips.slice(0, 5) // Show max 5 tips
  }
  
  useEffect(() => {
    const fetchVitals = async () => {
      try {
        setIsRefreshing(true)
        const response = await fetch(`${API_BASE_URL}/api/data`)
        console.log(`${API_BASE_URL}/api/data`)
        if (!response.ok) throw new Error("Failed to fetch vital signs. Please check your connection or try again later.")
        const data = await response.json()

        if (Array.isArray(data) && data.length > 0) {
          const latestReading = data[0]
          const newVitals = {
            heart_rate: latestReading.heart_rate ?? null,
            spo2: latestReading.spo2 ?? null,
            temperature: latestReading.temperature ?? null,
            systolic: latestReading.blood_pressure ?? null,
            diastolic: null,
          }
          setVitals(newVitals)
          setLastUpdated(new Date(latestReading.timestamp || new Date()))
          // Update last valid vitals only if the new value is valid
          setLastValidVitals(prev => ({
            heart_rate: (newVitals.heart_rate && newVitals.heart_rate > 0) ? newVitals.heart_rate : prev.heart_rate,
            spo2: (newVitals.spo2 && newVitals.spo2 > 0) ? newVitals.spo2 : prev.spo2,
            temperature: (newVitals.temperature && newVitals.temperature > 20 && newVitals.temperature !== -127) ? newVitals.temperature : prev.temperature,
            systolic: (newVitals.systolic && newVitals.systolic > 60 && newVitals.systolic < 180) ? newVitals.systolic : prev.systolic,
            diastolic: prev.diastolic, // No diastolic data
          }))
        } else {
          throw new Error("Invalid data format from server.")
        }
        setError(null)
      } catch (err) {
        console.error("Fetch vitals error:", err.message)
        setError(err.message || "Failed to fetch vital signs")
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchVitals()
    const pollInterval = setInterval(fetchVitals, 3000)
    // connectWebSocket() // Removed undefined call

    return () => {
      clearInterval(pollInterval)
      // --- Fix: Use ws.current and reconnectTimeout.current ---
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close()
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
    }
  }, [retryCount])

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

  const getVitalStatus = (type, value) => {
    if (value === null || value === 0 || value === -127) return "critical"
    switch (type) {
      case "temperature":
        if (value < 20 || value > 42) return "critical"
        return value > 37.5 ? "critical" : value > 37 ? "warning" : "normal"
      case "heart_rate":
        if (value < 10) return "critical"
        return value > 100 ? "critical" : value > 90 ? "warning" : "normal"
      case "spo2":
        if (value < 50) return "critical"
        return value < 95 ? "critical" : value < 97 ? "warning" : "normal"
      case "blood_pressure":
        if (value < 60 || value > 180) return "critical"
        return value > 140 || value < 90 ? "warning" : "normal"
      default:
        return "normal"
    }
  }

  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-3"></div>
          <p className="text-sm text-gray-600">Loading your health data...</p>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-6 rounded shadow text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button className="bg-pink-500 text-white px-4 py-2 rounded" onClick={() => { setError(null); setLoading(true); setRetryCount((c) => c + 1) }}>Retry</button>
        </div>
      </div>
    )

  const healthTips = generateHealthTips()

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-pink-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-lg shadow-sm">
                <Baby className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-800">{t('dashboard_health_monitor')}</h1>
                <p className="text-xs text-gray-600 hidden sm:block">{t('dashboard_welcome', { name: patientId.split("_")[1] })}</p>
              </div>
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en')}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow ml-2"
              title={t('navbar_language')}
            >
              <Globe className="w-4 h-4" />
              <span>{i18n.language === 'en' ? t('navbar_amharic') : t('navbar_english')}</span>
            </button>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2">
              <Link
                to="/chat"
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-2 rounded-lg transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </Link>
              <Link
                to="/notifications"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 p-2 rounded-lg transition-all shadow-sm"
              >
                <Bell className="w-4 h-4 text-white" />
              </Link>
              <div className="flex items-center bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    wsStatus === "Connected" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs font-medium text-gray-700">{wsStatus}</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 transition-colors text-xs font-medium"
              >
                Sign Out
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
                <Link
                  to="/chat"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">AI Assistant</span>
                </Link>
                <Link
                  to="/notifications"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Bell className="w-4 h-4 text-orange-600" />
                  <span className="text-sm text-gray-700">Notifications</span>
                </Link>
                <button
                  onClick={onLogout}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-sm text-gray-700">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 py-4 space-y-4">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-3 shadow-sm">
            <div className="flex">
              <AlertTriangle className="w-4 h-4 text-red-400 mr-2 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Pregnancy Progress Card */}
        <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 rounded-lg p-4 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-1">{t('preg')}</h2>
              <p className="text-pink-100 text-sm mb-3">{t('week')} 32 {t('of')} 40 • {t('great')}</p>
              <div className="bg-white/20 rounded-full h-2 mb-1">
                <div className="bg-white rounded-full h-2 transition-all duration-500" style={{ width: "80%" }}></div>
              </div>
              <p className="text-xs text-pink-100">80% Complete</p>
            </div>
            <div className="text-center bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-2xl font-bold">56</div>
              <div className="text-xs opacity-90">{t('days')}</div>
            </div>
          </div>
        </div>

        {/* Vital Signs Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <VitalCard
            icon={Heart}
            title={t('heart')}
            value={lastValidVitals.heart_rate !== null ? Math.round(lastValidVitals.heart_rate) : "N/A"}
            unit="BPM"
            status={getVitalStatus("heart_rate", lastValidVitals.heart_rate)}
            color="bg-gradient-to-r from-red-500 to-pink-500"
          />
          <VitalCard
            icon={Activity}
            title={t('oxygen')}
            value={lastValidVitals.spo2 !== null ? lastValidVitals.spo2.toFixed(1) : "N/A"}
            unit="%"
            status={getVitalStatus("spo2", lastValidVitals.spo2)}
            color="bg-gradient-to-r from-blue-500 to-cyan-500"
          />
          <VitalCard
            icon={Thermometer}
            title={t('temp')}
            value={lastValidVitals.temperature !== null ? (lastValidVitals.temperature + 5).toFixed(1) : "N/A"}
            unit="°C"
            status={getVitalStatus("temperature", lastValidVitals.temperature)}
            color="bg-gradient-to-r from-orange-500 to-red-500"
          />
          <VitalCard
            icon={Activity}
            title={t('bp')}
            value={lastValidVitals.systolic !== null ? `${lastValidVitals.systolic.toFixed(0)}/--` : "N/A"}
            unit="mmHg"
            status={getVitalStatus("blood_pressure", lastValidVitals.systolic)}
            color="bg-gradient-to-r from-green-500 to-emerald-500"
          />
        </div>

        {/* Last Updated Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">{t('data')}</h3>
                <p className="text-xs text-gray-600">
                  {lastUpdated ? `${t('last')}: ${lastUpdated.toLocaleTimeString()}` : t('no')}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-gray-800">
                {lastUpdated ? lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A"}
              </div>
              <div className="text-xs text-gray-500">{t('reading')}</div>
            </div>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20">
          <div className="flex items-center mb-3">
            <Phone className="w-4 h-4 text-red-600 mr-2" />
            <h3 className="text-sm font-semibold text-gray-800">{t('emergency')}</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center space-x-2"
              onClick={() => window.open('tel:+919876543210', '_self')}>
              <Phone className="w-4 h-4" />
              <span>{t('call')}</span>
            </button>
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>{t('contact')}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Health Tips */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-800">{t('health')}</h3>
          {healthTips.map((tip, index) => {
            const IconComponent = tip.icon
            return (
              <div
                key={index}
                className={`${tip.bgColor} border-l-4 ${tip.borderColor} rounded-lg p-4 shadow-sm backdrop-blur-sm`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${tip.bgColor.replace("50", "100")} shadow-sm`}>
                    <IconComponent className={`w-4 h-4 ${tip.color}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className={`text-sm font-semibold ${tip.color} mb-1`}>{tip.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{tip.message}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

const WrappedPatientDashboard = (props) => (
  <ErrorBoundary>
    <PatientDashboard {...props} />
  </ErrorBoundary>
)

export default WrappedPatientDashboard
