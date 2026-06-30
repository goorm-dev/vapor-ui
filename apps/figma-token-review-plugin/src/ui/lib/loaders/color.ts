import primitiveDark from '~/common/tokens/primitive-color.dark.json';
import primitiveLight from '~/common/tokens/primitive-color.light.json';
import semanticDark from '~/common/tokens/semantic-color.dark.json';
import semanticLight from '~/common/tokens/semantic-color.light.json';
import type { Role, SchemaMode } from '~/common/schemas';

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
    $value?: string;
    $extensions?: { [key: string]: Record<string, unknown> };
    [k: string]: unknown;
};

function vaporMeta(node: Node): Record<string, unknown> {
    return (node?.$extensions?.[NS] ?? {}) as Record<string, unknown>;
}

function flattenPrimitive(root: { colors?: Node }): Record<string, string> {
    const out: Record<string, string> = {};
    const walk = (node: Node, path: string) => {
        if (!node || typeof node !== 'object') return;
        if ('$value' in node && typeof node.$value === 'string') {
            out[path] = node.$value;
            return;
        }
        for (const [k, v] of Object.entries(node)) {
            if (k.startsWith('$')) continue;
            walk(v as Node, path ? `${path}.${k}` : k);
        }
    };
    if (root.colors) walk(root.colors, 'colors');
    return out;
}

function resolveAlias(valueRef: string | null, primitive: Record<string, string>): string | null {
    if (!valueRef) return null;
    const m = valueRef.match(/^\{(.+)\}$/);
    if (!m) return /^#[0-9a-f]{3,8}$/i.test(valueRef) ? valueRef : null;
    return primitive[m[1]] ?? null;
}

function asRole(value: unknown): Role | null {
    const valid: Role[] = ['background', 'foreground', 'border', 'space', 'dimension', 'borderRadius', 'shadow'];
    return typeof value === 'string' && (valid as string[]).includes(value) ? (value as Role) : null;
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
        const gradeRules = (meta.gradeRules as Record<string, string> | undefined) ?? inheritedGradeRules;
        if ('$value' in node && typeof node.$value === 'string') {
            const grade = path.split('.').pop() ?? '';
            const valueRef = node.$value;
            const hex = resolveAlias(valueRef, primitive);
            // Store the grade key ('100'/'200') as GradeRule.other rather than the
            // description text — the type requires '100'|'200'|'ambiguous'|null and
            // downstream evaluators need the key, not prose.
            const hasGradeRule = gradeRules != null && grade in gradeRules;
            const gradeRuleOther: '100' | '200' | 'ambiguous' | null = hasGradeRule && isGradeKey(grade)
                ? grade
                : null;
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
            walk(v as Node, path ? `${path}.${k}` : k, gradeRules ?? null);
        }
    };
    if (root.colors) walk(root.colors, 'colors', null);
    return { semantic: out, tokenKeys: Object.keys(out), hexIndex };
}

export function loadColorSchema(mode: SchemaMode): ColorSchema {
    const semanticRaw = mode === 'dark' ? semanticDark : semanticLight;
    const primitiveRaw = mode === 'dark' ? primitiveDark : primitiveLight;
    const primitive = flattenPrimitive(primitiveRaw as { colors?: Node });
    const { semantic, tokenKeys, hexIndex } = flattenSemantic(semanticRaw as { colors?: Node }, primitive);
    return { mode, semantic, primitive, tokenKeys, hexIndex };
}
