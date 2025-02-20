const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jewishnetworkstate.org';

export interface VerificationResponse {
  status: 'success' | 'error';
  message: string;
  data?: any;
}

export const api = {
  async verifyDocument(documentData: { encrypted: string; key: string }): Promise<VerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/verification/document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
