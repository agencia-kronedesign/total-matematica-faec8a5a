
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, ImageIcon } from 'lucide-react';
import { FormLabel } from '@/components/ui/form';

interface ExerciseImageUploadProps {
  imagePreview: string | null;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const ExerciseImageUpload = ({
  imagePreview,
  onImageChange,
  onRemoveImage,
}: ExerciseImageUploadProps) => {
  return (
    <div className="space-y-2">
      <FormLabel>Imagem do Exercício</FormLabel>
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="flex-1">
          <label htmlFor="image-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-500 transition-colors">
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Clique para selecionar uma imagem</span>
              <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (máx. 5MB)</span>
            </div>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onImageChange}
            />
          </label>
        </div>

        {imagePreview && (
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
              onClick={onRemoveImage}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ExerciseImageUpload;
