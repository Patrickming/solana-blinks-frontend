import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import Image from 'next/image'; // Using next/image for potential optimization
import { Edit } from 'lucide-react';

// Simple type for the course prop
type Course = {
  slug: string;
  title: string;
  lessons: number;
  description?: string;
  imageUrl?: string;
  firstLessonSlug: string;
};

type CourseCardProps = {
  course: Course;
  onEdit?: (slug: string) => void; // Optional edit handler prop
};

export function CourseCard({ course, onEdit }: CourseCardProps) {
  // Construct the URL to the first lesson
  const firstLessonUrl = `/tutorials/${course.slug}/${course.firstLessonSlug || '01-introduction'}`;
  // Fallback added just in case firstLessonSlug is missing, though it shouldn't be

  return (
    <Card className="flex flex-col overflow-hidden h-full shadow-sm transition-all hover:shadow-md card-hover">
      {/* Link the image to the first lesson */}
      <Link href={firstLessonUrl} className="block hover:opacity-90 transition-opacity">
        {/* Image Placeholder/Actual Image */}
        <div className="relative aspect-video bg-muted overflow-hidden">
          {course.imageUrl ? (
             <Image 
               src={course.imageUrl} 
               alt={`${course.title} thumbnail`} 
               fill 
               style={{ objectFit: 'cover' }} // Use fill and objectFit
               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Example sizes
             />
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
          {/* Optional: Overlay or badge on image */}
           <Badge variant="secondary" className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm">Developer Course</Badge>
        </div>
      </Link>

      <CardHeader className="pb-3 pt-4 flex-grow">
        <CardTitle className="text-lg font-semibold mb-1 line-clamp-2">
          {/* Link the title to the first lesson */}
          <Link href={firstLessonUrl} className="hover:text-primary transition-colors">
            {course.title}
          </Link>
        </CardTitle>
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
        )}
      </CardHeader>

      <CardFooter className="pt-3 border-t flex justify-between items-center">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {course.lessons} LESSONS
        </span>
        <div className="flex items-center space-x-1">
          {/* Link the "Start Course" button to the first lesson */}
          <Button asChild variant="link" size="sm" className="p-0 h-auto text-primary hover:text-primary/80">
            <Link href={firstLessonUrl}>Start Course</Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 