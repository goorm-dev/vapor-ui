export function isRefType(typeText: string): boolean {
    return /^(React\.)?Ref<([^>]+)>(\s*\|\s*undefined)?$/.test(typeText);
}

export function resolveRefType(typeText: string): string {
    const match = typeText.match(/^(React\.)?Ref<([^>]+)>(\s*\|\s*undefined)?$/);
    return match ? `Ref<${match[2]}>` : typeText;
}
