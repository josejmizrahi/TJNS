'use client';

import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from './alert';

interface ErrorAlertProps {
  message: string;
}

export function ErrorAlert({ message }: ErrorAlertProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
