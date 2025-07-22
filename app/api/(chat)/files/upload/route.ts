import { NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/app/(auth)/auth';
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

const FileSchema = z.object({
  file: z
    .instanceof(Blob)
    .refine((file) => {
      const maxSize = file.type === 'application/pdf' ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
      return file.size <= maxSize;
    }, {
      message: 'File size should be less than 5MB for images or 10MB for PDFs',
    })
    .refine((file) => 
      ['image/jpeg', 'image/png', 'application/pdf'].includes(file.type), 
    {
      message: 'File type should be JPEG, PNG, or PDF',
    }),
});

export async function POST(request: Request) {
  try {
    // Get the session
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as unknown as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const validation = FileSchema.safeParse({ file });
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Convert File to Blob for UploadThing
    const blob = new Blob([file], { type: file.type });
    const filename = file.name;

    // Upload to UploadThing with proper metadata
    const response = await utapi.uploadFiles(new File([blob], filename, { type: file.type }));

    if (!response.data) {
      console.error('UploadThing error:', response.error);
      throw new Error(`Upload failed: ${response.error?.message || 'Unknown error'}`);
    }

    return NextResponse.json({
      url: response.data.url,
      name: response.data.name,
      contentType: file.type,
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    );
  }
}