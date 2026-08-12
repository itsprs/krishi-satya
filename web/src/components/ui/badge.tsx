import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
	"inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
	{
		variants: {
			variant: {
				genuine: "bg-verified-soft text-verified",
				misleading: "bg-stamp-soft text-stamp",
				uncertain: "bg-uncertain-soft text-uncertain",
				neutral: "bg-ink/5 text-ink-soft",
			},
		},
		defaultVariants: {
			variant: "neutral",
		},
	},
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
	return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
