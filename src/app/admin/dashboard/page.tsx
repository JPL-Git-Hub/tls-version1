'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { clientAuth } from '@/lib/firebase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { LawShopLogo } from '@/components/law-shop-logo'
import type { User } from 'firebase/auth'
import type { ClientData } from '@/types/database'

export default function AdminDashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(true)
  const [clients, setClients] = useState<ClientData[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<'all' | 'lead' | 'active'>('all')
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(clientAuth, async (user) => {
      setLoading(false)
      
      if (!user) {
        router.push('/admin/login')
        return
      }

      try {
        // Verify attorney role from custom claims
        const idTokenResult = await user.getIdTokenResult()
        
        if (idTokenResult.claims.role !== 'attorney') {
          await signOut(clientAuth)
          router.push('/admin/login')
          return
        }

        setUser(user)
        
        // Fetch clients after authentication
        fetchClients(user)
      } catch (error) {
        console.error('Error verifying attorney role:', error)
        await signOut(clientAuth)
        router.push('/admin/login')
      } finally {
        setVerifying(false)
      }
    })

    return () => unsubscribe()
  }, [router])

  const fetchClients = async (user: User) => {
    try {
      const idToken = await user.getIdToken()
      const response = await fetch('/api/clients', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      } else {
        console.error('Failed to fetch clients:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setClientsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut(clientAuth)
      router.push('/admin/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleInitiatePayment = async (clientId: string) => {
    console.log('Initiating payment for client:', clientId)
    // TODO: Implement payment flow
  }

  // Filter clients based on status
  const filteredClients = clients.filter(client => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'lead') return client.status === 'lead'
    if (statusFilter === 'active') return client.status === 'active' || client.status === 'paid'
    return true
  })

  // Calculate counts
  const leadCount = clients.filter(c => c.status === 'lead').length
  const activeCount = clients.filter(c => c.status === 'active' || c.status === 'paid').length

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A'
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString()
  }

  if (loading || verifying) {
    return (
      <div className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <LawShopLogo width={60} height={60} />
              <Skeleton className="h-8 w-48" />
            </div>
            <Skeleton className="h-10 w-24" />
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <LawShopLogo width={60} height={60} />
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600">Welcome, {user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>

        {/* Client Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Leads</p>
                  <p className="text-2xl font-bold">{leadCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold">{activeCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Clients</p>
                  <p className="text-2xl font-bold">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Client Management Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Client Management
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('all')}
                >
                  All ({clients.length})
                </Button>
                <Button
                  variant={statusFilter === 'lead' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('lead')}
                >
                  Leads ({leadCount})
                </Button>
                <Button
                  variant={statusFilter === 'active' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter('active')}
                >
                  Active ({activeCount})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No clients found for the selected filter.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.clientId}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {client.firstName} {client.lastName}
                          </div>
                          {client.propertyAddress && (
                            <div className="text-sm text-gray-500">
                              {client.propertyAddress}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.cellPhone}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            client.status === 'lead' ? 'secondary' :
                            client.status === 'active' || client.status === 'paid' ? 'default' :
                            'outline'
                          }
                        >
                          {client.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(client.createdAt)}</TableCell>
                      <TableCell>
                        {client.status === 'lead' && (
                          <Button
                            size="sm"
                            onClick={() => handleInitiatePayment(client.clientId)}
                          >
                            Initiate Payment
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}