import { peopleClient } from '@/lib/google/auth'
import { ClientInput } from '@/types/inputs'

/**
 * Creates a contact in Google Contacts via People API
 * Uses service account authentication from google/auth.ts
 */
export async function createContact(
  clientData: ClientInput,
  clientId: string
): Promise<string | null> {
  try {
    const response = await peopleClient.people.createContact({
      requestBody: {
        names: [{
          givenName: clientData.firstName,
          familyName: clientData.lastName,
          displayName: `${clientData.firstName} ${clientData.lastName}`
        }],
        emailAddresses: [{
          value: clientData.email,
          type: 'work'
        }],
        phoneNumbers: [{
          value: clientData.cellPhone,
          type: 'mobile'
        }],
        addresses: clientData.propertyAddress ? [{
          formattedValue: clientData.propertyAddress,
          type: 'work'
        }] : undefined,
        biographies: [{
          value: `TLS Client ID: ${clientId}`,
          contentType: 'TEXT_PLAIN'
        }]
      }
    })
    
    return response.data.resourceName || null
  } catch (error) {
    console.error('Google Contacts API error:', error)
    return null
  }
}