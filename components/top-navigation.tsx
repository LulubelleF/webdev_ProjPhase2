"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Home, Settings, LogOut, Menu, X, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TopNavigationProps {
  activePage: "home" | "accounts";
}

export default function TopNavigation({ activePage }: TopNavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session } = useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Sign out with explicit redirect to login page
      await signOut({
        callbackUrl: "/",
        redirect: true,
      });

      // Close mobile menu if open
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="bg-white border-b shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center">
              <Image
                src="/images/humanelogo.png"
                alt="Humane Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-humane-red to-humane-purple bg-clip-text text-transparent">
                Humane
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 rounded-md ${
                activePage === "home"
                  ? "bg-gradient-to-r from-humane-blue/20 to-humane-purple/20 text-humane-blue"
                  : "text-gray-600 hover:bg-gradient-to-r hover:from-humane-blue/10 hover:to-humane-purple/10"
              }`}
            >
              <Home className="h-5 w-5 mr-1" />
              <span>Home</span>
            </Link>
            {/* Only show System Accounts link to ADMIN users (removed HR) */}
            {session?.user.role === "ADMIN" && (
              <Link
                href="/dashboard/accounts"
                className={`flex items-center px-3 py-2 rounded-md ${
                  activePage === "accounts"
                    ? "bg-gradient-to-r from-humane-blue/20 to-humane-purple/20 text-humane-blue"
                    : "text-gray-600 hover:bg-gradient-to-r hover:from-humane-blue/10 hover:to-humane-purple/10"
                }`}
              >
                <Settings className="h-5 w-5 mr-1" />
                <span>System Accounts</span>
              </Link>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <span>{session?.user.name || session?.user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-3 space-y-2">
            <Link
              href="/dashboard"
              className={`flex items-center px-3 py-2 rounded-md ${
                activePage === "home"
                  ? "bg-gradient-to-r from-humane-blue/20 to-humane-purple/20 text-humane-blue"
                  : "text-gray-600"
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Home className="h-5 w-5 mr-2" />
              <span>Home</span>
            </Link>
            {/* Only show System Accounts link to ADMIN users (removed HR) */}
            {session?.user.role === "ADMIN" && (
              <Link
                href="/dashboard/accounts"
                className={`flex items-center px-3 py-2 rounded-md ${
                  activePage === "accounts"
                    ? "bg-gradient-to-r from-humane-blue/20 to-humane-purple/20 text-humane-blue"
                    : "text-gray-600"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Settings className="h-5 w-5 mr-2" />
                <span>System Accounts</span>
              </Link>
            )}
            <div className="pt-2 border-t border-gray-200">
              <div className="px-3 py-2 text-sm text-gray-500">
                Signed in as: {session?.user.name || session?.user.username}
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="flex items-center px-3 py-2 rounded-md text-gray-600 w-full justify-start"
                disabled={isLoggingOut}
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
