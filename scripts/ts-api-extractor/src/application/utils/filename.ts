export function toKebabCase(str: string): string {
    return str
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
        .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
        .toLowerCase();
}

export function formatFileName(componentName: string): string {
    return `${toKebabCase(componentName)}.json`;
}
