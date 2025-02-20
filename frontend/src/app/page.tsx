import { VerificationPage } from '../components/verification/VerificationPage';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold">Jewish Network State Identity System</h1>
        <VerificationPage />
      </div>
    </main>
  );
}
