# API Documentation

## Authentication

### Register User
```typescript
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": string,
  "password": string,
  "name": string,
  "hebrewName?: string
}

Response:
{
  "userId": string,
  "email": string,
  "verificationLevel": "none" | "basic" | "verified" | "complete"
}
```

### Login
```typescript
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": string,
  "password": string,
  "mfaCode?: string
}

Response:
{
  "token": string,
  "refreshToken": string,
  "user": {
    "id": string,
    "email": string,
    "verificationLevel": string
  }
}
```

## Verification

### Email Verification
```typescript
POST /api/v1/verification/email
Content-Type: application/json

{
  "email": string,
  "code": string
}

Response:
{
  "status": "success" | "error",
  "message": string
}
```

### Phone Verification
```typescript
POST /api/v1/verification/phone
Content-Type: application/json

{
  "phoneNumber": string,
  "code": string
}

Response:
{
  "status": "success" | "error",
  "message": string
}
```

### Document Upload
```typescript
POST /api/v1/verification/document
Content-Type: application/json

{
  "documentType": string,
  "encrypted": string,
  "key": string
}

Response:
{
  "status": "success" | "error",
  "documentId": string
}
```

### Schedule Video Call
```typescript
POST /api/v1/verification/video/schedule
Content-Type: application/json

{
  "slotId": string
}

Response:
{
  "status": "success" | "error",
  "sessionId": string,
  "scheduledTime": string
}
```

### Community Verification
```typescript
POST /api/v1/verification/community
Content-Type: application/json

{
  "synagogueName": string,
  "rabbiName": string,
  "rabbiEmail": string,
  "hebrewName": string,
  "communityRole?": string
}

Response:
{
  "status": "success" | "error",
  "verificationId": string
}
```

### Governance Verification
```typescript
POST /api/v1/verification/governance
Content-Type: application/json

{
  "references": Array<{
    "name": string,
    "email": string,
    "relationship": string
  }>,
  "participationHistory": string,
  "additionalNotes?": string
}

Response:
{
  "status": "success" | "error",
  "verificationId": string
}
```

## Document Management

### Upload Document
```typescript
POST /api/v1/documents/upload
Content-Type: multipart/form-data

Form Data:
- file: File
- type: string
- metadata: string (JSON)

Response:
{
  "documentId": string,
  "ipfsHash": string,
  "status": "success" | "error"
}
```

### Get Document
```typescript
GET /api/v1/documents/:id

Response:
{
  "documentId": string,
  "type": string,
  "ipfsHash": string,
  "metadata": object,
  "status": string
}
```

### Update Access
```typescript
PUT /api/v1/documents/:id/access
Content-Type: application/json

{
  "userId": string,
  "access": "read" | "write" | "none"
}

Response:
{
  "status": "success" | "error",
  "message": string
}
```

## Error Responses

All endpoints may return the following error responses:

```typescript
{
  "status": "error",
  "code": string,
  "message": string,
  "details?: object
}
```

Common error codes:
- `auth_required`: Authentication required
- `invalid_input`: Invalid input data
- `not_found`: Resource not found
- `permission_denied`: Insufficient permissions
- `rate_limit`: Rate limit exceeded
- `server_error`: Internal server error
