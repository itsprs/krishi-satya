import { cva, type VariantProps } from "class-variance-authority";
import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-card text-sm font-semibold tracking-wide transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard",
	{
		variants: {
			variant: {
				primary: "bg-ink text-paper hover:bg-ink-soft",
				outline: "border border-ink/30 text-ink hover:bg-ink/5",
				ghost: "text-ink-soft hover:bg-ink/5",
			},
			size: {
				default: "h-10 px-5",
				sm: "h-8 px-3 text-xs",
				icon: "h-9 w-9",
			},
		},
		defaultVariants: {
			variant: "primary",
			size: "default",
		},
	},
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, ...props }, ref) => (
		<button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
	),
);

Button.displayName = "Button";
