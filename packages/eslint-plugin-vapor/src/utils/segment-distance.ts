function damerauLevenshtein(a: string, b: string, max: number): number {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > max) return max + 1;
    const m = a.length;
    const n = b.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        let rowMin = Number.POSITIVE_INFINITY;
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
            if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
                dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
            }
            rowMin = Math.min(rowMin, dp[i][j]);
        }
        if (rowMin > max) return max + 1;
    }
    return dp[m][n];
}

export function segmentDistanceFromSegments(
    segA: readonly string[],
    segB: readonly string[],
): number | null {
    if (segA.length !== segB.length) return null;
    let total = 0;
    for (let i = 0; i < segA.length; i++) {
        const d = damerauLevenshtein(segA[i], segB[i], 1);
        if (d > 1) return null;
        total += d;
        if (total > 2) return null;
    }
    return total;
}

export function segmentDistance(a: string, b: string): number | null {
    return segmentDistanceFromSegments(a.split('-'), b.split('-'));
}
