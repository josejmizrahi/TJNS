// Ensure HTTPS is enforced
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.jewishnetworkstate.org';
if (!API_BASE_URL.startsWith('https://')) {
  throw new Error('API must be served over HTTPS');
}

interface AuthResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    token?: string;
    user?: {
      id: string;
      email: string;
      verificationLevel: string;
    };
  };
}

interface VerificationData {
  slots?: Array<{ id: string; date: string; available: boolean }>;
  level?: 'none' | 'basic' | 'community' | 'financial' | 'governance';
}

export interface VerificationResponse {
  status: 'success' | 'error';
  message: string;
  data?: VerificationData;
}

interface CommunityVerificationData {
  synagogueName: string;
  rabbiName: string;
  rabbiEmail: string;
  hebrewName: string;
  communityRole?: string;
}

interface Reference {
  name: string;
  email: string;
  relationship: string;
}

interface MultiPartyVerificationData {
  references: Reference[];
  additionalNotes?: string;
}

interface GovernanceVerificationData {
  references: Reference[];
  participationHistory: string;
  additionalNotes?: string;
}

export const api = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    return response.json();
  },

  async signUp(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    return response.json();
  },

  async signOut(): Promise<void> {
    await fetch(`${API_BASE_URL}/api/v1/auth/signout`, {
      method: 'POST',
      credentials: 'include',
    });
  },
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
  },

  async submitCommunityVerification(data: CommunityVerificationData): Promise<VerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/verification/community`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return response.json();
  },

  async submitMultiPartyVerification(data: MultiPartyVerificationData): Promise<VerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/verification/multi-party`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return response.json();
  },

  async submitGovernanceVerification(data: GovernanceVerificationData): Promise<VerificationResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/verification/governance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    });
    
    return response.json();
  }
};
