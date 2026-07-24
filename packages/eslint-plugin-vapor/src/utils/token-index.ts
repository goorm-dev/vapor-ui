import type { Scope } from '~/data/property-scope-map';
import borderRadius from '~/data/tokens/border-radius.json';
import dimension from '~/data/tokens/dimension.json';
import primitiveColorDark from '~/data/tokens/primitive-color.dark.json';
import primitiveColorLight from '~/data/tokens/primitive-color.light.json';
import semanticColorDark from '~/data/tokens/semantic-color.dark.json';
import semanticColorLight from '~/data/tokens/semantic-color.light.json';
import shadow from '~/data/tokens/shadow.json';
import space from '~/data/tokens/space.json';

import { oklchToHex } from './color-resolver';
import { scopeFromTokenName } from './token-scope';

export type TokenKind = 'semantic' | 'primitive' | 'foundation';

export interface TokenMeta {
    name: string;
    kind: TokenKind;
    scope: Scope | 'primitive';
    /** Light-mode hex. Kept as `hex` for back-compat with downstream rules. */
    hex?: string;
    hexDark?: string;
    px?: number;
}

export interface CanonicalTokenEntry {
    name: string;
    segments: readonly string[];
}

export interface TokenIndex {
    canonicalTokens: ReadonlySet<string>;
    tokenMeta: ReadonlyMap<string, TokenMeta>;
    byHex: ReadonlyMap<string, readonly string[]>;
    byPx: ReadonlyMap<number, readonly string[]>;
    tokensBySegmentCount: ReadonlyMap<number, readonly CanonicalTokenEntry[]>;
}

interface IndexBuilder {
    canonical: Set<string>;
    meta: Map<string, TokenMeta>;
    hexIndex: Map<string, string[]>;
    pxIndex: Map<number, string[]>;
}

function nameFromPath(prefix: string, path: readonly string[]): string {
    return `--vapor-${[prefix, ...path].filter(Boolean).join('-')}`;
}

function pushIndex<K>(map: Map<K, string[]>, key: K, name: string): void {
    const list = map.get(key) ?? [];
    if (!list.includes(name)) list.push(name);
    map.set(key, list);
}

function walkFoundation(b: IndexBuilder, json: unknown, prefix: string, scope: Scope): void {
    const visit = (node: unknown, path: string[]): void => {
        if (!node || typeof node !== 'object') return;

        const obj = node as Record<string, unknown>;
        if (!('$value' in obj) || !obj.$value || typeof obj.$value !== 'object') {
            for (const [k, v] of Object.entries(obj)) {
                if (k.startsWith('$')) continue;
                visit(v, [...path, k]);
            }
            return;
        }

        const v = obj.$value as { value?: number; unit?: string };
        if (typeof v.value === 'number' && v.unit === 'px') {
            const name = nameFromPath(prefix, path);
            b.canonical.add(name);
            b.meta.set(name, { name, kind: 'foundation', scope, px: v.value });
            pushIndex(b.pxIndex, v.value, name);
        }
    };

    visit(json, []);
}

function walkPrimitiveColors(b: IndexBuilder, json: unknown, mode: 'light' | 'dark'): void {
    const visit = (node: unknown, path: string[]): void => {
        if (!node || typeof node !== 'object') return;

        const obj = node as Record<string, unknown>;
        if (!('$value' in obj) || !obj.$value || typeof obj.$value !== 'object') {
            for (const [k, v] of Object.entries(obj)) {
                if (k.startsWith('$')) continue;
                visit(v, [...path, k]);
            }
            return;
        }

        // Detect color leaf by $value.colorSpace === 'oklch' (works for both
        // single-token entries like { $type, $value } and scale entries like
        // blue.600 that only have $value at the leaf level without $type)
        const value = obj.$value as {
            colorSpace?: string;
            components?: [number, number, number];
            alpha?: number;
        };

        if (value.colorSpace === 'oklch' && Array.isArray(value.components)) {
            const name = nameFromPath('color', path);
            const hex = oklchToHex(value.components, value.alpha);
            b.canonical.add(name);

            const existing = b.meta.get(name);
            const tokenMeta = existing ?? { name, kind: 'primitive', scope: 'primitive' };

            if (mode === 'light') b.meta.set(name, { ...tokenMeta, hex });
            else b.meta.set(name, { ...tokenMeta, hexDark: hex });

            pushIndex(b.hexIndex, hex, name);
        }
    };
    // top-level object has `colors: { ... }` per spec
    const root = (json as { colors?: unknown }).colors;
    visit(root, []);
}

