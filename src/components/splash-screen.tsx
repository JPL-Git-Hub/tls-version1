'use client'

import { useEffect, useState } from 'react'
import { Home } from 'lucide-react'

interface SplashScreenProps {
  onFinish: () => void
  duration?: number
}

export function SplashScreen({ onFinish, duration = 2000 }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), duration)
    const finishTimer = setTimeout(onFinish, duration + 300)
    
    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(finishTimer)
    }
  }, [onFinish, duration])

  return (
    <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-8 z-50 transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      <div className="text-center">
        <Home className="w-12 h-12 mx-auto mb-3 text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">Let's Close</h1>
      </div>
    </div>
  )
}