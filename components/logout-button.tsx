// components/logout-button.tsx
"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useRouter } from "next/navigation"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function LogoutButton({ variant = "ghost", size = "default", className = "" }: LogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)

      // Sign out with explicit redirect to login page
      await signOut({
        callbackUrl: "/",
        redirect: false,
      })

      // Force a hard navigation to the login page
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout} disabled={isLoggingOut}>
      <LogOut className="mr-2 h-4 w-4" />
      <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
    </Button>
  )
}

