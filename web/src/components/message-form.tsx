import { Loader2, ScanSearch } from "lucide-react";
import { useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const MAX_LENGTH = 2000;

type MessageFormProps = {
	onSubmit: (text: string) => Promise<void>;
	isSubmitting: boolean;
};

export function MessageForm({ onSubmit, isSubmitting }: MessageFormProps) {
	const [text, setText] = useState("");
	const [error, setError] = useState<string | null>(null);

	const remaining = MAX_LENGTH - text.length;

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		const trimmed = text.trim();

		if (!trimmed) {
			setError("Paste a message first — there's nothing to check yet.");
			return;
		}

		if (trimmed.length > MAX_LENGTH) {
			setError(`Message is too long by ${trimmed.length - MAX_LENGTH} characters.`);
			return;
		}

		setError(null);
		await onSubmit(trimmed);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-3">
			<label htmlFor="message-input" className="block font-display text-base text-ink">
				Paste the forwarded message
			</label>
			<Textarea
				id="message-input"
				value={text}
				onChange={(event) => setText(event.target.value)}
				placeholder="e.g. 'Sarkar ne PM Kisan yojana ke tahat har kisan ko 4000 rupaye extra diya hai, is link par click karke turant claim karein...'"
				rows={7}
				maxLength={MAX_LENGTH + 200}
				disabled={isSubmitting}
			/>
			<div className="flex items-center justify-between">
				<span className={`font-mono text-xs ${remaining < 0 ? "text-stamp" : "text-ink-soft"}`}>
					{remaining < 0 ? `${Math.abs(remaining)} over limit` : `${remaining} characters left`}
				</span>
				<Button type="submit" disabled={isSubmitting}>
					{isSubmitting ? (
						<>
							<Loader2 className="h-4 w-4 animate-spin" />
							Checking
						</>
					) : (
						<>
							<ScanSearch className="h-4 w-4" />
							Check message
						</>
					)}
				</Button>
			</div>
			{error && <p className="font-body text-sm text-stamp">{error}</p>}
		</form>
	);
}
