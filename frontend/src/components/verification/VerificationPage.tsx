'use client';

import * as React from 'react';
import { VerificationStatus } from './VerificationStatus';
import { VerificationStepper } from './VerificationStepper';
import { DocumentUpload } from './DocumentUpload';
import { VideoVerification } from './VideoVerification';
import { CommunityVerification } from './CommunityVerification';
import { GovernanceVerification } from './GovernanceVerification';
import { api } from '../../lib/api';
// Removed unused import

import { VerificationLevel } from './VerificationStepper';
type TimeSlot = { id: string; date: Date; available: boolean };

export function VerificationPage() {
  const [availableSlots, setAvailableSlots] = React.useState<TimeSlot[]>([]);
  const [verificationLevel, setVerificationLevel] = React.useState<VerificationLevel>('none');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [slotsResponse, statusResponse] = await Promise.all([
          api.getAvailableSlots(),
          api.getVerificationStatus()
        ]);

        if (slotsResponse.status === 'success') {
          const slots = slotsResponse.data?.slots ?? [];
          setAvailableSlots(slots.map(slot => ({
            ...slot,
            date: new Date(slot.date)
          })));
        }
        if (statusResponse.status === 'success' && statusResponse.data?.level) {
          setVerificationLevel(statusResponse.data.level);
        }
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <VerificationStepper currentLevel={verificationLevel} />
      <div className="grid gap-8 md:grid-cols-2">
      <VerificationStatus 
        level={verificationLevel}
        onStartVerification={async () => {
          try {
            const status = await api.getVerificationStatus();
            if (status.status === 'success') {
              if (status.data?.level) {
                setVerificationLevel(status.data.level);
              }
            }
          } catch (error) {
            console.error('Failed to update verification status:', error);
          }
        }}
      />

      <DocumentUpload
        documentType="Identity Document"
        description="Upload a government-issued ID for verification"
        onUpload={async (data) => {
          try {
            const response = await api.verifyDocument(data);
            if (response.status === 'error') {
              throw new Error(response.message);
            }
            // Return void as expected by the component interface
            return;
          } catch (error) {
            console.error('Document verification failed:', error);
            throw error;
          }
        }}
      />

      <VideoVerification
        availableSlots={availableSlots}
        onSchedule={async (slotId) => {
          try {
            const response = await api.scheduleVideoCall(slotId);
            if (response.status === 'error') {
              throw new Error(response.message);
            }
            return;
          } catch (error) {
            console.error('Video call scheduling failed:', error);
            throw error;
          }
        }}
      />

      {verificationLevel === 'basic' && (
        <CommunityVerification
          onSubmit={async (data) => {
            try {
              const response = await api.submitCommunityVerification(data);
              if (response.status === 'error') {
                throw new Error(response.message);
              }
              setVerificationLevel('verified');
            } catch (error) {
              console.error('Community verification failed:', error);
              throw error;
            }
          }}
        />
      )}

      {verificationLevel === 'verified' && (
        <GovernanceVerification
          onSubmit={async (data) => {
            try {
              const response = await api.submitGovernanceVerification(data);
              if (response.status === 'error') {
                throw new Error(response.message);
              }
              setVerificationLevel('complete');
            } catch (error) {
              console.error('Governance verification failed:', error);
              throw error;
            }
          }}
        />
      )}
      </div>
    </div>
  );
}
