import { AlertTriangle, CheckCircle } from 'lucide-react'

interface LimitGaugeProps {
  current: number
  max: number
  label: string
  type: 'questions' | 'students' | 'classes' | 'storage'
  className?: string
}

export function LimitGauge({ current, max, label, type, className = '' }: LimitGaugeProps) {
  const percentage = max === -1 ? 0 : Math.min((current / max) * 100, 100)
  const isNearLimit = percentage >= 80
  const isAtLimit = percentage >= 100

  const getColor = () => {
    if (isAtLimit) return 'bg-red-500'
    if (isNearLimit) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getIcon = () => {
    if (isAtLimit) return <AlertTriangle className="h-4 w-4 text-red-600" />
    if (isNearLimit) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <CheckCircle className="h-4 w-4 text-green-600" />
  }

  const getTextColor = () => {
    if (isAtLimit) return 'text-red-600'
    if (isNearLimit) return 'text-yellow-600'
    return 'text-green-600'
  }

  const formatValue = (value: number, type: string) => {
    if (type === 'storage') {
      return value < 1 ? `${Math.round(value * 1024)}MB` : `${value}GB`
    }
    return value.toString()
  }

  return (
    <div className={`bg-white rounded-lg p-4 border ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="font-medium text-gray-700">{label}</span>
        </div>
        <span className={`text-sm font-medium ${getTextColor()}`}>
          {max === -1 ? 'Illimité' : `${formatValue(current, type)} / ${formatValue(max, type)}`}
        </span>
      </div>
      
      {max !== -1 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getColor()}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      
      {isNearLimit && max !== -1 && (
        <p className={`text-xs mt-2 ${getTextColor()}`}>
          {isAtLimit 
            ? 'Limite atteinte !' 
            : `Attention : ${Math.round(100 - percentage)}% restant`
          }
        </p>
      )}
    </div>
  )
}






