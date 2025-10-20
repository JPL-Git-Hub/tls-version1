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

      // Success - redirect to booking page
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
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
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
          
          <div className="text-center mb-6">
            <LawShopLogo width={80} height={80} className="mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Schedule Your Free Consultation
            </h1>
            <p className="text-lg text-gray-600 max-w-md mx-auto">
              Tell us about your real estate transaction and we'll schedule a consultation to discuss how we can help.
            </p>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
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
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className={errors.firstName ? 'border-red-500' : ''}
                    placeholder="Enter your first name"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className={errors.lastName ? 'border-red-500' : ''}
                    placeholder="Enter your last name"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    className={errors.email ? 'border-red-500' : ''}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="mobilePhone">Mobile Phone *</Label>
                  <Input
                    id="mobilePhone"
                    type="tel"
                    {...register('mobilePhone')}
                    className={errors.mobilePhone ? 'border-red-500' : ''}
                    placeholder="Enter your mobile phone number"
                  />
                  {errors.mobilePhone && (
                    <p className="text-sm text-red-500">{errors.mobilePhone.message}</p>
                  )}
                </div>
              </div>

              {/* Property Details Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Property Details (Optional)
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  If you have specific property information, please share it below. This helps us prepare for your consultation.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="propertyAddress">Property Address</Label>
                    <Input
                      id="propertyAddress"
                      {...register('propertyAddress')}
                      className={errors.propertyAddress ? 'border-red-500' : ''}
                      placeholder="Enter the property address"
                    />
                    {errors.propertyAddress && (
                      <p className="text-sm text-red-500">{errors.propertyAddress.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="purchasePrice">Purchase Price</Label>
                    <Input
                      id="purchasePrice"
                      type="number"
                      min="0"
                      step="1000"
                      onChange={handlePurchasePriceChange}
                      className={errors.purchasePrice ? 'border-red-500' : ''}
                      placeholder="Enter the purchase price"
                    />
                    {errors.purchasePrice && (
                      <p className="text-sm text-red-500">{errors.purchasePrice.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 text-base"
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
                </Button>
              </div>

              {/* Help Text */}
              <div className="text-center text-sm text-gray-600">
                <p>
                  After submitting this form, you'll be redirected to our calendar to choose your preferred consultation time.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Questions about the process? Call us at{' '}
            <span className="font-medium">(555) 123-LEGAL</span> or email{' '}
            <span className="font-medium">josephleon@thelawshop.com</span>
          </p>
        </div>
      </div>
    </div>
  )
}