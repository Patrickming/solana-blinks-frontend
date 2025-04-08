"use client"

import { useRouter } from "next/navigation"
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Link2, BookOpen, Layers, MessageSquare, ArrowRight } from "lucide-react"
import { useWallet } from "@/components/wallet-provider"
import { RecentActivity } from "@/components/recent-activity"
import { useState } from "react"
import { AuthDialog } from "@/components/auth-dialog"

export function DashboardContent() {
  const router = useRouter()
  const { connected } = useWallet()
  const [authDialogOpen, setAuthDialogOpen] = useState(false)

  const features = [
    {
      title: "Create Blink",
      description: "Generate and manage Solana Blinks for your projects",
      icon: Link2,
      path: "/blink",
      color: "from-purple-500 to-blue-500",
    },
    {
      title: "Tutorials",
      description: "Learn how to use Blinks with step-by-step guides",
      icon: BookOpen,
      path: "/tutorials",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Showcase",
      description: "Explore case studies and examples from the community",
      icon: Layers,
      path: "/showcase",
      color: "from-cyan-500 to-emerald-500",
    },
    {
      title: "Forum",
      description: "Join discussions and share your experiences",
      icon: MessageSquare,
      path: "/forum",
      color: "from-emerald-500 to-yellow-500",
    },
  ]

  const handleConnectWallet = () => {
    setAuthDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="glass-morphism rounded-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-2">Welcome to Solana Blinks</h2>
        <p className="text-muted-foreground mb-4">
          A decentralized platform for creating and managing Solana blockchain operations
        </p>
        {!connected && (
          <Button
            className="bg-gradient-to-r from-[#9945FF] to-[#14F195] hover:opacity-90"
            onClick={handleConnectWallet}
          >
            Connect Wallet to Get Started
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {features.map((feature) => (
          <Card key={feature.title} className="glass-morphism overflow-hidden border-0">
            <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
            <CardHeader>
              <feature.icon className="h-8 w-8 mb-2 text-primary" />
              <CardTitle>{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button variant="ghost" className="w-full justify-between" onClick={() => router.push(feature.path)}>
                <span>Explore</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {connected && <RecentActivity />}

      {/* Auth Dialog */}
      <AuthDialog mode="wallet" open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  )
}

