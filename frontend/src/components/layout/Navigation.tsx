'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { User, FileText, Users, LogOut } from "lucide-react";

const navItems = [
  {
    href: '/profile',
    label: 'Profile',
    icon: User
  },
  {
    href: '/verification',
    label: 'Verification',
    icon: FileText
  },
  {
    href: '/family',
    label: 'Family Tree',
    icon: Users
  }
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              JewishID
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center space-x-2",
                    pathname === href && "bg-accent"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </Button>
              </Link>
            ))}
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
