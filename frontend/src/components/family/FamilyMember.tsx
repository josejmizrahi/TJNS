'use client';

import * as React from 'react';
import { Card, CardHeader, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { User, Edit, X } from "lucide-react";

interface FamilyMemberProps {
  id: string;
  name: string;
  hebrewName?: string;
  relationship: string;
  onEdit?: () => void;
  onRemove?: () => void;
}

export function FamilyMember({ 
  name, 
  hebrewName, 
  relationship,
  onEdit,
  onRemove 
}: FamilyMemberProps) {
  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{relationship}</span>
        </div>
        <div className="flex items-center space-x-1">
          {onEdit && (
            <Button variant="ghost" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {onRemove && (
            <Button variant="ghost" size="sm" onClick={onRemove}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <p className="text-sm font-medium">{name}</p>
          {hebrewName && (
            <p className="text-sm text-muted-foreground">{hebrewName}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
