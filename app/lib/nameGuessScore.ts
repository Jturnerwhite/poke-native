/** Lowercase, strip spaces/hyphens so "Mr-Mime" and "mr mime" align with marshal display names. */
export function normalizeNameForScore(s: string): string {
	return s.toLowerCase().replace(/[\s-]/g, "");
}

/** Longest common subsequence length — letters that match in order (not necessarily adjacent). */
function longestCommonSubsequenceLength(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			if (a[i - 1] === b[j - 1]) dp[i][j] = dp[i - 1][j - 1] + 1;
			else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
		}
	}
	return dp[m][n];
}

/** Edit distance: insert/delete/substitute — how far off the guess is letter-wise. */
function levenshteinDistance(a: string, b: string): number {
	const m = a.length;
	const n = b.length;
	const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
	for (let i = 0; i <= m; i++) dp[i][0] = i;
	for (let j = 0; j <= n; j++) dp[0][j] = j;
	for (let i = 1; i <= m; i++) {
		for (let j = 1; j <= n; j++) {
			const cost = a[i - 1] === b[j - 1] ? 0 : 1;
			dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
		}
	}
	return dp[m][n];
}

/**
 * 0–100: 100 = exact match (after normalize). Otherwise blends
 * (LCS length / target length) — letters correct in order — with
 * Levenshtein similarity — how many letter edits are wrong.
 */
export function computeNameClosenessScore(guess: string, target: string): number {
	const g = normalizeNameForScore(guess);
	const t = normalizeNameForScore(target);
	if (g === t) return 100;
	if (t.length === 0) return 0;

	const lcs = longestCommonSubsequenceLength(g, t);
	const lcsRatio = lcs / t.length;

	const maxLen = Math.max(g.length, t.length);
	const dist = levenshteinDistance(g, t);
	const editSimilarity = 1 - dist / maxLen;

	const blended = 0.55 * lcsRatio + 0.45 * editSimilarity;
	return Math.round(Math.max(0, Math.min(99, blended * 100)));
}
