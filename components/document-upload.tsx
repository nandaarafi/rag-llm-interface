'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, Loader2, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { vectorClient } from '@/lib/vector-client';
import { toast } from 'sonner';

interface DocumentUploadProps {
  userId: string;
  onUploadComplete?: (documentId: string, filename: string) => void;
}

interface UploadFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
  progress: number;
  error?: string;
  documentId?: string;
}

export function DocumentUpload({ userId, onUploadComplete }: DocumentUploadProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'pending',
      progress: 0,
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true,
  });

  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFile = async (uploadFile: UploadFile) => {
    try {
      // Update status to uploading
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { ...f, status: 'uploading', progress: 25 }
          : f
      ));

      // Simulate upload progress
      setTimeout(() => {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, progress: 50 }
            : f
        ));
      }, 500);

      // Update to processing
      setTimeout(() => {
        setUploadFiles(prev => prev.map(f => 
          f.id === uploadFile.id 
            ? { ...f, status: 'processing', progress: 75 }
            : f
        ));
      }, 1000);

      // Upload to vector service
      const response = await vectorClient.uploadDocument(uploadFile.file, userId);

      // Complete
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'complete', 
              progress: 100,
              documentId: response.document_id 
            }
          : f
      ));

      onUploadComplete?.(response.document_id, response.filename);
      toast.success(`${uploadFile.file.name} uploaded and processed successfully`);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error', 
              error: error instanceof Error ? error.message : 'Upload failed' 
            }
          : f
      ));
      toast.error(`Failed to upload ${uploadFile.file.name}`);
    }
  };

  const uploadAllFiles = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    
    try {
      // Upload files sequentially to avoid overwhelming the server
      for (const file of pendingFiles) {
        await uploadFile(file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return <File className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'complete':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: UploadFile['status']) => {
    switch (status) {
      case 'pending':
        return 'Ready to upload';
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Failed';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasPendingFiles = uploadFiles.some(f => f.status === 'pending');

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
              }
            `}
          >
            <input {...getInputProps()} />
            <Upload className={`h-10 w-10 mx-auto mb-4 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
            <h3 className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <p className="text-sm text-muted-foreground">
              Supports PDF, DOCX, TXT, and MD files up to 10MB
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Files to Upload</h3>
              {hasPendingFiles && (
                <Button onClick={uploadAllFiles} disabled={isUploading}>
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload All
                </Button>
              )}
            </div>

            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div key={uploadFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(uploadFile.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium truncate">
                        {uploadFile.file.name}
                      </p>
                      <Badge variant="secondary" className="ml-2">
                        {getStatusLabel(uploadFile.status)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(uploadFile.file.size)}</span>
                      <span>•</span>
                      <span>{uploadFile.file.type || 'Unknown type'}</span>
                    </div>
                    
                    {(uploadFile.status === 'uploading' || uploadFile.status === 'processing') && (
                      <div className="mt-2">
                        <Progress value={uploadFile.progress} className="h-1" />
                      </div>
                    )}
                    
                    {uploadFile.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(uploadFile.id)}
                    disabled={uploadFile.status === 'uploading' || uploadFile.status === 'processing'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}