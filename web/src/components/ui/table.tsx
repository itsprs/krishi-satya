import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
	return (
		<div className="w-full overflow-x-auto">
			<table className={cn("w-full border-collapse text-sm", className)} {...props} />
		</div>
	);
}

export function TableHead({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return <thead className={cn("border-b rule", className)} {...props} />;
}

export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) {
	return <tbody className={className} {...props} />;
}

export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
	return <tr className={cn("border-b rule last:border-0", className)} {...props} />;
}

export function TableHeaderCell({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
	return (
		<th
			className={cn(
				"px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-ink-soft",
				className,
			)}
			{...props}
		/>
	);
}

export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
	return <td className={cn("px-4 py-3 align-top text-ink", className)} {...props} />;
}
