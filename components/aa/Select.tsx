"use client";
import React, { useCallback, useState } from "react";
import { Chip, Button as UIButton } from "@heroui/react";
import { Button } from "~/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover"
import { ChevronDown } from "lucide-react";

export type Option = { value: string; label: string };
interface MultiComboboxProps {
  selectedValues: string[];
  setSelectedValues: React.Dispatch<React.SetStateAction<string[]>>;
  options: Option[];
  optionName?: string;
};
export const MultiCombobox: React.FC<MultiComboboxProps> = ({ selectedValues, setSelectedValues, options, optionName }) => {
  const [open, setOpen] = useState(false)
  // const [selectedValues, setSelectedValues] = useState<string[]>([])
  const handleSelect = (currentValue: string) => {
    const result = [...selectedValues, currentValue]
    setSelectedValues(result)
  }
  const handleRemove = (valueToRemove: string) => {
    setSelectedValues(selectedValues.filter((value) => value !== valueToRemove));
  };
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className=" justify-between w-full p-2 gap-1 bg-secondary h-fit" 
        >
          {selectedValues.length > 0
          ? (<div className="flex flex-wrap gap-1">
            {selectedValues.map((value) => (
              <Chip
                key={value}
                variant="flat" className="bg-primary"
                onClose={() => handleRemove(value)}
              >
                {options.find((option) => option.value === value)?.label}
              </Chip>
            ))}
          </div>)
          : (<span className="text-muted">
            Select {optionName ? optionName :"options"}...
          </span>
          )}
          <ChevronDown  className={`  opacity-50 transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180":""}`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search option..." className="h-9" />
          <CommandList>
            <CommandEmpty>No {optionName ? optionName :"options"} found.</CommandEmpty>
            <CommandGroup>
            {options.filter(option => !selectedValues.includes(option.value)).map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={(currentValue) => {
                  handleSelect(option.value)
                  // setOpen(false)
                }}
              >
                {option.label}
              </CommandItem>
            ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}



import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"

interface SelectDemoProps {
  value: string;
  setValue: (value: string) => void;
  options: Option[];
  optionName?: string;
};
export const SelectDemo = ({
  value, setValue, options, optionName
}: SelectDemoProps) => {
  console.log(`SelectDemo: value:`, value)
  const [open, setOpen] = useState(false) // info: 

  return (
    <Select open={open} onOpenChange={setOpen} onValueChange={setValue} defaultValue={value}>
      <ASelectTrigger value={value}  className="bg-secondary" 
        defaultChecked
      >
        <SelectValue />
        <SelectPrimitive.Icon asChild>
          <ChevronDown  className={`h-4 w-4  opacity-50 transition-transform duration-150 motion-reduce:transition-none ${open ? "rotate-180":""}`} />
        </SelectPrimitive.Icon>
      </ASelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
import * as SelectPrimitive from "@radix-ui/react-select"
import { cn } from "~/lib/utils";
const ASelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
  </SelectPrimitive.Trigger>
))
ASelectTrigger.displayName = SelectPrimitive.Trigger.displayName