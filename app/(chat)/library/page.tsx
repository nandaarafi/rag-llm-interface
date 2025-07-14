"use client"

import React, { useState, useMemo } from 'react';
import { Search, Upload, Download, Share2, Eye, FileText, Calendar, HardDrive } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

type Document = {
  id: string;
  title: string;
  description: string;
  date: string;
};

const documents: Document[] = [
  {
    id: '1',
    title: 'Business Proposal - Q4 2024',
    description: 'Comprehensive business proposal for Q4 expansion',
    date: '6 days ago',
  },
  {
    id: '2',
    title: 'Financial Report - Annual',
    description: 'Complete annual financial analysis and projections',
    date: '3 weeks ago',
  },
  {
    id: '3',
    title: 'Marketing Strategy Guide',
    description: 'Strategic marketing plan for 2025',
    date: '1 week ago',
  },
  {
    id: '4',
    title: 'Employee Handbook',
    description: 'Updated policies and procedures manual',
    date: '2 days ago',
  },
  {
    id: '5',
    title: 'Technical Documentation',
    description: 'System architecture and API documentation',
    date: '2 days ago',
  },
  {
    id: '6',
    title: 'Legal Compliance Guide',
    description: 'Regulatory compliance and legal requirements',
    date: '2 days ago',
  },
  {
    id: '7',
    title: 'Project Timeline - 2025',
    description: 'Detailed project roadmap and milestones',
    date: '3+ months ago',
  },
  {
    id: '8',
    title: 'Client Presentation Deck',
    description: 'Interactive presentation for client meetings',
    date: '1 month ago',
  }
];

export default function DocumentManager() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDocuments = useMemo(() => {
    if (!searchTerm) return documents;
    const term = searchTerm.toLowerCase();
    return documents.filter(
      doc =>
        doc.title.toLowerCase().includes(term) ||
        doc.description.toLowerCase().includes(term)
    );
  }, [searchTerm, documents]);

  const getCategoryColor = (category: string) => {
    const colors = {
      Business: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      Finance: 'bg-green-100 text-green-800 hover:bg-green-200',
      Marketing: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      HR: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      Technical: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      Legal: 'bg-red-100 text-red-800 hover:bg-red-200',
      Project: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      Presentation: 'bg-pink-100 text-pink-800 hover:bg-pink-200',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleUpload = () => {
    // Implement file upload logic
    console.log('Upload triggered');
  };

  const handleView = (doc: Document) => {
    alert(`Opening: ${doc.title}`);
  };

  const handleDownload = (doc: Document) => {
    alert(`Downloading: ${doc.title}`);
  };

  const handleShare = (doc: Document) => {
    alert(`Sharing: ${doc.title}`);
  };

  return (
    <div className="container py-8 space-y-6 px-4">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Manage and organize your uploaded documents
        </p>
      </div>

      {/* Search and Upload */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documents..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Documents Grid */}
      <div className="max-w-screen-xl mx-auto px-10">

      {filteredDocuments.length > 0 ? (
  // Changed gap-4 to gap-8 to increase the space between the cards.
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {filteredDocuments.map((doc) => (
      <Card key={doc.id} className="hover:shadow-md transition-shadow w-50 h-60">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="p-2 rounded-lg bg-secondary">
              <FileText className="size-6 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-lg mt-4 line-clamp-1">{doc.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {doc.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{doc.date}</span>
            </div>
          </div>
        </CardContent>
        {/* Added a gap-2 to the footer to space out buttons if more are added. */}
        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button variant="outline" size="sm" onClick={() => handleView(doc)}>
            <Eye className="size-4 mr-2" />
            View
          </Button>
        </CardFooter>
      </Card>
    ))}
  </div>
) : (
  <Card className="text-center p-8">
    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-medium">No documents found</h3>
    <p className="text-muted-foreground mt-2">
      {searchTerm ? 'Try a different search term' : 'Upload your first document to get started'}
    </p>
    {!searchTerm && (
      <Button onClick={handleUpload} className="mt-4">
        <Upload className="h-4 w-4 mr-2" />
        Upload Document
      </Button>
    )}
  </Card>
)}
</div>

    </div>
  );
}