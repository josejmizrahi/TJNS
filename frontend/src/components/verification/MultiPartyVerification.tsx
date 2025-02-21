'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { UserPlus, Check, AlertCircle } from 'lucide-react';

interface Reference {
  name: string;
  email: string;
  relationship: string;
  yearsKnown: number;
}

interface MultiPartyVerificationProps {
  onSubmit: (data: {
    references: Reference[];
    additionalNotes?: string;
  }) => Promise<void>;
}

export function MultiPartyVerification({ onSubmit }: MultiPartyVerificationProps) {
  const [references, setReferences] = React.useState<Reference[]>([
    { name: '', email: '', relationship: '', yearsKnown: 0 }
  ]);
  const [status, setStatus] = React.useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [additionalNotes, setAdditionalNotes] = React.useState('');

  const addReference = () => {
    setReferences([...references, { name: '', email: '', relationship: '', yearsKnown: 0 }]);
  };

  const updateReference = (index: number, field: keyof Reference, value: string | number) => {
    const newReferences = [...references];
    newReferences[index] = { ...newReferences[index], [field]: value };
    setReferences(newReferences);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (references.some(ref => !ref.name || !ref.email || !ref.relationship)) {
      setErrorMessage('Please fill in all required fields');
      return;
    }

    try {
      setStatus('submitting');
      await onSubmit({ references, additionalNotes });
      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Submission failed');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="text-blue-500" />
          <CardTitle>Multi-Party Verification</CardTitle>
        </div>
        <CardDescription>Provide references from your Jewish community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {references.map((reference, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={reference.name}
                  onChange={e => updateReference(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={reference.email}
                  onChange={e => updateReference(index, 'email', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Relationship</label>
                <input
                  type="text"
                  value={reference.relationship}
                  onChange={e => updateReference(index, 'relationship', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Years Known</label>
                <input
                  type="number"
                  value={reference.yearsKnown}
                  onChange={e => updateReference(index, 'yearsKnown', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border rounded"
                  min="0"
                  required
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addReference}
            className="w-full"
          >
            Add Another Reference
          </Button>

          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes</label>
            <textarea
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              className="w-full p-2 border rounded h-24"
              placeholder="Any additional information to support your verification"
            />
          </div>

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-500">
              <Check className="w-4 h-4" />
              <span>Verification submitted successfully</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full"
          >
            {status === 'submitting' ? 'Submitting...' : 'Submit Verification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
