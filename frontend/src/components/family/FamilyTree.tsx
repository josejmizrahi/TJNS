'use client';

import * as React from 'react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import { Plus, Loader2 } from "lucide-react";
import { FamilyMember } from "./FamilyMember";

interface FamilyMemberData {
  id: string;
  name: string;
  hebrewName?: string;
  relationship: string;
}

export function FamilyTree() {
  const [members, setMembers] = useState<FamilyMemberData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMember = () => {
    // Will be implemented with modal form
    console.log('Add family member');
  };

  const handleEditMember = (memberId: string) => {
    // Will be implemented with modal form
    console.log('Edit member:', memberId);
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // Will be implemented with API integration
      setMembers(prev => prev.filter(m => m.id !== memberId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove family member');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Family Tree</CardTitle>
        <CardDescription>
          Manage your family connections
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end">
            <Button onClick={handleAddMember}>
              <Plus className="mr-2 h-4 w-4" />
              Add Family Member
            </Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : members.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No family members added yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <FamilyMember
                  key={member.id}
                  {...member}
                  onEdit={() => handleEditMember(member.id)}
                  onRemove={() => handleRemoveMember(member.id)}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
