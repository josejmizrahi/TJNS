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
import { VerificationLevel } from './types';
import { encryptFile } from '../../utils/client-encryption';
import {
  DocumentUploadData,
  VerificationStatusProps,
  DocumentUploadProps,
  VideoVerificationProps,
  CommunityVerificationProps,
  GovernanceVerificationProps,
  CommunityData,
  GovernanceData,
  EncryptedData
} from './verification.types';



export function VerificationPage() {
  // Fetch verification status and Jewish ID data
  const { data: verificationStatus, error: statusError } = useVerificationStatus();
  const { data: jewishId } = useJewishID();
  
  // Document upload mutations
  const documentUpload = useDocumentUpload();
  const videoVerification = useVideoVerification();
  const phoneVerification = usePhoneVerification();

  const handleDocumentUpload = async (encryptedData: EncryptedData, type: string = 'document') => {
    try {
      const uploadData: DocumentUploadData = {
        type,
        encryptedData,
        metadata: {
          userId: jewishId?.id || '',
          verificationLevel: verificationStatus?.level || VerificationLevel.NONE
        }
      };
      await documentUpload.mutateAsync(uploadData);
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  };

  const handleVideoVerification = async (encryptedData: EncryptedData) => {
    try {
      await videoVerification.mutateAsync({
        encryptedData,
        type: 'video',
        metadata: {
          userId: jewishId?.id || '',
          verificationLevel: verificationStatus?.level || VerificationLevel.NONE
        }
      });
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
              onUpload={(encryptedData) => handleDocumentUpload(encryptedData)}
              isLoading={documentUpload.isPending}
            />
            <DocumentUpload
              documentType="proof_of_residence"
              description="Upload proof of residence"
              onUpload={(encryptedData) => handleDocumentUpload(encryptedData)}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Community Level Requirements */}
        {currentLevel === VerificationLevel.BASIC && (
          <>
            <CommunityVerification
              onSubmit={async (data: CommunityData) => {
                for (const doc of data.documents) {
                  const encryptedDoc = await encryptFile(doc);
                  await handleDocumentUpload(encryptedDoc);
                }
              }}
              isLoading={documentUpload.isPending}
            />
            <DocumentUpload
              documentType="synagogue_membership"
              description="Upload synagogue membership verification"
              onUpload={(encryptedData) => handleDocumentUpload(encryptedData)}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Financial Level Requirements */}
        {currentLevel === VerificationLevel.COMMUNITY && (
          <>
            <VideoVerification
              onSubmit={async (encryptedData: EncryptedData) => {
                await handleVideoVerification(encryptedData);
              }}
              isLoading={videoVerification.isPending}
            />
            <DocumentUpload
              documentType="kyc_aml"
              description="Upload KYC/AML verification documents"
              onUpload={(encryptedData) => handleDocumentUpload(encryptedData)}
              isLoading={documentUpload.isPending}
            />
          </>
        )}

        {/* Governance Level Requirements */}
        {currentLevel === VerificationLevel.FINANCIAL && (
          <>
            <GovernanceVerification
              onSubmit={async (data: GovernanceData) => {
                const encryptedMultiParty = await encryptFile(data.multiPartyDocument);
                const encryptedHistorical = await encryptFile(data.historicalDocument);
                await handleDocumentUpload(encryptedMultiParty);
                await handleDocumentUpload(encryptedHistorical);
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
