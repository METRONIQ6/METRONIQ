import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-all border select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&>svg]:pointer-events-none [&>svg]:size-3!",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a]:hover:bg-secondary/90",
        success:
          "border-green-200 bg-green-50 text-green-800 dark:border-green-800/60 dark:bg-green-950/40 dark:text-green-300 [a]:hover:bg-green-100",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800/60 dark:bg-amber-950/40 dark:text-amber-300 [a]:hover:bg-amber-100",
        destructive:
          "border-red-200 bg-red-50 text-red-800 dark:border-red-800/60 dark:bg-red-950/40 dark:text-red-300 [a]:hover:bg-red-100",
        info:
          "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800/60 dark:bg-blue-950/40 dark:text-blue-300 [a]:hover:bg-blue-100",
        neutral:
          "border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300",
        outline:
          "border-border bg-transparent text-foreground [a]:hover:bg-muted [a]:hover:text-foreground",
        ghost:
          "border-transparent hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        link: "border-transparent text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function getStatusBadgeVariant(status?: string | null): "default" | "secondary" | "success" | "warning" | "destructive" | "info" | "neutral" | "outline" {
  if (!status) return "neutral";
  const s = status.toUpperCase();
  if (["COMPLIANT", "RESOLVED", "APPROVED", "ACTIVE", "PASS", "SUCCESS", "VERIFIED"].includes(s)) {
    return "success";
  }
  if (["NON_COMPLIANT", "PENALTY_ISSUED", "REJECTED", "FAIL", "FAILED", "SUSPENDED", "DANGER"].includes(s)) {
    return "destructive";
  }
  if (["UNDER_REVIEW", "PENALTY_PENDING", "WARNING", "PARTIAL", "WAITING", "ESCALATED", "RECTIFICATION_SUBMITTED"].includes(s)) {
    return "warning";
  }
  if (["OPEN", "NEW", "INFO", "PENDING", "PROCESSING", "SUBMITTED"].includes(s)) {
    return "info";
  }
  return "neutral";
}

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants, getStatusBadgeVariant }
