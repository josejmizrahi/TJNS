'use client';

import * as React from 'react';
import { useState } from 'react';
import { useLogin, useRegister } from '../../hooks/auth';
import { Button } from "../ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Alert, AlertDescription } from "../ui/alert";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
  mode: 'signin' | 'signup';
}

export function AuthForm({ mode }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hebrewName, setHebrewName] = useState('');
  const [englishName, setEnglishName] = useState('');

  const login = useLogin();
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'signin') {
        await login.mutateAsync({ email, password });
      } else {
        await register.mutateAsync({ 
          email, 
          password,
          hebrewName,
          englishName
        });
      }
    } catch (err) {
      // Error handling is managed by the mutation
      console.error('Auth error:', err);
    }
  };

  const isLoading = mode === 'signin' ? login.isPending : register.isPending;
  const error = mode === 'signin' ? login.error : register.error;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === 'signin' ? 'Sign In' : 'Create Account'}</CardTitle>
        <CardDescription>
          {mode === 'signin' 
            ? 'Enter your credentials to access your account' 
            : 'Create a new account to get started'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="hebrewName">Hebrew Name</Label>
                <Input
                  id="hebrewName"
                  value={hebrewName}
                  onChange={(e) => setHebrewName(e.target.value)}
                  placeholder="Enter your Hebrew name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="englishName">English Name</Label>
                <Input
                  id="englishName"
                  value={englishName}
                  onChange={(e) => setEnglishName(e.target.value)}
                  placeholder="Enter your English name"
                  required
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error instanceof Error ? error.message : 'Authentication failed'}
              </AlertDescription>
            </Alert>
          )}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
