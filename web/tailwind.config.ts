import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: ["./index.html", "./src/**/*.{ts,tsx}"],
	theme: {
		extend: {
			colors: {
				paper: "#F5EFDF",
				"paper-dark": "#EAE0C8",
				ink: "#241C13",
				"ink-soft": "#4A4133",
				slate: "#4A5A52",
				mustard: "#C08A1E",
				"mustard-light": "#E8C468",
				verified: "#2F6B3C",
				"verified-soft": "#DDE9DC",
				stamp: "#A62B2B",
				"stamp-soft": "#F1DCDC",
				uncertain: "#6B5A2F",
				"uncertain-soft": "#EDE4CE",
				border: "#D8CBA8",
			},
			fontFamily: {
				display: ["\"Tiro Devanagari Hindi\"", "\"Georgia\"", "serif"],
				body: ["\"Source Sans 3\"", "system-ui", "sans-serif"],
				mono: ["\"IBM Plex Mono\"", "ui-monospace", "monospace"],
			},
			borderRadius: {
				card: "2px",
			},
			boxShadow: {
				paper: "0 1px 0 rgba(36, 28, 19, 0.08), 0 8px 24px -12px rgba(36, 28, 19, 0.25)",
			},
		},
	},
	plugins: [],
} satisfies Config;
