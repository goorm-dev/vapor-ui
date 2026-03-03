function isSimpleType(part: string): boolean {
    if (/^["'].*["']$/.test(part)) return true;
    if (/^\d+$/.test(part)) return true;
    if (/^[\w$-]+$/.test(part)) return true;
    return false;
}

export function normalizeTypeStrings(typeString: string): string[] {
    if (typeString.includes(' | ')) {
        const parts = typeString.split(' | ').map((s) => s.trim());
        if (parts.every(isSimpleType)) {
            return parts;
        }
    }

    return [typeString];
}
