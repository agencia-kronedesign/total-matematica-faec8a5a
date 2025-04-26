
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { UseFormReturn } from 'react-hook-form';
import { CategoryFormValues } from '../schemas/categoryFormSchema';
import { COLOR_PALETTE, DEFAULT_COLOR } from '@/constants/colors';

const ColorPicker = ({ form }: { form: UseFormReturn<CategoryFormValues> }) => {
  const selectedColor = form.watch('cor') || DEFAULT_COLOR;

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
              <Palette className="h-4 w-4" />
              <span>Selecionar cor</span>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="grid grid-cols-5 gap-2">
            {COLOR_PALETTE.map((color) => (
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
