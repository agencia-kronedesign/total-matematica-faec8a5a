
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { UseFormReturn } from 'react-hook-form';
import { COLOR_PALETTE, DEFAULT_COLOR } from '@/constants/colors';
import { CategoryFormValues } from '../schemas/categoryFormSchema';

interface ColorPickerProps {
  form: UseFormReturn<CategoryFormValues>;
}

const ColorPicker = ({ form }: ColorPickerProps) => {
  return (
    <FormField
      control={form.control}
      name="cor"
      defaultValue={DEFAULT_COLOR}
      render={({ field }) => (
        <FormItem>
          <FormLabel>Cor da Categoria</FormLabel>
          <FormControl>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-[200px] justify-start text-left font-normal"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: field.value || DEFAULT_COLOR }}
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
                      type="button"
                      className={`h-8 w-8 rounded-full border-2 transition-all ${
                        field.value === color ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        field.onChange(color);
                      }}
                    />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default ColorPicker;
