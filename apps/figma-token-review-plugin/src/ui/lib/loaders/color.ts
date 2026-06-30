import type { Role, SchemaMode } from '~/common/schemas';
import primitiveDark from '~/common/tokens/primitive-color.dark.json';
import primitiveLight from '~/common/tokens/primitive-color.light.json';
import semanticDark from '~/common/tokens/semantic-color.dark.json';
import semanticLight from '~/common/tokens/semantic-color.light.json';

const NS = 'io.goorm.vapor';

export type GradeRule = { other: '100' | '200' | 'ambiguous' | null };

export type SemanticTokenMeta = {
    role: Role | null;
    status: string | null;
    valueRef: string | null;
    hex: string | null;
    when: string[];
    avoid: string[];
    description: string | null;
    gradeRule: GradeRule | null;
};

export type ColorSchema = {
    mode: SchemaMode;
    semantic: Record<string, SemanticTokenMeta>;
    primitive: Record<string, string>;
    tokenKeys: string[];
    hexIndex: Map<string, string[]>;
};

type Node = {
    $description?: string;
    $value?: unknown;
    $extensions?: { [key: string]: Record<string, unknown> };
    [k: string]: unknown;
};

function vaporMeta(node: Node): Record<string, unknown> {
    return (node?.$extensions?.[NS] ?? {}) as Record<string, unknown>;
}

/** Convert oklch components [L, C, h°] to a #rrggbb hex string. */
function oklchToHex([L, C, h]: [number, number, number]): string {
    // oklch → oklab
    const hRad = (h * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    // oklab → linear sRGB (via cube-root intermediates)
    const L_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const M_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const S_ = L - 0.0894841775 * a - 1.291485548 * b;

    const l = L_ * L_ * L_;
    const m = M_ * M_ * M_;
    const s = S_ * S_ * S_;

    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const bv = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    // linear → gamma sRGB
    const toGamma = (x: number): number =>
        x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;

    // clamp, scale to 0-255, format as hex
    const clamp = (x: number) => Math.max(0, Math.min(1, x));
    const toHex = (x: number) =>
        Math.round(clamp(x) * 255)
            .toString(16)
            .padStart(2, '0');

    return `#${toHex(toGamma(r))}${toHex(toGamma(g))}${toHex(toGamma(bv))}`;
}

function flattenPrimitive(root: { colors?: Node }): Record<string, string> {
    const out: Record<string, string> = {};
    const walk = (node: Node, path: string) => {
        if (!node || typeof node !== 'object') return;
        if ('$value' in node) {
            const v = node.$value;
            if (typeof v === 'string') {
                out[path] = v;
                return;
            }
            if (
                v &&
                typeof v === 'object' &&
                (v as { colorSpace?: string }).colorSpace === 'oklch'
            ) {
                const components = (v as { components?: unknown }).components;
                if (
                    Array.isArray(components) &&
                    components.length === 3 &&
                    components.every((n) => typeof n === 'number')
                ) {
                    out[path] = oklchToHex(components as [number, number, number]);
                }
                return;
            }
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v as Node, path ? `${path}-${k}` : k);
        }
    };
    if (root.colors) walk(root.colors, 'color');
    return out;
}

function resolveAlias(valueRef: string | null, primitive: Record<string, string>): string | null {
    if (!valueRef) return null;
    const m = valueRef.match(/^\{(.+)\}$/);
    if (!m) return /^#[0-9a-f]{3,8}$/i.test(valueRef) ? valueRef : null;
    // Convert JSON alias path (dot-separated, plural 'colors') to new key format (dash-separated, singular 'color')
    const aliasPath = m[1].replace(/^colors\./, 'color-').replace(/\./g, '-');
    return primitive[aliasPath] ?? null;
}

function asRole(value: unknown): Role | null {
    const valid: Role[] = [
        'background',
        'foreground',
        'border',
        'space',
        'dimension',
        'borderRadius',
        'shadow',
    ];
    return typeof value === 'string' && (valid as string[]).includes(value)
        ? (value as Role)
        : null;
}

function isGradeKey(value: unknown): value is '100' | '200' | 'ambiguous' {
    return value === '100' || value === '200' || value === 'ambiguous';
}

function flattenSemantic(
    root: { colors?: Node },
    primitive: Record<string, string>,
): {
    semantic: Record<string, SemanticTokenMeta>;
    tokenKeys: string[];
    hexIndex: Map<string, string[]>;
} {
    const out: Record<string, SemanticTokenMeta> = {};
    const hexIndex = new Map<string, string[]>();

    const walk = (node: Node, path: string, inheritedGradeRules: Record<string, string> | null) => {
        const meta = vaporMeta(node);
        const gradeRules =
            (meta.gradeRules as Record<string, string> | undefined) ?? inheritedGradeRules;
        if ('$value' in node && typeof node.$value === 'string') {
            const grade = path.split('-').pop() ?? '';
            const valueRef = node.$value as string;
            const hex = resolveAlias(valueRef, primitive);
            // Store the grade key ('100'/'200') as GradeRule.other rather than the
            // description text — the type requires '100'|'200'|'ambiguous'|null and
            // downstream evaluators need the key, not prose.
            const hasGradeRule = gradeRules != null && grade in gradeRules;
            const gradeRuleOther: '100' | '200' | 'ambiguous' | null =
                hasGradeRule && isGradeKey(grade) ? grade : null;
            out[path] = {
                role: asRole((meta.accessibility as { role?: unknown } | undefined)?.role),
                status: typeof meta.status === 'string' ? meta.status : null,
                valueRef,
                hex,
                when: Array.isArray(meta.when) ? (meta.when as string[]) : [],
                avoid: Array.isArray(meta.avoid) ? (meta.avoid as string[]) : [],
                description: typeof node.$description === 'string' ? node.$description : null,
                gradeRule: gradeRuleOther ? { other: gradeRuleOther } : null,
            };
            if (hex) {
                const key = hex.toLowerCase();
                const arr = hexIndex.get(key) ?? [];
                arr.push(path);
                hexIndex.set(key, arr);
            }
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v as Node, path ? `${path}-${k}` : k, gradeRules ?? null);
        }
    };
    if (root.colors) walk(root.colors, 'color', null);
    return { semantic: out, tokenKeys: Object.keys(out), hexIndex };
}

export function loadColorSchema(mode: SchemaMode): ColorSchema {
    const semanticRaw = mode === 'dark' ? semanticDark : semanticLight;
    const primitiveRaw = mode === 'dark' ? primitiveDark : primitiveLight;
    const primitive = flattenPrimitive(primitiveRaw as { colors?: Node });
    const { semantic, tokenKeys, hexIndex } = flattenSemantic(
        semanticRaw as { colors?: Node },
        primitive,
    );
    return { mode, semantic, primitive, tokenKeys, hexIndex };
}
