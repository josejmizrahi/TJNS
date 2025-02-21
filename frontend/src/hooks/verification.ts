'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { verificationApi } from '../lib/api/verification';
import { useRouter } from 'next/navigation';

export interface VerificationStatus {
  level: 'basic' | 'community' | 'financial' | 'governance';
  status: 'pending' | 'approved' | 'rejected';
  documents: Array<{
    type: string;
    status: 'pending' | 'approved' | 'rejected';
    verifiedAt?: string;
  }>;
}

export function useVerificationStatus() {
  return useQuery<VerificationStatus>({
    queryKey: ['verification-status'],
    queryFn: verificationApi.getVerificationStatus,
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useDocumentUpload() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: verificationApi.uploadDocument,
    onSuccess: () => {
      // Invalidate verification status query to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
    },
  });
}

export function useVideoVerification() {
  return useMutation({
    mutationFn: verificationApi.submitVideoVerification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
    },
  });
}

export function usePhoneVerification() {
  return useMutation({
    mutationFn: verificationApi.verifyPhoneNumber,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['verification-status'] });
    },
  });
}
