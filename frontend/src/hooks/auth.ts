'use client';

import { useMutation } from '@tanstack/react-query';
import { authApi } from '../lib/api/auth';
import { useRouter } from 'next/navigation';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface ResetPasswordData {
  token: string;
  newPassword: string;
}

// Secure token storage using HTTP-only cookies will be handled by the backend
export function useLogin() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: () => {
      router.push('/verification');
    },
    onError: (error) => {
      console.error('Login failed:', error);
    },
  });
}

export function useRegister() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      router.push('/auth/verify-email');
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });
}

export function useVerifyEmail() {
  const router = useRouter();
  
  return useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      // Email verification successful, user can proceed to MFA setup
      router.push('/auth/setup-mfa');
    },
  });
}

export function useRequestPasswordReset() {
  return useMutation({
    mutationFn: authApi.requestPasswordReset,
  });
}

export function useResetPassword() {
  const router = useRouter();
  
  return useMutation<void, Error, ResetPasswordData>({
    mutationFn: ({ token, newPassword }) => authApi.resetPassword(token, newPassword),
    onSuccess: () => {
      router.push('/auth');
    },
  });
}
