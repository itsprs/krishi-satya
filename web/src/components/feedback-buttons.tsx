import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import { submitFeedback } from "@/lib/api";
import type { FeedbackVote } from "@/lib/api";
import { cn } from "@/lib/utils";

type FeedbackButtonsProps = {
	predictionId: number;
};

export function FeedbackButtons({ predictionId }: FeedbackButtonsProps) {
	const [vote, setVote] = useState<FeedbackVote | null>(null);
	const [isSending, setIsSending] = useState(false);
	const [failed, setFailed] = useState(false);

	const cast = async (next: FeedbackVote) => {
		if (isSending || vote === next) return;
		setIsSending(true);
		setFailed(false);
		try {
			await submitFeedback(predictionId, next);
			setVote(next);
		} catch {
			setFailed(true);
		} finally {
			setIsSending(false);
		}
	};

	return (
		<div className="flex items-center gap-3">
			<span className="font-mono text-xs uppercase tracking-wider text-ink-soft">
				Was this right?
			</span>
			<button
				type="button"
				onClick={() => cast("up")}
				disabled={isSending}
				aria-pressed={vote === "up"}
				aria-label="This result was accurate"
				className={cn(
					"rounded-full border p-1.5 transition-colors",
					vote === "up"
						? "border-verified bg-verified-soft text-verified"
						: "border-border text-ink-soft hover:bg-ink/5",
				)}
			>
				<ThumbsUp className="h-4 w-4" />
			</button>
			<button
				type="button"
				onClick={() => cast("down")}
				disabled={isSending}
				aria-pressed={vote === "down"}
				aria-label="This result was wrong"
				className={cn(
					"rounded-full border p-1.5 transition-colors",
					vote === "down"
						? "border-stamp bg-stamp-soft text-stamp"
						: "border-border text-ink-soft hover:bg-ink/5",
				)}
			>
				<ThumbsDown className="h-4 w-4" />
			</button>
			{vote && <span className="font-body text-xs text-ink-soft">Thanks, noted.</span>}
			{failed && <span className="font-body text-xs text-stamp">Couldn't save, try again.</span>}
		</div>
	);
}
