# The Jewish Network State (TJNS)

A decentralized identity and governance system for the Jewish Network State.

## Features

- Multi-level identity verification system
- Secure document storage with IPFS and XRPL
- Community-based verification process
- Governance participation tracking
- End-to-end encryption for sensitive data

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- IPFS node (or Infura account)
- XRPL account
- Supabase account

## Environment Variables

```bash
# App
NODE_ENV=development
PORT=3000
API_PREFIX=/api/v1

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h

# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# IPFS
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https

# XRPL
XRPL_NODE_URL=wss://s.altnet.rippletest.net:51233
XRPL_ISSUER_ADDRESS=your-issuer-address
XRPL_TOKEN_CODE=SHK
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/josejmizrahi/TJNS.git
cd TJNS
```

2. Install dependencies:
```bash
npm install
cd frontend && npm install
```

3. Start the development server:
```bash
# Backend
npm run dev

# Frontend (in a separate terminal)
cd frontend && npm run dev
```

## Verification Levels

The system implements four levels of verification:

1. **Baseline Trust (Level 1)**
   - Email verification
   - Phone verification (optional)
   - Basic profile
   - MFA setup

2. **Community Trust (Level 2)**
   - Synagogue/community affiliation
   - Rabbi reference
   - Hebrew name verification
   - Family history

3. **Financial Trust (Level 3)**
   - Government ID
   - KYC/AML compliance
   - Video verification
   - Enhanced MFA

4. **Governance Trust (Level 4)**
   - Advanced verification
   - Community references
   - Historical validation
   - Enhanced security

For detailed implementation, see [Verification Documentation](docs/implementation/VERIFICATION.md).

## API Documentation

For detailed API documentation, see [API Documentation](docs/api/README.md).

## Security

- End-to-end encryption for sensitive documents
- Zero-knowledge proofs for verification
- Multi-factor authentication
- Rate limiting and fraud detection
- Regular key rotation
- Audit logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
