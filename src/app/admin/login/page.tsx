'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert } from '@/components/ui/alert'
import { LawShopLogo } from '@/components/law-shop-logo'

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({
        hd: 'thelawshop.com' // Restrict to your law firm's domain
      })
      
      // Add required scopes for Google services
      provider.addScope('https://www.googleapis.com/auth/contacts.readonly')
      provider.addScope('https://www.googleapis.com/auth/calendar.readonly')
      
      const userCredential = await signInWithPopup(clientAuth, provider)
      const user = userCredential.user
      
      // Verify the user is from your law firm's domain
      if (!user.email?.endsWith('@thelawshop.com')) {
        setError('Access denied. Must use thelawshop.com email address.')
        await clientAuth.signOut()
        return
      }
      
      // Get ID token result to check custom claims
      const idTokenResult = await user.getIdTokenResult()
      
      // Verify attorney role from custom claims
      if (idTokenResult.claims.role !== 'attorney') {
        setError('Access denied. Attorney credentials required.')
        await clientAuth.signOut()
        return
      }
      
      // Attorney verified, redirect to dashboard
      router.push('/admin/dashboard')
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled')
      } else {
        setError(error.message || 'Login failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LawShopLogo width={120} height={120} />
          </div>
          <CardTitle className="text-2xl">Attorney Login</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Sign in with your thelawshop.com Google account
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                {error}
              </Alert>
            )}
            <Button 
              onClick={handleGoogleLogin}
              className="w-full" 
              disabled={loading}
              variant="outline"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}