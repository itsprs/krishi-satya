import type { Keyword, Verdict } from "@/lib/api";
import { cn } from "@/lib/utils";

type KeywordHighlightProps = {
	keywords: Keyword[];
	label: Verdict;
};

const toneClasses: Record<Verdict, string> = {
	genuine: "border-verified/40 text-verified bg-verified-soft",
	misleading: "border-stamp/40 text-stamp bg-stamp-soft",
	uncertain: "border-uncertain/40 text-uncertain bg-uncertain-soft",
};

export function KeywordHighlight({ keywords, label }: KeywordHighlightProps) {
	if (keywords.length === 0) return null;

	const maxWeight = Math.max(...keywords.map((keyword) => Math.abs(keyword.weight)), 1);

	return (
		<div>
			<p className="mb-2 font-mono text-xs uppercase tracking-wider text-ink-soft">
				Words that shaped this call
			</p>
			<ul className="flex flex-wrap gap-2">
				{keywords.map((keyword) => {
					const intensity = Math.abs(keyword.weight) / maxWeight;
					return (
						<li
							key={keyword.term}
							className={cn(
								"rounded-full border px-3 py-1 font-body text-sm",
								toneClasses[label],
							)}
							style={{ opacity: 0.55 + intensity * 0.45 }}
						>
							{keyword.term}
						</li>
					);
				})}
			</ul>
		</div>
	);
}
