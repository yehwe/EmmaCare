"use client"

import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  Heart,
  Activity,
  Thermometer,
  Bell,
  Stethoscope,
  Search,
  Plus,
  Edit,
  Trash2,
  Clock,
  X,
  Save,
  MessageCircle,
  Users,
  TrendingUp,
  Menu,
} from "lucide-react"
import VitalCard from "../components/VitalCard"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const DoctorDashboard = ({ doctorId, onLogout }) => {
  const navigate = useNavigate()
  const [selectedPatient, setSelectedPatient] = useState("patient123")
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
  const [alerts, setAlerts] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [wsStatus, setWsStatus] = useState("Connecting...")
  const [retryCount, setRetryCount] = useState(0)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [patients, setPatients] = useState([
    {
      id: "patient1",
      name: "Patient",
      age: 28,
      weeks: 32,
      status: "normal",
      phone: "+91 9876543210",
      email: "patient@email.com",
      conceivedDate: "2024-05-15",
      deliveryDate: "2025-02-19",
      address: "Mumbai, Maharashtra",
    },
    {
      id: "patient2",
      name: "Patient 2",
      age: 25,
      weeks: 28,
      status: "normal",
      phone: "+91 9876543222",
      email: "patient2@email.com",
      conceivedDate: "2024-06-01",
      deliveryDate: "2025-03-08",
      address: "Delhi, NCR",
    },
  ])

  const [newPatient, setNewPatient] = useState({
    name: "",
    age: "",
    phone: "",
    email: "",
    conceivedDate: "",
    address: "",
  })

  useEffect(() => {
    const fetchVitals = async () => {
      try {
        setIsRefreshing(true)
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
          setLastUpdated(new Date(latestReading.timestamp || new Date()))
          checkAlerts(vitalsData)
          setLastValidVitals(prev => ({
            heart_rate: (vitalsData.heart_rate && vitalsData.heart_rate > 0) ? vitalsData.heart_rate : prev.heart_rate,
            spo2: (vitalsData.spo2 && vitalsData.spo2 > 0) ? vitalsData.spo2 : prev.spo2,
            temperature: (vitalsData.temperature && vitalsData.temperature > 20 && vitalsData.temperature !== -127) ? vitalsData.temperature : prev.temperature,
            systolic: (vitalsData.systolic && vitalsData.systolic > 60 && vitalsData.systolic < 180) ? vitalsData.systolic : prev.systolic,
            diastolic: prev.diastolic,
          }))
        } else {
          throw new Error("Invalid data format")
        }
      } catch (err) {
        console.error("Fetch vitals error:", err.message)
      } finally {
        setIsRefreshing(false)
      }
    }

    fetchVitals()
    const pollInterval = setInterval(fetchVitals, 3000)

    return () => {
      clearInterval(pollInterval)
    }
  }, [retryCount])

  const checkAlerts = (data) => {
    const newAlerts = []
    if (data.heart_rate > 100) {
      newAlerts.push({
        message: `Heart Rate: ${data.heart_rate.toFixed(1)} BPM (Elevated)`,
        timestamp: new Date().toISOString(),
        severity: "critical",
      })
    }
    if (data.spo2 < 95) {
      newAlerts.push({
        message: `SpO2: ${data.spo2.toFixed(1)} % (Low)`,
        timestamp: new Date().toISOString(),
        severity: "critical",
      })
    }
    if (data.temperature > 37.5 || data.temperature === -127) {
      newAlerts.push({
        message: `Temperature: ${data.temperature.toFixed(1)} °C (${data.temperature === -127 ? "Disconnected" : "High"})`,
        timestamp: new Date().toISOString(),
        severity: "critical",
      })
    }
    if (data.systolic && (data.systolic > 140 || data.systolic < 90)) {
      newAlerts.push({
        message: `Blood Pressure: ${data.systolic.toFixed(0)} mmHg (${data.systolic > 140 ? "High" : "Low"})`,
        timestamp: new Date().toISOString(),
        severity: data.systolic > 160 || data.systolic < 70 ? "critical" : "warning",
      })
    }
    if (newAlerts.length > 0) {
      setAlerts((prev) => [...newAlerts, ...prev].slice(0, 5))
    }
  }

  const calculateDeliveryDate = (conceivedDate) => {
    const conceived = new Date(conceivedDate)
    const delivery = new Date(conceived)
    delivery.setDate(conceived.getDate() + 280)
    return delivery.toISOString().split("T")[0]
  }

  const calculateWeeksPregnant = (conceivedDate) => {
    const conceived = new Date(conceivedDate)
    const now = new Date()
    const diffTime = Math.abs(now - conceived)
    const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7))
    return Math.min(diffWeeks, 40)
  }

  const calculateDaysUntilDelivery = (deliveryDate) => {
    const delivery = new Date(deliveryDate)
    const now = new Date()
    const diffTime = delivery - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPatient = () => {
    if (newPatient.name && newPatient.conceivedDate) {
      const deliveryDate = calculateDeliveryDate(newPatient.conceivedDate)
      const weeks = calculateWeeksPregnant(newPatient.conceivedDate)
      const patient = {
        id: `patient${Date.now()}`,
        ...newPatient,
        age: Number.parseInt(newPatient.age),
        weeks,
        deliveryDate,
        status: "normal",
      }
      setPatients([...patients, patient])
      setNewPatient({ name: "", age: "", phone: "", email: "", conceivedDate: "", address: "" })
      setShowAddPatient(false)
    }
  }

  const handleDeletePatient = (patientId) => {
    setPatients(patients.filter((p) => p.id !== patientId))
    if (selectedPatient === patientId) {
      setSelectedPatient(patients[0]?.id || "")
    }
  }

  const handleUpdatePatient = (updatedPatient) => {
    const deliveryDate = calculateDeliveryDate(updatedPatient.conceivedDate)
    const weeks = calculateWeeksPregnant(updatedPatient.conceivedDate)
    setPatients(
      patients.map((p) =>
        p.id === updatedPatient.id
          ? { ...updatedPatient, deliveryDate, weeks, age: Number.parseInt(updatedPatient.age) }
          : p,
      ),
    )
    setEditingPatient(null)
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-3 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-1.5 rounded-lg shadow-sm">
                <img src="/logo.jpg" alt="Logo" className="w-8 h-8 object-contain rounded" />
              </div>
              <div>
                <h1 className="text-base font-semibold text-gray-800">Doctor Portal</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Dr. {doctorId.split("_")[1]}</p>
              </div>
            </div>

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
                className="relative bg-gradient-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700 p-2 rounded-lg transition-all shadow-sm"
              >
                <Bell className="w-4 h-4 text-white" />
                {alerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-800 text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold text-[10px]">
                    {alerts.length}
                  </span>
                )}
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
                  <Bell className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-gray-700">Notifications</span>
                  {alerts.length > 0 && (
                    <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded-full font-medium">
                      {alerts.length}
                    </span>
                  )}
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

      <main className="max-w-7xl mx-auto px-3 py-4 space-y-4">
        {/* Patient Management Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-3 sm:space-y-0">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Patient Management</h2>
              <p className="text-xs text-gray-600">Monitor and manage your patients</p>
            </div>
            <button
              onClick={() => setShowAddPatient(true)}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center transition-all shadow-sm"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Patient
            </button>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors hover:border-gray-400"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPatients.map((patient) => {
              const daysLeft = calculateDaysUntilDelivery(patient.deliveryDate)
              return (
                <div
                  key={patient.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPatient === patient.id
                      ? "border-purple-300 bg-purple-50 shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                  onClick={() => setSelectedPatient(patient.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm text-gray-800">{patient.name}</div>
                      <div className="text-xs text-gray-600">
                        {patient.age}y • {patient.weeks}w pregnant
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingPatient(patient)
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                      >
                        <Edit className="w-3 h-3 text-gray-600" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeletePatient(patient.id)
                        }}
                        className="p-1 hover:bg-red-200 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </button>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          patient.status === "normal" ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">📞 {patient.phone}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-blue-600 font-medium flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {daysLeft} days to delivery
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Live Vitals Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-gray-800 mb-1">Live Vitals Monitor</h2>
              <p className="text-xs text-gray-600">
                Real-time data for {patients.find((p) => p.id === selectedPatient)?.name || "Selected Patient"}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-white/80 rounded-lg px-2 py-1 shadow-sm">
                <div
                  className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                    wsStatus === "Connected" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <span className="text-xs font-medium text-gray-700">{wsStatus}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <VitalCard
              icon={Heart}
              title="Heart Rate"
              value={selectedPatient === 'patient1' ? (lastValidVitals.heart_rate ? Math.round(lastValidVitals.heart_rate) : "N/A") : 88}
              unit="BPM"
              status={getVitalStatus("heart_rate", selectedPatient === 'patient1' ? lastValidVitals.heart_rate : 88)}
              color="bg-gradient-to-r from-red-500 to-pink-500"
            />
            <VitalCard
              icon={Activity}
              title="Oxygen"
              value={selectedPatient === 'patient1' ? (lastValidVitals.spo2 ? lastValidVitals.spo2.toFixed(1) : "N/A") : 97.2}
              unit="%"
              status={getVitalStatus("spo2", selectedPatient === 'patient1' ? lastValidVitals.spo2 : 97.2)}
              color="bg-gradient-to-r from-blue-500 to-cyan-500"
            />
            <VitalCard
              icon={Thermometer}
              title="Temperature"
              value={selectedPatient === 'patient1' ? (lastValidVitals.temperature ? lastValidVitals.temperature.toFixed(1) : "N/A") : 36.8}
              unit="°C"
              status={getVitalStatus("temperature", selectedPatient === 'patient1' ? lastValidVitals.temperature : 36.8)}
              color="bg-gradient-to-r from-orange-500 to-red-500"
            />
            <VitalCard
              icon={Activity}
              title="Blood Pressure"
              value={selectedPatient === 'patient1' ? (lastValidVitals.systolic ? `${lastValidVitals.systolic.toFixed(0)}/${lastValidVitals.diastolic ? lastValidVitals.diastolic.toFixed(0) : "--"}` : "N/A") : "120/80"}
              unit="mmHg"
              status={getVitalStatus("blood_pressure", selectedPatient === 'patient1' ? lastValidVitals.systolic : 120)}
              color="bg-gradient-to-r from-green-500 to-emerald-500"
            />
          </div>
        </div>

        {/* Analytics and Alerts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 24h Trends */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20">
            <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-600" />
              24h Trends
            </h3>
            <div className="h-32 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg flex items-center justify-center border border-dashed border-gray-300">
              <div className="text-center">
                <TrendingUp className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Chart Integration Coming Soon</p>
              </div>
            </div>
          </div>

          {/* Recent Alerts */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-white/20">
            <div className="flex items-center mb-3">
              <Bell className="w-4 h-4 text-red-600 mr-2" />
              <h3 className="text-sm font-semibold text-gray-800">Recent Alerts</h3>
              {alerts.length > 0 && (
                <span className="ml-2 bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                  {alerts.length} active
                </span>
              )}
            </div>
            <div className="space-y-2 max-h-28 overflow-y-auto">
              {alerts.slice(0, 3).map((alert, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg text-xs border-l-2 ${
                    alert.severity === "critical"
                      ? "bg-red-50 text-red-700 border-red-400"
                      : "bg-yellow-50 text-yellow-700 border-yellow-400"
                  }`}
                >
                  <div className="font-medium">{alert.message}</div>
                  <div className="text-xs opacity-75 mt-1">{new Date(alert.timestamp).toLocaleString()}</div>
                </div>
              ))}
              {alerts.length === 0 && (
                <div className="text-center py-6">
                  <Bell className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs text-gray-500">No recent alerts</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Patient Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1">Total Patients</h3>
                <p className="text-2xl font-bold">{patients.length}</p>
              </div>
              <Users className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1">Active Monitoring</h3>
                <p className="text-2xl font-bold">{patients.filter((p) => p.status === "normal").length}</p>
              </div>
              <Activity className="w-8 h-8 opacity-80" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-4 text-white shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold mb-1">Critical Alerts</h3>
                <p className="text-2xl font-bold">{alerts.filter((a) => a.severity === "critical").length}</p>
              </div>
              <Bell className="w-8 h-8 opacity-80" />
            </div>
          </div>
        </div>
      </main>

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Add New Patient</h3>
              <button
                onClick={() => setShowAddPatient(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={newPatient.name}
                onChange={(e) => setNewPatient({ ...newPatient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Age"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newPatient.phone}
                  onChange={(e) => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={newPatient.email}
                onChange={(e) => setNewPatient({ ...newPatient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conception Date</label>
                <input
                  type="date"
                  value={newPatient.conceivedDate}
                  onChange={(e) => setNewPatient({ ...newPatient, conceivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                />
              </div>
              <textarea
                placeholder="Address"
                value={newPatient.address}
                onChange={(e) => setNewPatient({ ...newPatient, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                rows="2"
              />
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setShowAddPatient(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Patient Modal */}
      {editingPatient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Edit Patient</h3>
              <button
                onClick={() => setEditingPatient(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Full Name"
                value={editingPatient.name}
                onChange={(e) => setEditingPatient({ ...editingPatient, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Age"
                  value={editingPatient.age}
                  onChange={(e) => setEditingPatient({ ...editingPatient, age: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={editingPatient.phone}
                  onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                />
              </div>
              <input
                type="email"
                placeholder="Email Address"
                value={editingPatient.email}
                onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Conception Date</label>
                <input
                  type="date"
                  value={editingPatient.conceivedDate}
                  onChange={(e) => setEditingPatient({ ...editingPatient, conceivedDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                />
              </div>
              <textarea
                placeholder="Address"
                value={editingPatient.address || ""}
                onChange={(e) => setEditingPatient({ ...editingPatient, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 text-sm transition-colors"
                rows="2"
              />
              <div className="flex space-x-3 pt-2">
                <button
                  onClick={() => setEditingPatient(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdatePatient(editingPatient)}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Save className="w-3 h-3 mr-1" />
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard
