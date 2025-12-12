"use client"

import { useState } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import Login from "./components/Login"
import PatientDashboard from "./pages/PatientDashboard"
import DoctorDashboard from "./pages/DoctorDashboard"
import AIChat from "./pages/AIChat"
import Notifications from "./pages/Notifications"

const App = () => {
  const [user, setUser] = useState(null)
  const [userRole, setUserRole] = useState(null)

  const handleLogin = (role, userId) => {
    setUser(userId)
    setUserRole(role)
  }

  const handleLogout = () => {
    setUser(null)
    setUserRole(null)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={userRole === "patient" ? <Navigate to="/patient" replace /> : <Navigate to="/doctor" replace />}
        />
        <Route
          path="/patient"
          element={
            userRole === "patient" ? (
              <PatientDashboard patientId={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/doctor" replace />
            )
          }
        />
        <Route
          path="/doctor"
          element={
            userRole === "doctor" ? (
              <DoctorDashboard doctorId={user} onLogout={handleLogout} />
            ) : (
              <Navigate to="/patient" replace />
            )
          }
        />
        <Route path="/chat" element={<AIChat user={user} userRole={userRole} onLogout={handleLogout} />} />
        <Route
          path="/notifications"
          element={<Notifications user={user} userRole={userRole} onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  )
}

export default App
