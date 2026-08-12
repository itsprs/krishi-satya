import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { HistoryEntry, Verdict } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from "@/components/ui/table";

type HistoryTableProps = {
	entries: HistoryEntry[];
	isLoading: boolean;
};

const badgeVariant: Record<Verdict, "genuine" | "misleading" | "uncertain"> = {
	genuine: "genuine",
	misleading: "misleading",
	uncertain: "uncertain",
};

function formatTimestamp(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString("en-IN", {
		day: "2-digit",
		month: "short",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function HistoryTable({ entries, isLoading }: HistoryTableProps) {
	if (isLoading) {
		return <p className="font-body text-sm text-ink-soft">Loading past checks…</p>;
	}

	if (entries.length === 0) {
		return (
			<p className="rounded-card border border-dashed border-border px-4 py-6 text-center font-body text-sm text-ink-soft">
				No checks yet. Every message you verify above will show up here.
			</p>
		);
	}

	return (
		<Table>
			<TableHead>
				<TableRow>
					<TableHeaderCell>Message</TableHeaderCell>
					<TableHeaderCell>Verdict</TableHeaderCell>
					<TableHeaderCell>Confidence</TableHeaderCell>
					<TableHeaderCell>Checked</TableHeaderCell>
					<TableHeaderCell>Feedback</TableHeaderCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{entries.map((entry) => (
					<TableRow key={entry.id}>
						<TableCell className="max-w-sm">
							<span className="line-clamp-2 text-sm">{entry.text}</span>
						</TableCell>
						<TableCell>
							<Badge variant={badgeVariant[entry.label]}>{entry.label}</Badge>
						</TableCell>
						<TableCell className="font-mono text-sm">{Math.round(entry.confidence * 100)}%</TableCell>
						<TableCell className="font-mono text-xs text-ink-soft">
							{formatTimestamp(entry.timestamp)}
						</TableCell>
						<TableCell>
							{entry.feedback === "up" && <ThumbsUp className="h-4 w-4 text-verified" />}
							{entry.feedback === "down" && <ThumbsDown className="h-4 w-4 text-stamp" />}
							{!entry.feedback && <span className="text-ink-soft/50">—</span>}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
