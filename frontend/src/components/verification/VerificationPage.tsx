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
import { 
  VerificationLevel,
  VerificationStatusProps,
  DocumentUploadProps,
  VideoVerificationProps,
  CommunityVerificationProps,
  GovernanceVerificationProps,
  VerificationDocument
} from './types';

export function VerificationPage() {
  // Fetch verification status and Jewish ID data
  const { data: verificationStatus, error: statusError } = useVerificationStatus();
  const { data: jewishId } = useJewishID();
  
  // Document upload mutations
  const documentUpload = useDocumentUpload();
  const videoVerification = useVideoVerification();
  const phoneVerification = usePhoneVerification();

  const handleDocumentUpload = async (data: { type: string; file: { encrypted: string; key: string } }) => {
    try {
      await documentUpload.mutateAsync({
        type: data.type,
        encryptedData: data.file,
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

  const handleVideoVerification = async (recording: Blob) => {
    try {
      await videoVerification.mutateAsync(recording);
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

  const currentLevel = verificationStatus?.level || VerificationLevel.NONE;

  return (
    <div className="space-y-8">
      <VerificationStepper currentLevel={currentLevel} />
      <div className="grid gap-8 md:grid-cols-2">
        <VerificationStatus 
          level={currentLevel}
          documents={verificationStatus?.documents || []}
          onStartVerification={() => {}}
        />

        {/* Basic Level Requirements */}
        {(currentLevel === VerificationLevel.NONE) && (
          <>
            <DocumentUpload
              documentType="government_id"
              description="Upload a government-issued ID for verification"
              onUpload={(file) => handleDocumentUpload({ type: 'government_id', file })}
              isLoading={documentUpload.isPending}
            />
            <DocumentUpload
              documentType="proof_of_residence"
              description="Upload proof of residence"
              onUpload={(file) => handleDocumentUpload({ type: 'proof_of_residence', file })}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Community Level Requirements */}
        {currentLevel === VerificationLevel.BASIC && (
          <>
            <CommunityVerification
              onSubmit={async (data: CommunityVerificationData) => {
                for (const doc of data.documents) {
                  await handleDocumentUpload({
                    type: 'community_reference',
                    file: doc,
                    metadata: { communityData: data }
                  });
                }
              }}
              isLoading={documentUpload.isPending}
            />
            <DocumentUpload
              documentType="synagogue_membership"
              description="Upload synagogue membership verification"
              onUpload={(file) => handleDocumentUpload({ type: 'synagogue_membership', file })}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Financial Level Requirements */}
        {currentLevel === VerificationLevel.COMMUNITY && (
          <>
            <VideoVerification
              onSubmit={(recording: Blob) => handleVideoVerification({ recording })}
              isLoading={videoVerification.isPending}
            />
            <DocumentUpload
              documentType="kyc_aml"
              description="Upload KYC/AML verification documents"
              onUpload={(file) => handleDocumentUpload({ type: 'kyc_aml', file })}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Governance Level Requirements */}
        {currentLevel === VerificationLevel.FINANCIAL && (
          <>
            <GovernanceVerification
              onSubmit={async (data: GovernanceVerificationData) => {
                await handleDocumentUpload({
                  type: 'multi_party_verification',
                  file: data.multiPartyDocument
                });
                await handleDocumentUpload({
                  type: 'historical_validation',
                  file: data.historicalDocument
                });
              }}
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
