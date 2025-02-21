'use client';

import { AuthForm } from '../../components/auth/AuthForm';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const handleSubmit = async (email: string, password: string) => {
    try {
      if (mode === 'signin') {
        await api.signIn(email, password);
      } else {
        await api.signUp(email, password);
      }
      // Redirect to verification page after successful auth
      window.location.href = '/';
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AuthForm mode={mode} onSubmit={handleSubmit} />
    </main>
  );
}
