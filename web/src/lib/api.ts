export type Verdict = "genuine" | "misleading" | "uncertain";

export type Keyword = {
	term: string;
	weight: number;
};

export type PredictionResult = {
	id: number;
	text: string;
	label: Verdict;
	confidence: number;
	keywords: Keyword[];
	note: string | null;
	timestamp: string;
};

export type HistoryEntry = {
	id: number;
	text: string;
	label: Verdict;
	confidence: number;
	timestamp: string;
	feedback: "up" | "down" | null;
};

export type FeedbackVote = "up" | "down";

class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

async function parseErrorMessage(response: Response) {
	try {
		const body = await response.json();
		if (typeof body?.detail === "string") return body.detail;
		if (Array.isArray(body?.detail)) {
			return body.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(", ");
		}
	} catch { }
	return `Request failed with status ${response.status}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
	const response = await fetch(`/api${path}`, {
		headers: { "Content-Type": "application/json" },
		...init,
	});

	if (!response.ok) {
		throw new ApiError(await parseErrorMessage(response), response.status);
	}

	return response.json() as Promise<T>;
}

export function predictMessage(text: string) {
	return request<PredictionResult>("/predict", {
		method: "POST",
		body: JSON.stringify({ text }),
	});
}

export function fetchHistory() {
	return request<HistoryEntry[]>("/history");
}

export function submitFeedback(id: number, vote: FeedbackVote) {
	return request<void>("/feedback", {
		method: "POST",
		body: JSON.stringify({ id, vote }),
	});
}

export { ApiError };
