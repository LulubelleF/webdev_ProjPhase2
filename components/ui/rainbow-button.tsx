"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const RainbowButton = React.forwardRef<HTMLButtonElement, RainbowButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-opacity",
          "bg-gradient-rainbow text-white hover:opacity-90",
          "px-4 py-2 h-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
          "disabled:opacity-50 disabled:pointer-events-none",
          className
        )}
        style={{
          background:
            "linear-gradient(90deg, #e74c3c, #f39c12, #f1c40f, #2ecc71, #3498db, #9b59b6)",
        }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
RainbowButton.displayName = "RainbowButton";

export { RainbowButton };