function walkSemanticColors(
    b: IndexBuilder,
    json: unknown,
    primitiveByName: ReadonlyMap<string, string>,
    mode: 'light' | 'dark',
): void {
    // semantic leaves carry $value as reference string: "{colors.blue.100}"
    const visit = (node: unknown, path: string[]): void => {
        if (!node || typeof node !== 'object') return;

        const obj = node as Record<string, unknown>;

        if (!('$value' in obj) || !obj.$value || typeof obj.$value !== 'string') {
            for (const [k, v] of Object.entries(obj)) {
                if (k.startsWith('$')) continue;
                visit(v, [...path, k]);
            }
            return;
        }

        const ref = obj.$value.trim();
        if (ref.startsWith('{') && ref.endsWith('}')) {
            const refPath = ref.slice(1, -1).split('.');
            // refPath looks like ['colors', 'blue', '100']; primitive token names
            // use singular 'color' prefix — drop leading 'colors'
            const primSegments = refPath[0] === 'colors' ? refPath.slice(1) : refPath;
            const primName = `--vapor-color-${primSegments.join('-')}`;
            const hex = primitiveByName.get(primName);
            const name = nameFromPath('color', path);
            const scope = scopeFromTokenName(name);

            // Only foreground, background, and border tokens are considered
            // canonical semantic tokens. Others (like shadow) are not.
            if (scope !== 'foreground' && scope !== 'background' && scope !== 'border') {
                return;
            }

            b.canonical.add(name);
            const existing = b.meta.get(name);
            const base = existing ?? { name, kind: 'semantic' as TokenKind, scope };

            if (mode === 'light') b.meta.set(name, { ...base, hex });
            else b.meta.set(name, { ...base, hexDark: hex });

            if (hex) pushIndex(b.hexIndex, hex, name);
        }
    };

    const root = (json as { colors?: unknown }).colors;
    visit(root, []);
}

function walkShadow(b: IndexBuilder, json: unknown): void {
    const root = (json as { shadow?: Record<string, unknown> }).shadow ?? {};

    for (const [k, v] of Object.entries(root)) {
        if (k.startsWith('$') || !v || typeof v !== 'object') continue;

        const name = `--vapor-shadow-${k}`;
        b.canonical.add(name);
        b.meta.set(name, { name, kind: 'foundation', scope: 'shadow' });
    }
}

export function buildTokenIndex(): TokenIndex {
    const b: IndexBuilder = {
        canonical: new Set(),
        meta: new Map(),
        hexIndex: new Map(),
        pxIndex: new Map(),
    };

    walkFoundation(
        b,
        (dimension as { size?: { dimension?: unknown } }).size?.dimension,
        'size-dimension',
        'dimension',
    );
    walkFoundation(b, (space as { size?: { space?: unknown } }).size?.space, 'size-space', 'space');
    walkFoundation(
        b,
        (borderRadius as { size?: { borderRadius?: unknown } }).size?.borderRadius,
        'size-borderRadius',
        'borderRadius',
    );
    walkPrimitiveColors(b, primitiveColorLight, 'light');
    walkPrimitiveColors(b, primitiveColorDark, 'dark');

    // Build primitive lookups BEFORE semantic walk (per mode)
    const primitiveByNameLight = new Map<string, string>();
    const primitiveByNameDark = new Map<string, string>();
    b.meta.forEach((meta, name) => {
        if (meta.kind !== 'primitive') return;
        if (meta.hex) primitiveByNameLight.set(name, meta.hex);
        if (meta.hexDark) primitiveByNameDark.set(name, meta.hexDark);
    });

    walkSemanticColors(b, semanticColorLight, primitiveByNameLight, 'light');
    walkSemanticColors(b, semanticColorDark, primitiveByNameDark, 'dark');
    walkShadow(b, shadow);

    const bySegmentCount = new Map<number, CanonicalTokenEntry[]>();
    b.canonical.forEach((name) => {
        const segments = name.split('-');
        const bucket = bySegmentCount.get(segments.length);
        const entry: CanonicalTokenEntry = { name, segments };

        if (bucket) bucket.push(entry);
        else bySegmentCount.set(segments.length, [entry]);
    });

    return {
        canonicalTokens: b.canonical,
        tokenMeta: b.meta,
        byHex: b.hexIndex,
        byPx: b.pxIndex,
        tokensBySegmentCount: bySegmentCount,
    };
}

export const TOKEN_INDEX: TokenIndex = buildTokenIndex();

export function isCanonicalToken(name: string): boolean {
    return TOKEN_INDEX.canonicalTokens.has(name);
}
