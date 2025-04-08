import { SiteHeader } from "@/components/layout/site-header"
import BlinkCreatorWrapper from "@/components/blink/blink-creator-wrapper"

export const metadata = {
  title: "创建 Blink | Solana Blinks",
  description: "创建 Blink、发行代币和 NFT 的一站式工具",
}

export default function BlinkPage() {
  return (
    <>
      <SiteHeader />
      <main className="container py-10">
        <BlinkCreatorWrapper />
      </main>
    </>
  )
}

