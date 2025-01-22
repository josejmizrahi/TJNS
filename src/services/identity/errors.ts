export class IdentityServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'IdentityServiceError';
  }
}

export class TrustLineError extends IdentityServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'TrustLineError';
  }
}

export class DocumentVerificationError extends IdentityServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'DocumentVerificationError';
  }
}

export class ValidationError extends IdentityServiceError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
