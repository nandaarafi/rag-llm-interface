import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoadingDocument() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Skeleton className="h-8 w-24" /> {/* Back button */}
              
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-16 rounded-full" /> {/* Badge */}
                
                <div className="space-y-2">
                  <Skeleton className="h-5 w-48" /> {/* Title */}
                  <Skeleton className="h-4 w-32" /> {/* Date */}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-20" /> {/* Download button */}
              <Skeleton className="h-8 w-16" /> {/* Share button */}
              <Skeleton className="h-8 w-28" /> {/* Open in Chat button */}
            </div>
          </div>
        </div>
      </div>

      {/* Document Content Skeleton */}
      <div className="container max-w-6xl mx-auto p-4">
        <Card className="min-h-[calc(100vh-200px)]">
          <CardHeader>
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}