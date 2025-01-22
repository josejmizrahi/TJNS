# Identity Service

## Overview
The Identity Service implements JNS's digital identity verification system using XRPL trust lines. It provides functionality for:
- Identity verification using trust lines
- Document verification with IPFS integration
- Multi-level identity management (Basic, Verified, Certified)

## Architecture
```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  Identity API   │ ──> │  XRPL Client     │ ──> │ XRP Ledger     │
└─────────────────┘     └──────────────────┘     └────────────────┘
        │                        │                       │
        │                ┌──────────────────┐           │
        └───────────────│  IPFS Storage    │───────────┘
                        └──────────────────┘
```

## Features
1. Trust Line-based Identity
   - Authorized trust lines for verification
   - Identity token (JID) issuance
   - Trust line status tracking

2. Document Verification
   - IPFS storage for documents
   - Hash recording on XRPL
   - Verification metadata

3. Identity Levels
   - Basic: Email verified
   - Verified: Documents validated
   - Certified: Community verified

## Usage
```typescript
// Initialize service
const identityService = new IdentityService(xrplClient, issuerAccount);

// Create identity trust line
await identityService.createIdentityTrustLine(userAccount);

// Verify documents
await identityService.verifyDocument(userAccount, document);

// Authorize identity
await identityService.authorizeIdentityTrustLine(userAccount, IdentityLevel.VERIFIED);
```

## Security Considerations
- Trust line authorization requires issuer signature
- Document hashes stored on IPFS
- Revocation possible through trust line freeze
- Multi-factor verification process
