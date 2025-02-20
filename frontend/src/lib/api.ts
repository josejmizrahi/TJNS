// Ensure HTTPS is enforced
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jewishnetworkstate.org';
if (!API_BASE_URL.startsWith('https://')) {
  throw new Error('API must be served over HTTPS');
}

interface VerificationData {
  slots?: Array<{ id: string; date: string; available: boolean }>;
  level?: 'none' | 'basic' | 'verified' | 'complete';
}

export interface VerificationResponse {
  status: 'success' | 'error';
  message: string;
  data?: VerificationData;
}

export const api = {
  async verifyDocument(documentData: { encrypted: string; key: string }): Promise<VerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/verification/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
      body: JSON.stringify(documentData),
      credentials: 'include',
    });
    
    return response.json();
  },

  async scheduleVideoCall(slotId: string): Promise<VerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/verification/video/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
      body: JSON.stringify({ slotId }),
      credentials: 'include',
    });
    
    return response.json();
  },

  async getVerificationStatus(): Promise<VerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/verification/status`, {
      credentials: 'include',
    });
    
    return response.json();
  },

  async getAvailableSlots(): Promise<VerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/verification/video/slots`, {
      credentials: 'include',
    });
    
    return response.json();
  }
};
