import React from 'react';
import { SiteHeader } from '@/app/components/layout/site-header'; // Import the header

interface TutorialsLayoutProps {
  children: React.ReactNode;
}

export default function TutorialsLayout({ children }: TutorialsLayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      <SiteHeader /> {/* Render the site header */}
      <main className="flex-grow container mx-auto px-4 py-8"> {/* Add padding and center content */}
        {children} {/* Render the specific page content (list or lesson) */}
      </main>
      {/* You could add a shared Footer here if needed */}
    </div>
  );
} 