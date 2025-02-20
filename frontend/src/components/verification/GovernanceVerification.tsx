'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';

interface Reference {
  name: string;
  email: string;
  relationship: string;
}

interface GovernanceVerificationProps {
  onSubmit: (data: {
    references: Reference[];
    participationHistory: string;
    additionalNotes?: string;
  }) => Promise<void>;
}

export function GovernanceVerification({ onSubmit }: GovernanceVerificationProps) {
  const [references, setReferences] = React.useState<Reference[]>([
    { name: '', email: '', relationship: '' }
  ]);
  const [participationHistory, setParticipationHistory] = React.useState('');
  const [additionalNotes, setAdditionalNotes] = React.useState('');

  const addReference = () => {
    setReferences(prev => [...prev, { name: '', email: '', relationship: '' }]);
  };

  const updateReference = (index: number, field: keyof Reference, value: string) => {
    setReferences(prev => prev.map((ref, i) => 
      i === index ? { ...ref, [field]: value } : ref
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit({
        references,
        participationHistory,
        additionalNotes
      });
    } catch (error) {
      console.error('Governance verification failed:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance Trust Verification</CardTitle>
        <CardDescription>Verify your eligibility for governance participation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Community References</h3>
            {references.map((ref, index) => (
              <div key={index} className="space-y-2 mb-4 p-4 border rounded">
                <input
                  type="text"
                  placeholder="Reference Name"
                  value={ref.name}
                  onChange={e => updateReference(index, 'name', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="Reference Email"
                  value={ref.email}
                  onChange={e => updateReference(index, 'email', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Relationship/Role"
                  value={ref.relationship}
                  onChange={e => updateReference(index, 'relationship', e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            ))}
            <Button type="button" onClick={addReference}>Add Another Reference</Button>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Community Participation History</label>
            <textarea
              value={participationHistory}
              onChange={e => setParticipationHistory(e.target.value)}
              className="w-full p-2 border rounded h-32"
              required
              placeholder="Describe your involvement and contributions to the community"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Additional Notes (Optional)</label>
            <textarea
              value={additionalNotes}
              onChange={e => setAdditionalNotes(e.target.value)}
              className="w-full p-2 border rounded h-24"
              placeholder="Any additional information to support your verification"
            />
          </div>
          
          <Button type="submit">Submit Governance Verification</Button>
        </form>
      </CardContent>
    </Card>
  );
}
