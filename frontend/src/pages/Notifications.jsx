"use client"

import React from 'react'
import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Heart,
  Activity,
  Thermometer,
  Baby,
  Stethoscope,
  Phone,
  MessageCircle,
  X,
  Shield,
  TrendingUp,
  Menu,
} from "lucide-react"
import { useTranslation } from "react-i18next"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// ErrorBoundary for Notifications
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
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

const Notifications = ({ user, userRole, onLogout }) => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all") // all, critical, warning, info
  const [showCallModal, setShowCallModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
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
  const [lastVitalCheck, setLastVitalCheck] = useState(null)
  const [wsStatus, setWsStatus] = useState(t("con"))
  const ws = useRef(null)
  const reconnectTimeout = useRef(null)

  // Check vital signs and generate notifications
  const checkVitalSigns = (vitalsData) => {
    const newNotifications = []
    const timestamp = new Date()

    // Temperature monitoring
    if (vitalsData.temperature !== null && vitalsData.temperature !== -127) {
      if (vitalsData.temperature > 38.0) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: "critical",
          title: "High Temperature Alert",
          message: `Body temperature elevated to ${vitalsData.temperature.toFixed(1)}°C. This may indicate fever or infection. Please call your doctor immediately!`,
          timestamp,
          icon: "Thermometer",
          read: false,
          actionRequired: true,
          vitalType: "temperature",
          value: vitalsData.temperature,
          severity: "critical",
        })
      } else if (vitalsData.temperature > 37.5) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: "warning",
          title: "Elevated Temperature",
          message: `Temperature reading of ${vitalsData.temperature.toFixed(1)}°C detected. Monitor closely.`,
          timestamp,
          icon: "Thermometer",
          read: false,
          actionRequired: false,
          vitalType: "temperature",
          value: vitalsData.temperature,
          severity: "warning",
        })
      }
    }

    // Heart rate monitoring
    if (vitalsData.heart_rate !== null && vitalsData.heart_rate > 0) {
      if (vitalsData.heart_rate > 120 || vitalsData.heart_rate < 50) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: "critical",
          title: "Abnormal Heart Rate Alert",
          message: `Heart rate is ${Math.round(vitalsData.heart_rate)} BPM. This may indicate a critical issue. Please call your doctor immediately!`,
          timestamp,
          icon: "Heart",
          read: false,
          actionRequired: true,
          vitalType: "heart_rate",
          value: vitalsData.heart_rate,
          severity: "critical",
        })
      } else if (vitalsData.heart_rate > 100) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: "warning",
          title: "Elevated Heart Rate",
          message: `Heart rate reading of ${Math.round(vitalsData.heart_rate)} BPM detected.`,
          timestamp,
          icon: "Heart",
          read: false,
          actionRequired: false,
          vitalType: "heart_rate",
          value: vitalsData.heart_rate,
          severity: "warning",
        })
      }
    }

    // SpO2 monitoring
    if (vitalsData.spo2 !== null && vitalsData.spo2 > 0) {
      if (vitalsData.spo2 < 92) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: "critical",
          title: "Low Oxygen Level Alert",
          message: `Oxygen saturation dropped to ${vitalsData.spo2.toFixed(1)}%. This is a critical condition. Please call your doctor immediately!`,
          timestamp,
          icon: "Activity",
          read: false,
          actionRequired: true,
          vitalType: "spo2",
          value: vitalsData.spo2,
          severity: "critical",
        })
      } else if (vitalsData.spo2 < 95) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: "warning",
          title: "Low Oxygen Level Warning",
          message: `Oxygen saturation is ${vitalsData.spo2.toFixed(1)}%. Monitor closely.`,
          timestamp,
          icon: "Activity",
          read: false,
          actionRequired: false,
          vitalType: "spo2",
          value: vitalsData.spo2,
          severity: "warning",
        })
      }
    }

    // Blood pressure monitoring (systolic)
    if (vitalsData.systolic !== null && vitalsData.systolic > 0) {
      if (vitalsData.systolic >= 160) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: "critical",
          title: "High Blood Pressure Alert",
          message: `Systolic blood pressure is ${vitalsData.systolic.toFixed(0)} mmHg. This is a critical condition. Please call your doctor immediately!`,
          timestamp,
          icon: "AlertTriangle",
          read: false,
          actionRequired: true,
          vitalType: "systolic",
          value: vitalsData.systolic,
          severity: "critical",
        })
      } else if (vitalsData.systolic > 140) {
        newNotifications.push({
          id: Date.now() + Math.random(),
          type: "warning",
          title: "Elevated Blood Pressure",
          message: `Systolic blood pressure is ${vitalsData.systolic.toFixed(0)} mmHg. Monitor closely.`,
          timestamp,
          icon: "AlertTriangle",
          read: false,
          actionRequired: false,
          vitalType: "systolic",
          value: vitalsData.systolic,
          severity: "warning",
        })
      }
    }

    // Add new notifications to the list
    if (newNotifications.length > 0) {
      setNotifications((prev) => [...newNotifications, ...prev].slice(0, 50)) // Keep last 50 notifications
    }

    setLastVitalCheck(timestamp)
    return newNotifications
  }

  // Fetch vital signs from API
  const fetchVitals = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/data`)
      if (!response.ok) throw new Error("Failed to fetch vital signs")
      const data = await response.json()

      if (Array.isArray(data) && data.length > 0) {
        const latestReading = data[0]
        const vitalsData = {
          heart_rate: latestReading.heart_rate ?? null,
          spo2: latestReading.spo2 ?? null,
          temperature: latestReading.temperature ?? null,
          systolic: latestReading.blood_pressure ?? null,
          diastolic: null,
        }
        setVitals(vitalsData)
        setLastValidVitals(prev => ({
          heart_rate: (vitalsData.heart_rate && vitalsData.heart_rate > 0) ? vitalsData.heart_rate : prev.heart_rate,
          spo2: (vitalsData.spo2 && vitalsData.spo2 > 0) ? vitalsData.spo2 : prev.spo2,
          temperature: (vitalsData.temperature && vitalsData.temperature > 20 && vitalsData.temperature !== -127) ? vitalsData.temperature : prev.temperature,
          systolic: (vitalsData.systolic && vitalsData.systolic > 60 && vitalsData.systolic < 180) ? vitalsData.systolic : prev.systolic,
          diastolic: prev.diastolic,
        }))
        // Check for notifications based on last valid vitals
        checkVitalSigns({
          heart_rate: (vitalsData.heart_rate && vitalsData.heart_rate > 0) ? vitalsData.heart_rate : lastValidVitals.heart_rate,
          spo2: (vitalsData.spo2 && vitalsData.spo2 > 0) ? vitalsData.spo2 : lastValidVitals.spo2,
          temperature: (vitalsData.temperature && vitalsData.temperature > 20 && vitalsData.temperature !== -127) ? vitalsData.temperature : lastValidVitals.temperature,
          systolic: (vitalsData.systolic && vitalsData.systolic > 60 && vitalsData.systolic < 180) ? vitalsData.systolic : lastValidVitals.systolic,
          diastolic: lastValidVitals.diastolic,
        })
      }
    } catch (err) {
      console.error("Fetch vitals error:", err.message)
    }
  }

  // WebSocket connection for real-time updates
  useEffect(() => {
    // Initial fetch and WebSocket connection
    fetchVitals()
    const pollInterval = setInterval(fetchVitals, 30000)
    return () => {
      clearInterval(pollInterval)
      if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
        ws.current.close()
      }
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
    }
  }, [])

  // Generate sample notifications for doctor role
  useEffect(() => {
    if (userRole === "doctor") {
      const doctorNotifications = [
        {
          id: Date.now() + Math.random(),
          type: "info",
          title: "New Patient Registration",
          message: "Anita Patel has been added to your patient list.",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          icon: "Baby",
          read: true,
          actionRequired: false,
        },
        {
          id: Date.now() + Math.random() + 1,
          type: "info",
          title: "Appointment Reminder",
          message: "You have 3 patient appointments scheduled for today.",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          icon: "Calendar",
          read: false,
          actionRequired: false,
        },
      ]
      setNotifications((prev) => [...doctorNotifications, ...prev])
    }
  }, [userRole])

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

  const getNotificationColor = (type) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "info":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-gray-200 bg-white"
    }
  }

  const getIconColor = (type) => {
    switch (type) {
      case "critical":
        return "text-red-600"
      case "warning":
        return "text-yellow-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-gray-600"
    }
  }

  const getIconComponent = (iconName) => {
    switch (iconName) {
      case "Heart":
        return Heart
      case "Activity":
        return Activity
      case "Thermometer":
        return Thermometer
      case "AlertTriangle":
        return AlertTriangle
      case "CheckCircle":
        return CheckCircle
      case "Calendar":
        return Calendar
      case "Baby":
        return Baby
      default:
        return Bell
    }
  }

  const markAsRead = (id) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const deleteNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const handleCallDoctor = (notification = null) => {
    setSelectedNotification(notification)
    setShowCallModal(true)
  }

  const confirmCall = (phoneType = "doctor") => {
    const doctorPhone = "+91 9876543210"
    const emergencyNumber = "108"

    const phoneNumber = phoneType === "emergency" ? emergencyNumber : doctorPhone
    const callUrl = `tel:${phoneNumber}`

    try {
      window.open(callUrl, "_self")
      alert(`Calling ${phoneType === "emergency" ? "emergency services" : "doctor"}...`)

      if (selectedNotification) {
        markAsRead(selectedNotification.id)
      }
    } catch (error) {
      alert("Failed to initiate call. Please try again or call manually.")
    }

    setShowCallModal(false)
    setSelectedNotification(null)
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true
    return notif.type === filter
  })

  const unreadCount = notifications.filter((notif) => !notif.read).length
  const criticalCount = notifications.filter((notif) => notif.severity === "critical" && !notif.read).length

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}m ago`
    } else if (hours < 24) {
      return `${hours}h ago`
    } else {
      return `${days}d ago`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-orange-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-3 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(userRole === "patient" ? "/patient" : "/doctor")}
                className="p-1.5 hover:bg-gray-100 rounded-lg mr-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="bg-gradient-to-r from-yellow-500 to-red-600 p-1.5 rounded-lg shadow-sm">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-800">{t("notifications")}</h1>
                <p className="text-xs text-gray-600 hidden sm:block">
                  {unreadCount} unread • {criticalCount} critical alerts
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => navigate("/chat")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-2 rounded-lg transition-all shadow-sm"
              >
                <MessageCircle className="w-4 h-4 text-white" />
              </button>
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
                {t("dashboard_exit")}
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
                <button
                  onClick={() => {
                    navigate("/chat")
                    setShowMobileMenu(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-gray-700">AI Assistant</span>
                </button>
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
                  <span className="text-sm text-gray-700">{t("dashboard_exit")}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 py-4 space-y-4">
        {/* Current Vitals Status */}
        {userRole === "patient" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 p-4">
            <div className="flex items-center mb-3">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">{t("current")}</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="text-center bg-white/60 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-1">{t("heart")}</div>
                <div className={`text-lg font-bold ${lastValidVitals.heart_rate > 100 ? "text-red-600" : lastValidVitals.heart_rate > 90 ? "text-yellow-600" : "text-green-600"}`}>
                  {lastValidVitals.heart_rate !== null ? Math.round(lastValidVitals.heart_rate) : "N/A"} BPM
                </div>
              </div>
              <div className="text-center bg-white/60 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-1">{t("oxygen")}</div>
                <div className={`text-lg font-bold ${lastValidVitals.spo2 !== null && lastValidVitals.spo2 < 95 ? "text-red-600" : lastValidVitals.spo2 !== null && lastValidVitals.spo2 < 97 ? "text-yellow-600" : "text-green-600"}`}>
                  {lastValidVitals.spo2 !== null ? lastValidVitals.spo2.toFixed(1) : "N/A"}%
                </div>
              </div>
              <div className="text-center bg-white/60 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-1">{t("temp")}</div>
                <div className={`text-lg font-bold ${lastValidVitals.temperature !== null && lastValidVitals.temperature > 37.5 ? "text-red-600" : lastValidVitals.temperature !== null && lastValidVitals.temperature > 37 ? "text-yellow-600" : "text-green-600"}`}>
                  {lastValidVitals.temperature !== null ? lastValidVitals.temperature.toFixed(1) : "N/A"}°C
                </div>
              </div>
              <div className="text-center bg-white/60 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700 mb-1">{t("bp")}</div>
                <div className={`text-lg font-bold ${lastValidVitals.systolic !== null && lastValidVitals.systolic > 140 ? "text-red-600" : lastValidVitals.systolic !== null && lastValidVitals.systolic > 120 ? "text-yellow-600" : "text-green-600"}`}>
                  {lastValidVitals.systolic !== null ? lastValidVitals.systolic.toFixed(0) : "N/A"} mmHg
                </div>
              </div>
            </div>
            {lastVitalCheck && (
              <div className="text-xs text-gray-500 mt-3 text-center flex items-center justify-center">
                <Clock className="w-3 h-3 mr-1" />
                Last checked: {formatTimeAgo(lastVitalCheck)}
              </div>
            )}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 p-4">
          <div className="flex flex-wrap gap-2">
            {[
              {
                key: "all",
                label: t("all"),
                count: notifications.length,
                color: "bg-gray-100 text-gray-700 hover:bg-gray-200",
              },
              {
                key: "critical",
                label: t("critical"),
                count: notifications.filter((n) => n.type === "critical").length,
                color: "bg-red-100 text-red-700 hover:bg-red-200",
              },
              {
                key: "warning",
                label: t("warn"),
                count: notifications.filter((n) => n.type === "warning").length,
                color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200",
              },
              {
                key: "info",
                label: t("info"),
                count: notifications.filter((n) => n.type === "info").length,
                color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filter === tab.key ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-sm" : tab.color
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 p-8 text-center">
              <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 mb-2">{t("no")}</h3>
              <p className="text-sm text-gray-600 max-w-md mx-auto">
                You're all caught up! No {filter !== "all" ? filter : ""} notifications to show at the moment.
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const IconComponent = getIconComponent(notification.icon)
              return (
                <div
                  key={notification.id}
                  className={`bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border-l-4 p-4 transition-all hover:shadow-md ${getNotificationColor(notification.type)} ${
                    !notification.read ? "border-l-4 shadow-md" : "border-l-2 opacity-90"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div
                        className={`p-2 rounded-lg shadow-sm ${notification.type === "critical" ? "bg-gradient-to-r from-red-500 to-red-600" : notification.type === "warning" ? "bg-gradient-to-r from-yellow-500 to-orange-500" : "bg-gradient-to-r from-blue-500 to-cyan-500"}`}
                      >
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-sm font-semibold text-gray-800">{notification.title}</h3>
                          {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                          {notification.actionRequired && (
                            <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              ACTION REQUIRED
                            </span>
                          )}
                          {notification.severity === "critical" && (
                            <span className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                              CRITICAL
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2 leading-relaxed">{notification.message}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatTimeAgo(notification.timestamp)}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {notification.timestamp.toLocaleDateString()} at{" "}
                            {notification.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-3">
                      {notification.actionRequired && (
                        <button
                          onClick={() => handleCallDoctor(notification)}
                          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center shadow-sm"
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          Call Doctor
                        </button>
                      )}
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm"
                        >
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Quick Actions */}
        {userRole === "patient" && (
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-white/20 p-4">
            <div className="flex items-center mb-3">
              <Shield className="w-4 h-4 text-green-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">Emergency Actions</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => handleCallDoctor()}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <Phone className="w-4 h-4" />
                <span>Call Doctor Now</span>
              </button>
              <button
                onClick={() => navigate("/chat")}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Ask AI Assistant</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Call Confirmation Modal */}
      {showCallModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="text-center">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center shadow-sm">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Emergency Call</h3>
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {selectedNotification
                  ? `This will call your doctor regarding: "${selectedNotification.title}"`
                  : "This will call your primary doctor for immediate consultation."}
              </p>
              <div className="flex space-x-3 mb-4">
                <button
                  onClick={() => setShowCallModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmCall("doctor")}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  Call Doctor
                </button>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => confirmCall("emergency")}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all shadow-sm"
                >
                  Emergency Call (108)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const WrappedNotifications = (props) => (
  <ErrorBoundary>
    <Notifications {...props} />
  </ErrorBoundary>
)

export default WrappedNotifications
