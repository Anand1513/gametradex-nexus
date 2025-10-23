import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface ConsentCheckboxProps {
  id: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  required?: boolean;
}

const ConsentCheckbox: React.FC<ConsentCheckboxProps> = ({
  id,
  checked,
  onCheckedChange,
  label,
  required = false
}) => {
  return (
    <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border border-border">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
      <Label 
        htmlFor={id} 
        className="text-sm leading-relaxed cursor-pointer flex-1"
      >
        {required && <span className="text-destructive mr-1">*</span>}
        {label}
      </Label>
    </div>
  );
};

export default ConsentCheckbox;


