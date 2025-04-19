"use client"

import React from 'react';
import { useParams } from 'next/navigation';
import { SiteHeader } from "@/app/components/layout/site-header";
import { Button } from "@/app/components/ui/button";
import { useRouter } from 'next/navigation';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.courseSlug as string;

  // TODO: Fetch actual course details and lessons based on courseSlug

  return (
    <>
      <SiteHeader />
      <main className="container mx-auto py-8 px-4 md:px-6">
        <Button onClick={() => router.push('/tutorials')} variant="outline" className="mb-6">
          返回教程列表
        </Button>
        <div className="bg-card p-6 rounded-lg shadow-sm">
          <h1 className="text-2xl font-bold mb-4">课程详情: {courseSlug}</h1>
          <p className="text-muted-foreground">课程内容即将上线...</p>
          {/* TODO: Render course structure, lessons list, etc. */}
        </div>
      </main>
    </>
  );
} 