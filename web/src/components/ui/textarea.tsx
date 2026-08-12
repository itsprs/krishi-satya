import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
	({ className, ...props }, ref) => (
		<textarea
			ref={ref}
			className={cn(
				"w-full resize-none rounded-card border border-border bg-paper px-4 py-3 font-body text-sm text-ink placeholder:text-ink-soft/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mustard",
				className,
			)}
			{...props}
		/>
	),
);

Textarea.displayName = "Textarea";
