import { useState, useCallback } from 'react'; // Removed unused React import
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button'; // Assuming shadcn/ui setup
import { uploadImage } from '@/services/api'; // Adjust path as needed
import { useToast } from "@/hooks/use-toast" // Corrected import path from hooks

interface ImageUploadProps {
  onUploadSuccess: () => void; // Callback to refresh image list
}

export function ImageUpload({ onUploadSuccess }: ImageUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
     onDrop,
     accept: {'image/*': ['.jpeg', '.png', '.jpg', '.gif', '.webp']}, // Accept common image types
     multiple: false
    });

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      await uploadImage(selectedFile);
      toast({ title: "Success", description: "Image uploaded successfully!" });
      setSelectedFile(null); // Clear selection
      onUploadSuccess(); // Trigger refresh
    } catch (error) {
      console.error('Upload failed:', error);
      const errorMessage = error instanceof Error ? error.message : "Image upload failed.";
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-md cursor-pointer text-center transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
      >
        <input {...getInputProps()} />
        {selectedFile ? (
          <p>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
        ) : isDragActive ? (
          <p>Drop the image here ...</p>
        ) : (
          <p>Drag 'n' drop an image here, or click to select</p>
        )}
      </div>
      {selectedFile && (
         <div className="flex justify-center">
            <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? 'Uploading...' : 'Upload Image'}
            </Button>
         </div>
      )}
    </div>
  );
}
