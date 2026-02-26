import React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 backdrop-blur-md",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-primary shadow hover:bg-primary/30",
        secondary:
          "border-transparent bg-secondary/20 text-secondary hover:bg-secondary/30",
        destructive:
          "border-transparent bg-error/20 text-error hover:bg-error/30 shadow",
        outline: "text-text border-white/20",
        success: "border-transparent bg-success/20 text-success hover:bg-success/30",
        warning: "border-transparent bg-warning/20 text-warning hover:bg-warning/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
