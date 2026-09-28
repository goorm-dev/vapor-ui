function patternToRegex(pattern: string): RegExp {
    const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    const body = escaped.replace(/\*/g, '[^-]*').replace(/\?/g, '[^-]');

    return new RegExp(`^${body}$`);
}

export function matchAllowlist(name: string, patterns: readonly string[]): boolean {
    for (const p of patterns) {
        if (patternToRegex(p).test(name)) return true;
    }

    return false;
}
