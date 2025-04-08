"use client"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface CustomWalletModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CustomWalletModal({ open, onOpenChange }: CustomWalletModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Custom Wallet</DialogTitle>
          <DialogDescription>This is a placeholder for a custom wallet connection.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>This feature is under development.</p>
        </div>
        <Button onClick={() => onOpenChange(false)}>Close</Button>
      </DialogContent>
    </Dialog>
  )
}

