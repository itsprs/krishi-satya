import { useEffect, useState } from "react";
import { MessageForm } from "@/components/message-form";
import { ResultCard } from "@/components/result-card";
import { HistoryTable } from "@/components/history-table";
import { ApiError, fetchHistory, predictMessage } from "@/lib/api";
import type { HistoryEntry, PredictionResult } from "@/lib/api";

export default function App() {
	const [result, setResult] = useState<PredictionResult | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [history, setHistory] = useState<HistoryEntry[]>([]);
	const [isHistoryLoading, setIsHistoryLoading] = useState(true);

	const loadHistory = async () => {
		setIsHistoryLoading(true);
		try {
			const entries = await fetchHistory();
			setHistory(entries);
		} catch { } finally {
			setIsHistoryLoading(false);
		}
	};

	useEffect(() => {
		loadHistory();
	}, []);

	const handleSubmit = async (text: string) => {
		setIsSubmitting(true);
		setSubmitError(null);
		try {
			const prediction = await predictMessage(text);
			setResult(prediction);
			loadHistory();
		} catch (error) {
			setSubmitError(
				error instanceof ApiError ? error.message : "Couldn't reach the server. Is the backend running?",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mx-auto min-h-screen max-w-3xl px-6 py-10">
			<svg width="0" height="0" className="absolute" aria-hidden="true">
				<filter id="stamp-roughen">
					<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="noise" />
					<feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
				</filter>
			</svg>

			<header className="mb-10 border-b-2 border-double border-ink/30 pb-6">
				<p className="font-mono text-xs uppercase tracking-[0.2em] text-ink-soft">
					Tech-a-Thon 5.0 · Farm Scheme Advisory Checker
				</p>
				<h1 className="mt-2 font-display text-4xl font-bold text-ink">Krishi Satya</h1>
				<p className="mt-2 max-w-xl font-body text-sm text-ink-soft">
					Paste a WhatsApp-style message about a government farm scheme and get a verdict —
					genuine, likely misleading, or uncertain — with the words that drove the call.
				</p>
			</header>

			<main className="space-y-10">
				<section className="rounded-card border border-border bg-paper-dark/30 p-6">
					<MessageForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
					{submitError && <p className="mt-3 font-body text-sm text-stamp">{submitError}</p>}
				</section>

				{result && (
					<section>
						<h2 className="mb-3 font-display text-xl text-ink">Result</h2>
						<ResultCard result={result} />
					</section>
				)}

				<section>
					<h2 className="mb-3 font-display text-xl text-ink">History</h2>
					<HistoryTable entries={history} isLoading={isHistoryLoading} />
				</section>
			</main>
		</div>
	);
}
