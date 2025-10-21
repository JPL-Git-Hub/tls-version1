'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LawShopLogo } from '@/components/law-shop-logo'
import { ClientInputSchema, type ClientInput } from '@/types/inputs'
import { ArrowLeft, Loader2 } from 'lucide-react'

export default function ConsultationFormPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<ClientInput>({
    resolver: zodResolver(ClientInputSchema)
  })

  const purchasePriceValue = watch('purchasePrice')

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
        phone: formattedPhone,
        ...(data.propertyAddress && { "metadata[property]": data.propertyAddress }),
        ...(data.purchasePrice && { "metadata[price]": `$${data.purchasePrice.toLocaleString()}` })
      }))
      router.push('/consult/book')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      setValue('purchasePrice', undefined)
    } else {
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue > 0) {
        setValue('purchasePrice', numValue)
      }
    }
  }

  return (
    <div className="font-sans min-h-screen">
      <main className="flex flex-col max-w-2xl mx-auto">
        <div className="w-full flex justify-center">
          <LawShopLogo
            width={120}
            height={120}
          />
        </div>
        <div className="w-full flex justify-center">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
          </Button>
        </div>

        {/* Form */}
        <div className="max-w-md mx-auto space-y-6 md:space-y-8 w-full">
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
                  <Label htmlFor="firstName" className="text-sm font-medium leading-none">First *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className="h-10 w-full"
                    placeholder="Name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium leading-none">Last *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className="h-10 w-full"
                    placeholder="Name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium leading-none">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="h-10 w-full"
                    placeholder="Enter your email address"
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
                    className="h-10 w-full"
                    placeholder="Enter your cell phone number (e.g., +1234567890)"
                  />
                  {errors.cellPhone && (
                    <p className="text-sm text-destructive mt-1">{errors.cellPhone.message}</p>
                  )}
                </div>
              </div>


              {/* Submit Button */}
              <button
                type="submit"
                className="w-full rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 mt-6"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Continue to Schedule Consultation'
                )}
              </button>

            </form>
        </div>
      </main>
    </div>
  )
}