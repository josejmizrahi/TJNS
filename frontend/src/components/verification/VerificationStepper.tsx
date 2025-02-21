'use client';

import * as React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type VerificationLevel = 'none' | 'basic' | 'community' | 'financial' | 'governance';

const VERIFICATION_LEVELS: { id: VerificationLevel; label: string; description: string }[] = [
  {
    id: 'basic',
    label: 'Baseline Trust',
    description: 'Email and phone verification'
  },
  {
    id: 'community',
    label: 'Community Trust',
    description: 'Rabbi reference and Hebrew name'
  },
  {
    id: 'financial',
    label: 'Financial Trust',
    description: 'KYC and video verification'
  },
  {
    id: 'governance',
    label: 'Governance Trust',
    description: 'Multi-party verification'
  }
];

interface VerificationStepperProps {
  currentLevel: VerificationLevel;
}

export function VerificationStepper({ currentLevel }: VerificationStepperProps) {
  return (
    <div className="w-full py-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500"
            style={{
              width: `${
                currentLevel === 'none' ? 0 :
                currentLevel === 'basic' ? 33 :
                currentLevel === 'community' ? 66 :
                currentLevel === 'financial' ? 90 :
                100
              }%`
            }}
          />

          {/* Steps */}
          <div className="relative flex justify-between">
            {VERIFICATION_LEVELS.map((level, index) => {
              const isCompleted = VERIFICATION_LEVELS.findIndex(l => l.id === currentLevel) >= index;
              const isCurrent = level.id === currentLevel;

              return (
                <div key={level.id} className="flex flex-col items-center">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2",
                    isCompleted ? "bg-primary border-primary text-white" : "bg-white border-gray-300",
                    isCurrent ? "ring-2 ring-primary ring-offset-2" : ""
                  )}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div className="mt-3 text-center">
                    <p className={cn(
                      "font-medium",
                      isCompleted ? "text-primary" : "text-gray-500"
                    )}>
                      {level.label}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {level.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
