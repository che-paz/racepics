import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  variant?: "default" | "error";
  className?: string;
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "default",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-8 text-center sm:p-12",
        variant === "error" && "border-destructive/30 bg-destructive/5",
        className
      )}
    >
      {Icon ? (
        <Icon
          className={cn(
            "mx-auto mb-4 size-10",
            variant === "error" ? "text-destructive" : "text-muted-foreground"
          )}
          aria-hidden
        />
      ) : null}
      <p
        className={cn(
          "font-medium",
          variant === "error" ? "text-destructive" : "text-foreground"
        )}
      >
        {title}
      </p>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
