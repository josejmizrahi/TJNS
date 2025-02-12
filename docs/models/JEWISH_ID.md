# JewishID Data Model

## Core Attributes
- id: UUID (primary key)
- userId: UUID (foreign key to User)
- hebrewName: string (optional)
- hebrewNameType: enum (birth, chosen, both)
- affiliation: enum (orthodox, conservative, reform, reconstructionist, secular, other)
- synagogue: string (optional)
- rabbi: string (optional)
- community: string (optional)

## Family History
- maternalLineage: string[] (optional)
- paternalLineage: string[] (optional)
- conversionDetails: {
  - date: string
  - location: string
  - authority: string
}

## Verification
- verifiedBy: string[] (list of verifier IDs)
- verificationLevel: enum (none, email, phone, kyc, advanced)
- verificationDocuments: {
  - documentType: string
  - documentHash: string
  - ipfsHash: string (encrypted)
  - verifiedAt: Date
  - verifiedBy: string (verifier ID)
}

## Security & Compliance
- mfaEnabled: boolean
- mfaVerified: boolean
- kycStatus: enum (none, pending, approved, rejected)
- kycDocuments: {
  - type: string
  - hash: string
  - ipfsHash: string (encrypted)
  - status: enum (pending, approved, rejected)
  - verifiedAt: Date
  - verifiedBy: string
}

## Metadata
- createdAt: Date
- updatedAt: Date
- metadata: Record<string, unknown>

## Storage Strategy
1. Core data stored in PostgreSQL
2. Sensitive documents stored in IPFS (encrypted)
3. Document hashes stored on XRPL for immutability
4. Encryption keys managed through secure key management

## Access Control
1. Basic profile: public
2. Sensitive data: requires MFA
3. KYC documents: restricted to authorized verifiers
4. Family history: owner + explicitly shared

## Verification Levels
1. Email verification (baseline)
2. Phone verification
3. Document verification (KYC)
4. Community verification (rabbi/leader)
5. Advanced verification (governance/financial)
