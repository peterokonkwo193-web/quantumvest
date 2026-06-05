import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-glass border border-white/10 bg-surface-container-lowest px-4 py-2 font-mono text-sm text-white placeholder:text-on-surface-variant/50 transition-all focus:border-neon focus:outline-none focus:ring-2 focus:ring-neon/20",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
