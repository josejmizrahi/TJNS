'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";

interface ProfileData {
  hebrewName: string;
  synagogueName: string;
  communityRole: string;
}

export function ProfileForm() {
  const [profile, setProfile] = useState<ProfileData>({
    hebrewName: '',
    synagogueName: '',
    communityRole: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // API integration will be added in the next iteration
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>
          Update your Jewish identity information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="hebrewName">Hebrew Name</Label>
            <Input
              id="hebrewName"
              value={profile.hebrewName}
              onChange={(e) => setProfile(prev => ({ ...prev, hebrewName: e.target.value }))}
              placeholder="Enter your Hebrew name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="synagogueName">Synagogue</Label>
            <Input
              id="synagogueName"
              value={profile.synagogueName}
              onChange={(e) => setProfile(prev => ({ ...prev, synagogueName: e.target.value }))}
              placeholder="Enter your synagogue name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="communityRole">Community Role</Label>
            <Input
              id="communityRole"
              value={profile.communityRole}
              onChange={(e) => setProfile(prev => ({ ...prev, communityRole: e.target.value }))}
              placeholder="Enter your role in the community"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
