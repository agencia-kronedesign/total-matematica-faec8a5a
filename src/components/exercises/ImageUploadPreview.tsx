
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ImageUploadPreviewProps {
  imagePreview: string;
  onRemove: () => void;
}

const ImageUploadPreview = ({ imagePreview, onRemove }: ImageUploadPreviewProps) => {
  return (
    <Card className="relative overflow-hidden w-40 h-40">
      <img
        src={imagePreview}
        alt="Image preview"
        className="w-full h-full object-contain"
      />
      <Button
        variant="destructive"
        size="sm"
        className="absolute top-2 right-2 h-7 w-7 p-0 rounded-full"
        onClick={onRemove}
      >
        <X className="h-4 w-4" />
      </Button>
    </Card>
  );
};

export default ImageUploadPreview;
