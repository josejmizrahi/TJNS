'use client';

import { AuthForm } from '../../components/auth/AuthForm';
import { useSearchParams } from 'next/navigation';

export default function AuthPage() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const handleSubmit = async (email: string, password: string) => {
    // Will be implemented in the next step with API integration
    console.log('Auth submission:', { email, password, mode });
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <AuthForm mode={mode} onSubmit={handleSubmit} />
    </main>
  );
}
