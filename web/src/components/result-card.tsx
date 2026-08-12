import type { PredictionResult, Verdict } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { FeedbackButtons } from "@/components/feedback-buttons";
import { KeywordHighlight } from "@/components/keyword-highlight";
import { cn } from "@/lib/utils";

type ResultCardProps = {
	result: PredictionResult;
};

const stampCopy: Record<Verdict, { headline: string; subline: string; colorClass: string }> = {
	genuine: {
		headline: "VERIFIED",
		subline: "matches known scheme",
		colorClass: "border-verified text-verified",
	},
	misleading: {
		headline: "LIKELY HOAX",
		subline: "forward with caution",
		colorClass: "border-stamp text-stamp",
	},
	uncertain: {
		headline: "UNCERTAIN",
		subline: "needs manual review",
		colorClass: "border-uncertain text-uncertain",
	},
};

export function ResultCard({ result }: ResultCardProps) {
	const stamp = stampCopy[result.label];
	const confidencePct = Math.round(result.confidence * 100);

	return (
		<Card className="relative overflow-hidden">
			<CardContent className="grid gap-6 pt-6 md:grid-cols-[1fr_auto]">
				<div className="space-y-5">
					<div>
						<p className="mb-1 font-mono text-xs uppercase tracking-wider text-ink-soft">
							Message checked
						</p>
						<p className="font-body text-sm leading-relaxed text-ink-soft">
							&ldquo;{result.text.length > 220 ? `${result.text.slice(0, 220)}…` : result.text}
							&rdquo;
						</p>
					</div>

					<KeywordHighlight keywords={result.keywords} label={result.label} />

					{result.note && (
						<p className="rounded-card border border-border bg-paper-dark/40 px-3 py-2 font-body text-sm text-ink-soft">
							{result.note}
						</p>
					)}

					<FeedbackButtons predictionId={result.id} />
				</div>

				<div className="flex items-start justify-center md:justify-end">
					<div
						className={cn(
							"stamp-wobble flex h-32 w-32 shrink-0 -rotate-[9deg] flex-col items-center justify-center rounded-full border-[3px] text-center",
							stamp.colorClass,
						)}
						style={{ borderStyle: "double", borderWidth: "6px" }}
						role="img"
						aria-label={`Verdict stamp: ${stamp.headline}, ${confidencePct} percent confidence`}
					>
						<span className="font-display text-sm font-bold leading-tight">{stamp.headline}</span>
						<span className="mt-1 font-mono text-lg font-semibold">{confidencePct}%</span>
						<span className="mt-1 px-2 font-mono text-[9px] uppercase leading-tight tracking-wide">
							{stamp.subline}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
