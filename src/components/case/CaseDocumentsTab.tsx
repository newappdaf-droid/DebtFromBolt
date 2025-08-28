// Case Documents Tab Component
// Document management with upload, versioning, and retention policies

import React, { useState, useEffect } from 'react';
import { 
  Upload, FileText, Download, Eye, Trash2, Plus, 
  File, Image, Archive, AlertTriangle, Calendar, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { casesApi } from '@/lib/api/casesApi';
import { CaseDocument, DocumentUploadInitRequest } from '@/types/cases';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface CaseDocumentsTabProps {
  caseId: string;
  onUpdate?: () => void;
}

const documentTypeConfig = {
  Invoice: { label: 'Invoice', icon: FileText, color: 'bg-blue-100 text-blue-800' },
  PoA: { label: 'Power of Attorney', icon: File, color: 'bg-purple-100 text-purple-800' },
  CourtFiling: { label: 'Court Filing', icon: Archive, color: 'bg-red-100 text-red-800' },
  ProofOfPayment: { label: 'Proof of Payment', icon: FileText, color: 'bg-green-100 text-green-800' },
  ID: { label: 'Identification', icon: User, color: 'bg-yellow-100 text-yellow-800' },
  Other: { label: 'Other', icon: File, color: 'bg-gray-100 text-gray-800' }
};

export function CaseDocumentsTab({ caseId, onUpdate }: CaseDocumentsTabProps) {
  const [documents, setDocuments] = useState<CaseDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const [uploadForm, setUploadForm] = useState({
    file: null as File | null,
    type: 'Other' as keyof typeof documentTypeConfig
  });

  useEffect(() => {
    loadDocuments();
  }, [caseId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const documentsData = await casesApi.getCaseDocuments(caseId);
      setDocuments(documentsData);
    } catch (error) {
      console.error('Failed to load documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({ ...prev, file }));
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.file) {
      toast.error('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Initialize upload
      const initRequest: DocumentUploadInitRequest = {
        FileName: uploadForm.file.name,
        MimeType: uploadForm.file.type,
        Size: uploadForm.file.size,
        Type: uploadForm.type
      };

      const initResponse = await casesApi.initDocumentUpload(caseId, initRequest);
      setUploadProgress(50);

      // Simulate upload progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUploadProgress(100);

      // Commit document
      const document = await casesApi.commitDocument(caseId, {
        StorageKey: initResponse.StorageKey
      });

      setDocuments(prev => [document, ...prev]);
      setShowUploadDialog(false);
      setUploadForm({ file: null, type: 'Other' });
      setUploadProgress(0);
      toast.success('Document uploaded successfully');
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to upload document');
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getDocumentIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return Image;
    if (mimeType.includes('pdf')) return FileText;
    return File;
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Document Management
            </CardTitle>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Upload New Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Document Type</Label>
                    <Select value={uploadForm.type} onValueChange={(value: any) => setUploadForm(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(documentTypeConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Select File</Label>
                    <Input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    />
                    {uploadForm.file && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Selected: {uploadForm.file.name} ({formatFileSize(uploadForm.file.size)})
                      </p>
                    )}
                  </div>
                  
                  {isUploading && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={isUploading}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpload} disabled={!uploadForm.file || isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No documents uploaded yet</p>
              <p className="text-sm">Upload documents to support your case</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Version</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((document) => {
                  const DocumentIcon = getDocumentIcon(document.MimeType);
                  const TypeIcon = documentTypeConfig[document.Type].icon;
                  
                  return (
                    <TableRow key={document.DocumentId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <DocumentIcon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{document.FileName}</p>
                            <p className="text-sm text-muted-foreground">{document.MimeType}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={documentTypeConfig[document.Type].color}>
                          <TypeIcon className="h-3 w-3 mr-1" />
                          {documentTypeConfig[document.Type].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(document.Size)}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{format(new Date(document.UploadedAt), 'MMM dd, yyyy')}</p>
                          {document.UploadedBy && (
                            <p className="text-xs text-muted-foreground">by {document.UploadedBy}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">v{document.Version}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );

}