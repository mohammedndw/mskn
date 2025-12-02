import { useRef } from "react";
import { Upload, X, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ImageUploaderProps {
  selectedFiles: File[];
  onFilesChange: (files: File[]) => void;
}

export default function ImageUploader({ selectedFiles, onFilesChange }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types and sizes
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`);
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} is larger than 5MB`);
        return;
      }
      
      validFiles.push(file);
    });
    
    if (errors.length > 0) {
      toast({
        title: "Invalid files",
        description: errors.join(', '),
        variant: "destructive",
      });
    }
    
    // Check total file limit
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > 10) {
      toast({
        title: "Too many files",
        description: "Maximum 10 images allowed",
        variant: "destructive",
      });
      return;
    }
    
    onFilesChange([...selectedFiles, ...validFiles]);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    
    if (fileInputRef.current) {
      const dt = new DataTransfer();
      files.forEach(file => dt.items.add(file));
      fileInputRef.current.files = dt.files;
      
      const changeEvent = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(changeEvent);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  return (
    <div data-testid="image-uploader">
      <label className="block text-sm font-medium text-foreground mb-2">Property Images</label>
      
      {/* Drop Zone */}
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        data-testid="drop-zone"
      >
        <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground mb-1">Drop images here or click to browse</p>
        <p className="text-xs text-muted-foreground">Max 10 files, 5MB each. JPG, PNG, WebP supported.</p>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="file-input"
        />
      </div>
      
      {/* Image Preview Grid */}
      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4" data-testid="image-preview-grid">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-full h-full object-cover"
                  data-testid={`preview-image-${index}`}
                />
              </div>
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleRemoveFile(index)}
                data-testid={`button-remove-image-${index}`}
              >
                <X className="h-3 w-3" />
              </Button>
              <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-white text-xs p-1 rounded truncate">
                {file.name}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedFiles.length > 0 && (
        <p className="text-xs text-muted-foreground mt-2" data-testid="file-count">
          {selectedFiles.length} of 10 files selected
        </p>
      )}
    </div>
  );
}
