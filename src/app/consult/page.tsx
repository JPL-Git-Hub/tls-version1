'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SplashScreen } from '@/components/splash-screen'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'

const consultationFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  cellPhone: z.string()
    .min(1, 'Cell phone is required')
    .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
  propertyAddress: z.string().optional(),
})

type ClientInput = z.infer<typeof consultationFormSchema>

export default function ConsultationFormPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSplash, setShowSplash] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ClientInput>({
    resolver: zodResolver(consultationFormSchema)
  })

  const onSubmit = async (data: ClientInput) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/clients/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to submit consultation request')
      }

      // Success - store booking data and redirect to booking page
      const formattedPhone = data.cellPhone.startsWith('+') 
        ? data.cellPhone 
        : `+1${data.cellPhone.replace(/\D/g, '')}` // Add +1 for US numbers if not already prefixed
      
      sessionStorage.setItem('bookingData', JSON.stringify({
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: formattedPhone
      }))
      router.push('/consult/book')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }


  return (
    <div className="font-sans min-h-screen">
      <main className="flex flex-col max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Book Free Consult</h1>
        
        {/* Form */}
        <div className="max-w-md mx-auto space-y-6 md:space-y-8 w-full relative">
          {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} duration={800} />}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium leading-none">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className="h-10 w-full hover:border-gray-400 transition-colors"
                    placeholder="First Name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium leading-none">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className="h-10 w-full hover:border-gray-400 transition-colors"
                    placeholder="Last Name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium leading-none">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="h-10 w-full hover:border-gray-400 transition-colors"
                    placeholder="Email"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cellPhone" className="text-sm font-medium leading-none">Cell Phone *</Label>
                  <Input
                    id="cellPhone"
                    type="tel"
                    {...register('cellPhone')}
                    className="h-10 w-full hover:border-gray-400 transition-colors"
                    placeholder="Cell Phone"
                  />
                  {errors.cellPhone && (
                    <p className="text-sm text-destructive mt-1">{errors.cellPhone.message}</p>
                  )}
                </div>
              </div>


              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-full border border-solid border-gray-300 transition-colors flex items-center justify-center bg-gray-100 text-black gap-2 hover:bg-gray-200 hover:border-gray-400 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Book Free Consult'
                )}
              </button>

            </form>
        </div>
      </main>
    </div>
  )
}