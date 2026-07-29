import type { Scope } from '~/data/property-scope-map';

const PREFIX = '--vapor-';

export function scopeFromTokenName(name: string): Scope | 'primitive' | null {
    if (!name.startsWith(PREFIX)) return null;

    const [scope, property] = name.slice(PREFIX.length).split('-');

    if (scope === 'color') {
        if (property === 'foreground' || property === 'background' || property === 'border') {
            return property;
        }

        return 'primitive';
    }

    if (scope === 'size') {
        if (property === 'dimension' || property === 'space' || property === 'borderRadius') {
            return property;
        }
    }

    if (scope === 'shadow') return 'shadow';

    return null;
}
