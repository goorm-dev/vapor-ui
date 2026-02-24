export function toKebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function formatFileName(componentName: string): string {
    return `${toKebabCase(componentName)}.json`;
}
