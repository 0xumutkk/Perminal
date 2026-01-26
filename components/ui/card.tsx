import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, interactive = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "relative rounded-2xl border border-slate-800/80 bg-slate-950/80 p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.6)] transition-colors",
          interactive &&
            "gradient-border hover:border-slate-700/80 hover:bg-slate-950",
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

