const packageName = '@vapor-ui/core';

function kebabCase(str: string) {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

export function getSource(components: Set<string>): Record<string, string> {
    return Array.from(components).reduce((acc, component) => {
        return {
            ...acc,
            [`${packageName}/${kebabCase(component)}`]: component,
        };
    }, {});
}
