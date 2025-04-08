"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Copy, Eye, EyeOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { resetUserPassword } from "@/lib/api/user-api";

interface ResetPasswordDialogProps {
  username: string;
  userId: string;
}

export default function ResetPasswordDialog({
  username,
  userId,
}: ResetPasswordDialogProps) {
  const { toast } = useToast();
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [password, setPassword] = useState(""); // Add this line to track the password input
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to generate a secure password
  const generateSecurePassword = () => {
    const length = 12;
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_-+=<>?";
    let password = "";

    // Ensure at least one character from each category
    password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(Math.random() * 26)];
    password += "abcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 26)];
    password += "0123456789"[Math.floor(Math.random() * 10)];
    password += "!@#$%^&*()_-+=<>?"[Math.floor(Math.random() * 16)];

    // Fill the rest of the password
    for (let i = 4; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    password = password
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");

    setGeneratedPassword(password);
    setCopied(false);
  };

  // Function to copy password to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Handle reset password
  const handleResetPassword = async () => {
    const passwordToUse = generatedPassword || password;

    if (!passwordToUse) {
      toast({
        title: "Error",
        description: "Please enter or generate a password",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await resetUserPassword(userId, passwordToUse);

      toast({
        title: "Success",
        description: "Password reset successfully",
      });

      // Close dialog
      setIsOpen(false);
      setGeneratedPassword("");
      setPassword("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to reset password",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset Password
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Generate a new secure password for user{" "}
            <span className="font-medium">{username}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={generatedPassword || password}
                  onChange={(e) => {
                    setGeneratedPassword(""); // Clear generated password when user types
                    setPassword(e.target.value);
                  }}
                  className="pr-10"
                  placeholder="Enter or generate a password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                type="button"
                size="icon"
                onClick={copyToClipboard}
                disabled={!generatedPassword}
                className={copied ? "bg-green-500 hover:bg-green-600" : ""}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && (
              <p className="text-xs text-green-600">
                Password copied to clipboard!
              </p>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">
              You can either enter a password manually or generate a secure
              random password.
            </p>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={generateSecurePassword}
            className="mb-2 sm:mb-0"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Generate Password
          </Button>
          <div className="space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-gradient-rainbow hover:opacity-90 transition-opacity"
              disabled={
                (generatedPassword === "" && password === "") || isSubmitting
              }
              onClick={handleResetPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
