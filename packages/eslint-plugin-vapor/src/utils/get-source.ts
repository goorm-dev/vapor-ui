const packageName = '@vapor-ui/core';

function kebabCase(str: string) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function getSource(components: Set<string>): Record<string, string> {
    return Object.fromEntries(
        Array.from(components).map((component) => [
            `${packageName}/${kebabCase(component)}`,
            component,
        ]),
    );
}
