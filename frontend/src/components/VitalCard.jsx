import { CheckCircle, AlertTriangle, XCircle } from "lucide-react"

const VitalCard = ({ icon: Icon, title, value, unit, status, color }) => {
  const getStatusColor = () => {
    switch (status) {
      case "normal":
        return "border-green-200 bg-green-50"
      case "warning":
        return "border-yellow-200 bg-yellow-50"
      case "critical":
        return "border-red-200 bg-red-50"
      default:
        return "border-gray-200 bg-white"
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case "normal":
        return <CheckCircle className="w-3 h-3 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-3 h-3 text-yellow-600" />
      case "critical":
        return <XCircle className="w-3 h-3 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className={`rounded-lg p-3 border-2 ${getStatusColor()} transition-all hover:shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <div className={`p-1.5 rounded-lg ${color}`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <div className="flex items-center">{getStatusIcon()}</div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500">{unit}</div>
      </div>
      <h3 className="text-xs font-medium text-gray-700 mt-1">{title}</h3>
    </div>
  )
}

export default VitalCard
