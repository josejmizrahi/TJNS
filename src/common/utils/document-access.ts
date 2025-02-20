import { auditLogger, AuditEventType } from './audit';

interface DocumentAccess {
  userId: string;
  documentId: string;
  accessGrantedAt: Date;
  revokedAt?: Date;
  keyId: string;
}

export class DocumentAccessManager {
  private static instance: DocumentAccessManager;
  private accessRecords: Map<string, DocumentAccess>;

  private constructor() {
    this.accessRecords = new Map();
  }

  static getInstance(): DocumentAccessManager {
    if (!DocumentAccessManager.instance) {
      DocumentAccessManager.instance = new DocumentAccessManager();
    }
    return DocumentAccessManager.instance;
  }

  grantAccess(userId: string, documentId: string, keyId: string): void {
    const accessId = `${userId}-${documentId}`;
    this.accessRecords.set(accessId, {
      userId,
      documentId,
      accessGrantedAt: new Date(),
      keyId
    });

    auditLogger.logEvent({
      type: AuditEventType.DOCUMENT_ACCESS,
      userId,
      action: 'grant_access',
      status: 'success',
      metadata: { documentId }
    });
  }

  revokeAccess(userId: string, documentId: string): void {
    const accessId = `${userId}-${documentId}`;
    const access = this.accessRecords.get(accessId);
    
    if (access) {
      access.revokedAt = new Date();
      this.accessRecords.set(accessId, access);

      auditLogger.logEvent({
        type: AuditEventType.DOCUMENT_REVOCATION,
        userId,
        action: 'revoke_access',
        status: 'success',
        metadata: { documentId }
      });
    }
  }

  hasAccess(userId: string, documentId: string): boolean {
    const accessId = `${userId}-${documentId}`;
    const access = this.accessRecords.get(accessId);
    
    return access !== undefined && !access.revokedAt;
  }

  getAccessKeyId(userId: string, documentId: string): string | null {
    const accessId = `${userId}-${documentId}`;
    const access = this.accessRecords.get(accessId);
    
    return access && !access.revokedAt ? access.keyId : null;
  }
}

export const documentAccessManager = DocumentAccessManager.getInstance();
