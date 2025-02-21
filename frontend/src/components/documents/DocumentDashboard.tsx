'use client';

import * as React from 'react';
import { DocumentUpload } from '../verification/DocumentUpload';
import { DocumentList } from './DocumentList';
import { api } from '../../lib/api';

export function DocumentDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <DocumentUpload
        documentType="Identity Document"
        description="Upload government ID"
        onUpload={async (data) => {
          try {
            const response = await api.verifyDocument(data);
            if (response.status === 'error') {
              throw new Error(response.message);
            }
          } catch (error) {
            throw new Error(error instanceof Error ? error.message : 'Document upload failed');
          }
        }}
      />
      <DocumentList />
    </div>
  );
}
