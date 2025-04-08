import { SiteHeader } from "@/components/layout/site-header"
import { ProfileContentWrapper } from "@/components/pages/profile-content-wrapper"

export default function ProfilePage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <ProfileContentWrapper />
      </main>
    </>
  )
}

