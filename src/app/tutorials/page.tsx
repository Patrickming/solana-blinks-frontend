import fs from 'fs';
import path from 'path';
import { TutorialsContent } from "@/app/components/pages/tutorials-content"
// import { useLanguage } from "@/app/context/language-context" // Cannot use hooks in Server Components

// Define the type for the course data we expect to read and pass down
type Course = {
  slug: string;
  title: string;
  lessons: number;
  description?: string;
  imageUrl?: string; // This will be dynamically constructed
  firstLessonSlug: string;
  imageNumber?: number; // Add optional image number
};

// Helper function to read course data from the filesystem
async function getCoursesData(): Promise<Course[]> {
  const tutorialsBasePath = path.join(process.cwd(), 'content', 'tutorials');
  const courses: Course[] = [];

  try {
    const courseDirs = fs.readdirSync(tutorialsBasePath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const courseSlug of courseDirs) {
      const metadataPath = path.join(tutorialsBasePath, courseSlug, 'metadata.json');
      try {
        const metadataContent = fs.readFileSync(metadataPath, 'utf8');
        const metadata = JSON.parse(metadataContent);

        // Construct imageUrl dynamically if imageNumber exists
        let imageUrl = metadata.imageUrl; // Keep original if present
        if (typeof metadata.imageNumber === 'number') {
            // Assuming png extension, change if needed
            imageUrl = `/tutorial_images/${metadata.imageNumber}.png`;
        }

        // Basic validation (can be expanded)
        if (metadata.title && metadata.firstLessonSlug && typeof metadata.lessons === 'number') {
          courses.push({
            slug: courseSlug,
            title: metadata.title,
            lessons: metadata.lessons,
            description: metadata.description,
            imageUrl: imageUrl, // Use the dynamically constructed or original imageUrl
            firstLessonSlug: metadata.firstLessonSlug,
            // imageNumber: metadata.imageNumber // We don't strictly need to pass this down unless Card needs it
          });
        } else {
          console.warn(`Skipping course "${courseSlug}" due to missing or invalid metadata in ${metadataPath}`);
        }
      } catch (metaError) {
        console.warn(`Could not read or parse metadata for course "${courseSlug}" at ${metadataPath}:`, metaError);
      }
    }
    // Sort courses alphabetically by slug, or implement other sorting if needed
    courses.sort((a, b) => a.slug.localeCompare(b.slug));

  } catch (error) {
    console.error("Error reading tutorials directory:", error);
    // Return empty array or throw error depending on desired behavior
  }

  return courses;
}

/**
 * 教程页面组件 (`/tutorials`) - Now a Server Component
 * Fetches course data from the filesystem and passes it to TutorialsContent.
 */
export default async function TutorialsPage() {
  // const { t } = useLanguage(); // Cannot use hooks

  const courses = await getCoursesData();

  // Static text for title/description, replace or use i18n solution later
  const pageTitle = "教程和文档";
  const pageDescription = "学习 Solana 开发，从基础到高级。";

  return (
    <>
      {/* Header is handled by layout.tsx */}
      {/* Container and padding are handled by layout.tsx */}
      {/* 页面标题和描述区域，使用玻璃拟态效果 */}
      <div className="glass-morphism rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-2">{pageTitle}</h2>
        <p className="text-muted-foreground">{pageDescription}</p>
      </div>
      {/* Pass fetched courses data to the client component */}
      <TutorialsContent courses={courses} />
    </>
  )
}

