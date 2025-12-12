"use client"

import { useState } from "react"
import { Baby, User, Stethoscope, ArrowLeft, Upload, Camera, UserPlus, MessageCircle, Globe } from "lucide-react"
import { useTranslation } from 'react-i18next'
import logo from '../../public/logo.jpg'
const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [showRegister, setShowRegister] = useState(false)
  const [error, setError] = useState(null)

  const [doctorForm, setDoctorForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    specialization: "Obstetrics & Gynecology",
    licenseNumber: "",
    hospital: "",
    experience: "",
    bio: "",
  })

  const [formErrors, setFormErrors] = useState({})

  const { t, i18n } = useTranslation()

  const validateDoctorForm = () => {
    const errors = {}
    if (!doctorForm.fullName) errors.fullName = "Name is required"
    if (!doctorForm.email) errors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(doctorForm.email)) errors.email = "Email is invalid"
    if (!doctorForm.password) errors.password = "Password is required"
    else if (doctorForm.password.length < 6) errors.password = "Password must be at least 6 characters"
    if (doctorForm.password !== doctorForm.confirmPassword) errors.confirmPassword = "Passwords don't match"
    if (!doctorForm.phone) errors.phone = "Phone number is required"
    if (!doctorForm.licenseNumber) errors.licenseNumber = "License number is required"
    return errors
  }

  const handleDoctorRegister = async () => {
    const errors = validateDoctorForm()
    if (Object.keys(errors).length === 0) {
      try {
        console.log("Doctor registration data:", doctorForm)
        onLogin("doctor", `doctor_${doctorForm.email}`)
      } catch (err) {
        setError("Registration failed. Please try again.")
      }
    } else {
      setFormErrors(errors)
    }
  }

  const handleSubmit = async () => {
    try {
      if (role === "patient" && email === "patient@gmail.com" && password === "12345678") {
        onLogin("patient", `patient_${email}`)
      } else if (role === "doctor" && email === "doctor@gmail.com" && password === "12345678") {
        onLogin("doctor", `doctor_${email}`)
      } else {
        throw new Error("Invalid credentials")
      }
    } catch (err) {
      setError("Login failed. Please check your credentials.")
    }
  }

  if (showRegister) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-3">
        <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-100 p-5 relative">
          {/* Language Switcher */}
          <button
            onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en')}
            className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow"
            title={t('navbar_language')}
          >
            <Globe className="w-4 h-4" />
            <span>{i18n.language === 'en' ? t('navbar_amharic') : t('navbar_english')}</span>
          </button>
          <div className="flex items-center mb-5">
            <button
              onClick={() => setShowRegister(false)}
              className="p-1.5 hover:bg-gray-100 rounded-md mr-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-gray-600" />
            </button>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-1.5 rounded-lg mr-2">
                <Stethoscope className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-semibold text-gray-800">Doctor Registration</h1>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-center mb-5">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                  <Camera className="w-6 h-6 text-gray-400" />
                </div>
                <button className="absolute bottom-0 right-0 bg-indigo-500 text-white p-1 rounded-full hover:bg-indigo-600 transition-colors">
                  <Upload className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="Full Name *"
                  value={doctorForm.fullName}
                  onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                    formErrors.fullName
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {formErrors.fullName && <p className="text-red-500 text-xs mt-1">{formErrors.fullName}</p>}
              </div>

              <div>
                <input
                  type="email"
                  placeholder="Email Address *"
                  value={doctorForm.email}
                  onChange={(e) => setDoctorForm({ ...doctorForm, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                    formErrors.email
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
              </div>

              <div>
                <input
                  type="tel"
                  placeholder="Phone Number *"
                  value={doctorForm.phone}
                  onChange={(e) => setDoctorForm({ ...doctorForm, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                    formErrors.phone
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {formErrors.phone && <p className="text-red-500 text-xs mt-1">{formErrors.phone}</p>}
              </div>

              <div>
                <select
                  value={doctorForm.specialization}
                  onChange={(e) => setDoctorForm({ ...doctorForm, specialization: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                >
                  <option value="Obstetrics & Gynecology">Obstetrics & Gynecology</option>
                  <option value="Maternal-Fetal Medicine">Maternal-Fetal Medicine</option>
                  <option value="Neonatology">Neonatology</option>
                  <option value="Midwifery">Midwifery</option>
                </select>
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Password *"
                  value={doctorForm.password}
                  onChange={(e) => setDoctorForm({ ...doctorForm, password: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                    formErrors.password
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm Password *"
                  value={doctorForm.confirmPassword}
                  onChange={(e) => setDoctorForm({ ...doctorForm, confirmPassword: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                    formErrors.confirmPassword
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {formErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>
                )}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="License Number *"
                  value={doctorForm.licenseNumber}
                  onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-md text-sm transition-colors ${
                    formErrors.licenseNumber
                      ? "border-red-300 bg-red-50"
                      : "border-gray-300 hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
                {formErrors.licenseNumber && <p className="text-red-500 text-xs mt-1">{formErrors.licenseNumber}</p>}
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Years of Experience"
                  value={doctorForm.experience}
                  onChange={(e) => setDoctorForm({ ...doctorForm, experience: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Hospital/Clinic"
                value={doctorForm.hospital}
                onChange={(e) => setDoctorForm({ ...doctorForm, hospital: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>

            <div>
              <textarea
                placeholder="Professional Bio"
                value={doctorForm.bio}
                onChange={(e) => setDoctorForm({ ...doctorForm, bio: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm hover:border-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                rows="2"
              />
            </div>

            <button
              onClick={handleDoctorRegister}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2.5 px-4 rounded-md text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              Register as Doctor
            </button>

            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 flex items-center justify-center p-3">
      {/* Chat Icon - Always visible */}
      <div className="fixed top-3 right-3 z-50">
        <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-2.5 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
          <MessageCircle className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full max-w-sm bg-white/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-100 p-6 relative">
        {/* Language Switcher */}
        <button
          onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'am' : 'en')}
          className="absolute top-3 right-3 flex items-center space-x-1 px-2 py-1 rounded bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow"
          title={t('navbar_language')}
        >
          <Globe className="w-4 h-4" />
          <span>{i18n.language === 'en' ? t('navbar_amharic') : t('navbar_english')}</span>
        </button>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full mb-3 shadow-md">
            <img className="rounded-full" src={logo} alt="" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-1">{t('log')}</h1>
          <p className="text-sm text-gray-600">{t("logintro")}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700 mb-4">{error}</div>
        )}

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`p-3 rounded-md border transition-all text-xs font-medium ${
                role === "patient"
                  ? "border-pink-300 bg-pink-50 text-pink-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <User className="w-4 h-4 mx-auto mb-1" />
              {t('patient')}
            </button>
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`p-3 rounded-md border transition-all text-xs font-medium ${
                role === "doctor"
                  ? "border-purple-300 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-600"
              }`}
            >
              <Stethoscope className="w-4 h-4 mx-auto mb-1" />
              {t('doctor')}
            </button>
          </div>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm transition-colors hover:border-gray-400"
            placeholder="Email address"
            required
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-md focus:ring-1 focus:ring-pink-500 focus:border-pink-500 text-sm transition-colors hover:border-gray-400"
            placeholder="Password"
            required
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-2.5 px-4 rounded-md text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
          >
            {t('signin')}
          </button>
        </div>

        <div className="mt-6 text-center space-y-3">
          {role === "doctor" && (
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center justify-center w-full text-xs text-purple-600 hover:text-purple-800 font-medium py-2 px-3 rounded-md hover:bg-purple-50 transition-all"
            >
              <UserPlus className="w-3 h-3 mr-1" />
              {t('register')}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Login
