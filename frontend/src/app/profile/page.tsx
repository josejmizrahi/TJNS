'use client';

import React from 'react';
import { ProfileForm } from '../../components/profile/ProfileForm';

export default function ProfilePage(): React.ReactNode {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Profile Management</h1>
      <ProfileForm />
    </div>
  );
}
