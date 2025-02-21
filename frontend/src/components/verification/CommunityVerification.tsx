'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { LoadingSpinner } from '../ui/loading-spinner';
import { ErrorAlert } from '../ui/error-alert';
import { Users } from 'lucide-react';

interface CommunityVerificationProps {
  onSubmit: (data: {
    synagogueName: string;
    rabbiName: string;
    rabbiEmail: string;
    hebrewName: string;
    communityRole?: string;
  }) => Promise<void>;
}

export function CommunityVerification({ onSubmit }: CommunityVerificationProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string>();
  const [formData, setFormData] = React.useState({
    synagogueName: '',
    rabbiName: '',
    rabbiEmail: '',
    hebrewName: '',
    communityRole: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(undefined);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Community verification failed:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit community verification');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="text-blue-500" />
          <CardTitle>Community Verification</CardTitle>
        </div>
        <CardDescription>Verify your community membership and Jewish identity</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Synagogue/Community Name</label>
            <input
              type="text"
              value={formData.synagogueName}
              onChange={e => setFormData(prev => ({ ...prev, synagogueName: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rabbi Name</label>
            <input
              type="text"
              value={formData.rabbiName}
              onChange={e => setFormData(prev => ({ ...prev, rabbiName: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rabbi Email</label>
            <input
              type="email"
              value={formData.rabbiEmail}
              onChange={e => setFormData(prev => ({ ...prev, rabbiEmail: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hebrew Name</label>
            <input
              type="text"
              value={formData.hebrewName}
              onChange={e => setFormData(prev => ({ ...prev, hebrewName: e.target.value }))}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Community Role (Optional)</label>
            <input
              type="text"
              value={formData.communityRole}
              onChange={e => setFormData(prev => ({ ...prev, communityRole: e.target.value }))}
              className="w-full p-2 border rounded"
            />
          </div>
          {error && <ErrorAlert message={error} />}
          
          {isSubmitting ? (
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner />
              <span className="text-sm text-muted-foreground">Submitting verification...</span>
            </div>
          ) : (
            <Button type="submit" disabled={isSubmitting}>Submit Verification</Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
