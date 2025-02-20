import * as React from 'react'
import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Upload, Check, AlertCircle } from "lucide-react"
import { ClientEncryption } from "@/utils/encryption"

interface DocumentUploadProps {
  documentType: string;
  description: string;
  onUpload: (encryptedData: { encrypted: string; key: string }) => Promise<void>;
}

export function DocumentUpload({ documentType, description, onUpload }: DocumentUploadProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setStatus('uploading');
      
      // Read file as text/base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const fileData = e.target?.result as string;
        
        // Encrypt file data
        const encryptedData = await ClientEncryption.encryptData(fileData);
        
        // Upload encrypted data
        await onUpload(encryptedData);
        
        setStatus('success');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{documentType}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          {status === 'idle' && (
            <label className="cursor-pointer">
              <div className="flex flex-col items-center gap-2 p-6 border-2 border-dashed rounded-lg hover:bg-gray-50">
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-500">Click to upload document</span>
              </div>
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </label>
          )}
          
          {status === 'uploading' && (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900" />
              <span>Encrypting and uploading...</span>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-500">
              <Check className="w-6 h-6" />
              <span>Upload complete</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-6 h-6" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {(status === 'success' || status === 'error') && (
          <Button 
            onClick={() => setStatus('idle')}
            variant="outline"
            className="w-full"
          >
            Upload Another Document
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
