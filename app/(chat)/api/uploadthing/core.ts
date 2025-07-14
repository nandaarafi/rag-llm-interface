import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from '@/app/(auth)/auth';

const f = createUploadthing();

export const ourFileRouter = {
  fileUploader: f({
    image: { 
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    pdf: {
      maxFileSize: "16MB",
      maxFileCount: 1
    }
  })
  .middleware(async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized");
    }
    return { userId: session.user.id };
  })
  .onUploadComplete(({ metadata, file }) => {
    console.log("Upload complete for user:", metadata.userId);
    console.log("File URL:", file.url);
    return { uploadedBy: metadata.userId };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;