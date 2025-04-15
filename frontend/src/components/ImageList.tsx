import { useState, useEffect } from 'react'; // Removed unused React import
import { getImages, getImageUrl, Image as ApiImage } from '@/services/api'; // Adjust path, import Image type
import { Button } from "@/components/ui/button"; // Import Button
import { Card, CardContent, CardHeader } from "@/components/ui/card"; // Assuming shadcn/ui
import { Skeleton } from "@/components/ui/skeleton"; // For loading state
import { useToast } from "@/hooks/use-toast"; // Corrected import path from hooks


interface ImageListProps {
    refreshTrigger: number; // Add a prop to trigger refresh
}

export function ImageList({ refreshTrigger }: ImageListProps) {
  const [images, setImages] = useState<ApiImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast(); // Initialize toast

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedImages = await getImages();
      setImages(fetchedImages);
    } catch (err) {
      console.error('Failed to fetch images:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load images.';
      setError(errorMessage);
      toast({ title: "Error", description: errorMessage, variant: "destructive" }); // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [refreshTrigger]); // Re-fetch when refreshTrigger changes

  if (error && images.length === 0) { // Only show full error if list is empty
    return <div className="text-destructive p-4">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Uploaded Images</h2>
        <Button onClick={fetchImages} disabled={isLoading} size="sm">
          {isLoading ? 'Refreshing...' : 'Refresh List'}
        </Button>
      </div>
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-[200px] w-full rounded-lg" />)}
        </div>
      ) : images.length === 0 ? (
         <p>No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <Card key={image.id} className="overflow-hidden">
              <CardHeader className="p-0">
                {/* Placeholder for image - need proper serving */}
                <div className="w-full h-32 bg-muted flex items-center justify-center text-muted-foreground aspect-video">
                   {/* Image Placeholder */}
                   {/* Attempt to load image using the placeholder URL */}
                   <img
                     src={getImageUrl(image.filepath)}
                     alt={image.filename}
                     className="max-h-full max-w-full object-contain"
                     onError={(e) => (e.currentTarget.style.display = 'none')} // Hide img tag on error
                   />
                   {/* Show text if image fails to load */}
                    <span className="absolute text-xs">Preview N/A</span>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate" title={image.filename}>{image.filename}</p>
                <p className="text-xs text-muted-foreground">{new Date(image.timestamp).toLocaleString()}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
       {/* Display error message at the bottom if loading failed but some images might be shown */}
       {error && images.length > 0 && <p className="text-destructive mt-4">{error}</p>}
    </div>
  );
}
