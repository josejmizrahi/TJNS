'use client';

import * as React from 'react';
import { useVerificationStatus, useDocumentUpload, useVideoVerification, usePhoneVerification } from '../../hooks/verification';
import { useJewishID } from '../../hooks/jewish-id';
import { VerificationStatus } from './VerificationStatus';
import { VerificationStepper } from './VerificationStepper';
import { DocumentUpload } from './DocumentUpload';
import { VideoVerification } from './VideoVerification';
import { CommunityVerification } from './CommunityVerification';
import { GovernanceVerification } from './GovernanceVerification';
import { Alert, AlertDescription } from '../ui/alert';

interface TimeSlot {
  id: string;
  date: Date;
  available: boolean;
}

export function VerificationPage() {
  // Fetch verification status and Jewish ID data
  const { data: verificationStatus, error: statusError } = useVerificationStatus();
  const { data: jewishId } = useJewishID();
  
  // Document upload mutations
  const documentUpload = useDocumentUpload();
  const videoVerification = useVideoVerification();
  const phoneVerification = usePhoneVerification();

  const handleDocumentUpload = async (file: File, type: string) => {
    try {
      await documentUpload.mutateAsync({
        type,
        file,
        metadata: {
          userId: jewishId?.userId,
          verificationLevel: verificationStatus?.level
        }
      });
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  };

  const handleVideoVerification = async (videoBlob: Blob) => {
    try {
      await videoVerification.mutateAsync(videoBlob);
    } catch (error) {
      console.error('Video verification failed:', error);
      throw error;
    }
  };

  const handlePhoneVerification = async (phoneNumber: string, code: string) => {
    try {
      await phoneVerification.mutateAsync({ phoneNumber, code });
    } catch (error) {
      console.error('Phone verification failed:', error);
      throw error;
    }
  };

  if (statusError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load verification status. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-8">
      <VerificationStepper currentLevel={verificationStatus?.level || 'none'} />
      <div className="grid gap-8 md:grid-cols-2">
        <VerificationStatus 
          level={verificationStatus?.level || 'none'}
          documents={verificationStatus?.documents || []}
        />

        {/* Basic Level Requirements */}
        {(!verificationStatus?.level || verificationStatus.level === 'none') && (
          <>
            <DocumentUpload
              documentType="government_id"
              description="Upload a government-issued ID for verification"
              onUpload={handleDocumentUpload}
              isLoading={documentUpload.isPending}
            />
            <DocumentUpload
              documentType="proof_of_residence"
              description="Upload proof of residence"
              onUpload={handleDocumentUpload}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Community Level Requirements */}
        {verificationStatus?.level === 'basic' && (
          <>
            <CommunityVerification
              onSubmit={async (data) => {
                await handleDocumentUpload(
                  data.referenceDocument,
                  'community_reference'
                );
              }}
              isLoading={documentUpload.isPending}
            />
            <DocumentUpload
              documentType="synagogue_membership"
              description="Upload synagogue membership verification"
              onUpload={handleDocumentUpload}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Financial Level Requirements */}
        {verificationStatus?.level === 'community' && (
          <>
            <VideoVerification
              onSubmit={handleVideoVerification}
              isLoading={videoVerification.isPending}
            />
            <DocumentUpload
              documentType="kyc_aml"
              description="Upload KYC/AML verification documents"
              onUpload={handleDocumentUpload}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Governance Level Requirements */}
        {verificationStatus?.level === 'financial' && (
          <>
            <GovernanceVerification
              onSubmit={async (data) => {
                await handleDocumentUpload(
                  data.multiPartyDocument,
                  'multi_party_verification'
                );
              }}
              isLoading={documentUpload.isPending}
            />
            <DocumentUpload
              documentType="historical_validation"
              description="Upload historical validation documents"
              onUpload={handleDocumentUpload}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {documentUpload.error && (
          <Alert variant="destructive">
            <AlertDescription>
              {documentUpload.error instanceof Error 
                ? documentUpload.error.message 
                : 'Document upload failed'}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
