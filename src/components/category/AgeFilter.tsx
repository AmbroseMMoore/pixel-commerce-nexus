
import React from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface AgeFilterProps {
  selectedAges: string[];
  onAgeChange: (ages: string[]) => void;
}

const ageRanges = [
  "0-3 months",
  "3-6 months",
  "6-9 months",
  "9-12 months",
  "1-2 years",
  "2-3 years",
  "3-4 years",
  "4-5 years",
  "5-6 years",
  "6-7 years",
  "7-8 years",
  "8-9 years",
  "9-10 years",
  "10+ years"
];

const AgeFilter = ({ selectedAges, onAgeChange }: AgeFilterProps) => {
  const handleAgeToggle = (age: string) => {
    const updatedAges = selectedAges.includes(age)
      ? selectedAges.filter(a => a !== age)
      : [...selectedAges, age];
    onAgeChange(updatedAges);
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Age Range</Label>
      <div className="space-y-2">
        {ageRanges.map((age) => (
          <div key={age} className="flex items-center space-x-2">
            <Checkbox
              id={`age-${age}`}
              checked={selectedAges.includes(age)}
              onCheckedChange={() => handleAgeToggle(age)}
            />
            <Label 
              htmlFor={`age-${age}`} 
              className="text-sm font-normal cursor-pointer"
            >
              {age}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AgeFilter;
