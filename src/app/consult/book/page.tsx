'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { getCalApi } from '@calcom/embed-react'

export default function BookConsultationPage() {
  const router = useRouter()
  const [isCalLoaded, setIsCalLoaded] = useState(false)

  useEffect(() => {
    // Get booking data from sessionStorage
    const bookingDataStr = sessionStorage.getItem('bookingData')
    const bookingData = bookingDataStr ? JSON.parse(bookingDataStr) : {}
    
    console.log('📋 SessionStorage data:', bookingData)
    
    // Don't clear booking data immediately - keep for debugging
    // sessionStorage.removeItem('bookingData')

    // Initialize Cal.com embed with prefill
    const initializeCal = async () => {
      const cal = await getCalApi()
      
      console.log('🎯 Initializing Cal.com with config:', {
        layout: "month_view",
        ...bookingData
      })
      
      // Try a more explicit approach for prefill
      const calConfig = {
        layout: "month_view"
      }
      
      // Add prefill data explicitly
      if (bookingData.name) calConfig.name = bookingData.name
      if (bookingData.email) calConfig.email = bookingData.email
      if (bookingData.phone) calConfig.attendeePhoneNumber = bookingData.phone
      if (bookingData['metadata[property]']) calConfig['metadata[property]'] = bookingData['metadata[property]']
      if (bookingData['metadata[price]']) calConfig['metadata[price]'] = bookingData['metadata[price]']
      
      console.log('📝 Final Cal.com config:', calConfig)
      
      cal("inline", {
        elementOrSelector: "#my-cal-inline-consult",
        config: calConfig,
        calLink: "joseph-leon-w2irf8/consult"
      })

      cal("ui", {
        hideEventTypeDetails: false,
        layout: "month_view"
      })

      setIsCalLoaded(true)
      console.log('✅ Cal.com initialized')
    }

    initializeCal()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Schedule Your Consultation
            </h1>
            <p className="text-lg text-gray-600">
              Choose a convenient time for your real estate legal consultation
            </p>
          </div>
        </div>

        {/* Booking Widget */}
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle>Select Date & Time</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {/* Cal.com Official Embed */}
            <div 
              id="my-cal-inline-consult"
              style={{ width: '100%', height: '600px', overflow: 'scroll' }}
            ></div>
            
            {/* Fallback link if embed doesn't work */}
            <div className="text-center p-4 text-gray-600">
              <p className="mb-2">Having trouble with the calendar?</p>
              <a 
                href="https://cal.com/joseph-leon-w2irf8/consult" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                Open booking calendar in new window
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Questions about scheduling? Call us at{' '}
            <span className="font-medium">(555) 123-LEGAL</span> or email{' '}
            <span className="font-medium">josephleon@thelawshop.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}