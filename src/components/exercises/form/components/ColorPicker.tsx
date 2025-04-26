
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Swatch } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { CategoryFormValues } from '../schemas/categoryFormSchema';

const colors = [
  '#8E9196', '#9b87f5', '#7E69AB', '#6E59A5', '#1A1F2C',
  '#D6BCFA', '#F2FCE2', '#FEF7CD', '#FEC6A1', '#E5DEFF',
  '#FFDEE2', '#FDE1D3', '#D3E4FD', '#F1F0FB', '#8B5CF6',
  '#D946EF', '#F97316', '#0EA5E9', '#403E43', '#FFFFFF'
];

interface ColorPickerProps {
  form: UseFormReturn<CategoryFormValues>;
}

const ColorPicker = ({ form }: ColorPickerProps) => {
  const selectedColor = form.watch('cor') || '#9b87f5';

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Cor da Categoria</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-[200px] justify-start text-left font-normal"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 rounded-full border"
                style={{ backgroundColor: selectedColor }}
              />
              <Swatch className="h-4 w-4" />
              <span>Selecionar cor</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-5 gap-2">
            {colors.map((color) => (
              <button
                key={color}
                className={`h-8 w-8 rounded-full border-2 transition-all ${
                  selectedColor === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => form.setValue('cor', color)}
                type="button"
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ColorPicker;
