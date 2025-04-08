"use client"
import { AuthDialog } from "@/components/auth-dialog"

interface AuthDialogWrapperProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode?: "login" | "register" | "wallet" | "setup"
  redirectUrl?: string
}

export function AuthDialogWrapper(props: AuthDialogWrapperProps) {
  return <AuthDialog {...props} />
}

