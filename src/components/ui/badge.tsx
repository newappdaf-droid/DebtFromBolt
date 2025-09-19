import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
        success:
          "border-transparent bg-success text-success-foreground hover:bg-success/80",
        warning:
          "border-transparent bg-warning text-warning-foreground hover:bg-warning/80",
        info:
          "border-transparent bg-info text-info-foreground hover:bg-info/80",
        // Professional status variants
        client:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        agent:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        admin:
          "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100",
        dpo:
          "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100",
        // Status variants
        pending:
          "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100",
        approved:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
        rejected:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        active:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        inactive:
          "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100",
        // Type variants
        legal:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100",
        expense:
          "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
        settlement:
          "border-green-200 bg-green-50 text-green-700 hover:bg-green-100",
      },
      size: {
        sm: "px-2 py-0.5 text-xs h-5 min-w-[2rem]",
        default: "px-3 py-1 text-xs h-6 min-w-[2.5rem]",
        lg: "px-4 py-1.5 text-sm h-7 min-w-[3rem]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  truncate?: boolean;
  maxWidth?: string;
}

function Badge({ className, variant, size, truncate = false, maxWidth, children, ...props }: BadgeProps) {
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        truncate && "truncate",
        className
      )} 
      style={maxWidth ? { maxWidth } : undefined}
      title={typeof children === 'string' ? children : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge, badgeVariants }