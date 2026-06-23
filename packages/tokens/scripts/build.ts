import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from '@babel/parser';
import * as t from '@babel/types';

import type { ManifestShape, TokenScope } from '../src/types';

const here = dirname(fileURLToPath(import.meta.url));
const CORE_TOKENS_SRC = resolve(here, '..', '..', 'core', 'src', 'styles', 'tokens');

interface SourceEntry {
    file: string;
    exportName: string;
    scope: TokenScope;
    cssVarPrefix: string[];
}

const SOURCES: SourceEntry[] = [
    {
        file: 'color/basic-color.ts',
        exportName: 'LIGHT_BASIC_COLORS',
        scope: 'color',
        cssVarPrefix: ['color'],
    },
    {
        file: 'color/semantic-color.ts',
        exportName: 'LIGHT_SEMANTIC_COLORS',
        scope: 'color',
        cssVarPrefix: ['color'],
    },
    { file: 'shadow/shadow.ts', exportName: 'BOX_SHADOW', scope: 'shadow', cssVarPrefix: ['shadow'] },
    {
        file: 'size/border-radius.ts',
        exportName: 'BORDER_RADIUS',
        scope: 'borderRadius',
        cssVarPrefix: ['size', 'borderRadius'],
    },
    {
        file: 'size/dimension.ts',
        exportName: 'DIMENSION',
        scope: 'dimension',
        cssVarPrefix: ['size', 'dimension'],
    },
    { file: 'size/space.ts', exportName: 'SPACE', scope: 'space', cssVarPrefix: ['size', 'space'] },
    {
        file: 'typography/font-size.ts',
        exportName: 'FONT_SIZE',
        scope: 'typography',
        cssVarPrefix: ['typography', 'fontSize'],
    },
    {
        file: 'typography/line-height.ts',
        exportName: 'LINE_HEIGHT',
        scope: 'typography',
        cssVarPrefix: ['typography', 'lineHeight'],
    },
    {
        file: 'typography/font-weight.ts',
        exportName: 'FONT_WEIGHT',
        scope: 'typography',
        cssVarPrefix: ['typography', 'fontWeight'],
    },
    {
        file: 'typography/letter-spacing.ts',
        exportName: 'LETTER_SPACING',
        scope: 'typography',
        cssVarPrefix: ['typography', 'letterSpacing'],
    },
    {
        file: 'typography/font-family.ts',
        exportName: 'FONT_FAMILY',
        scope: 'typography',
        cssVarPrefix: ['typography', 'fontFamily'],
    },
];

const PROPERTY_SCOPES: Record<string, TokenScope> = {
    padding: 'space',
    paddingTop: 'space',
    paddingBottom: 'space',
    paddingLeft: 'space',
    paddingRight: 'space',
    paddingX: 'space',
    paddingY: 'space',
    margin: 'space',
    marginTop: 'space',
    marginBottom: 'space',
    marginLeft: 'space',
    marginRight: 'space',
    marginX: 'space',
    marginY: 'space',
    gap: 'space',
    rowGap: 'space',
    columnGap: 'space',
    width: 'dimension',
    height: 'dimension',
    minWidth: 'dimension',
    minHeight: 'dimension',
    maxWidth: 'dimension',
    maxHeight: 'dimension',
    color: 'color',
    backgroundColor: 'color',
    borderColor: 'color',
    borderRadius: 'borderRadius',
    boxShadow: 'shadow',
};

function loadAst(file: string): t.File {
    const src = readFileSync(resolve(CORE_TOKENS_SRC, file), 'utf-8');
    return parse(src, { sourceType: 'module', plugins: ['typescript'] });
}

function resolveSpreadSource(
    name: string,
    fileSources: Map<string, t.File>,
): t.ObjectExpression | null {
    for (const ast of fileSources.values()) {
        for (const node of ast.program.body) {
            if (!t.isExportNamedDeclaration(node) || !node.declaration) continue;
            const decl = node.declaration;
            if (!t.isVariableDeclaration(decl)) continue;
            for (const d of decl.declarations) {
                if (
                    t.isIdentifier(d.id) &&
                    d.id.name === name &&
                    d.init &&
                    t.isObjectExpression(d.init)
                ) {
                    return d.init;
                }
            }
        }
    }
    return null;
}

function walkObject(
    obj: t.ObjectExpression,
    path: string[],
    out: Array<{ leafPath: string[] }>,
    fileSources: Map<string, t.File>,
): void {
    for (const prop of obj.properties) {
        if (t.isSpreadElement(prop)) {
            if (t.isIdentifier(prop.argument)) {
                const inlined = resolveSpreadSource(prop.argument.name, fileSources);
                if (inlined) walkObject(inlined, path, out, fileSources);
            }
            continue;
        }
        if (!t.isObjectProperty(prop)) continue;
        if (prop.computed) continue;
        const key = t.isIdentifier(prop.key)
            ? prop.key.name
            : t.isStringLiteral(prop.key)
              ? prop.key.value
              : null;
        if (!key) continue;
        const next = [...path, key];
        if (t.isObjectExpression(prop.value)) {
            walkObject(prop.value, next, out, fileSources);
        } else {
            out.push({ leafPath: next });
        }
    }
}

function findRootExport(ast: t.File, name: string): t.ObjectExpression | null {
    for (const node of ast.program.body) {
        if (!t.isExportNamedDeclaration(node) || !node.declaration) continue;
        if (!t.isVariableDeclaration(node.declaration)) continue;
        for (const d of node.declaration.declarations) {
            if (
                t.isIdentifier(d.id) &&
                d.id.name === name &&
                d.init &&
                t.isObjectExpression(d.init)
            ) {
                return d.init;
            }
        }
    }
    return null;
}

function buildBucket(entry: SourceEntry, fileSources: Map<string, t.File>): Record<string, string> {
    const ast = fileSources.get(entry.file)!;
    const root = findRootExport(ast, entry.exportName);
    if (!root) {
        throw new Error(`Cannot find export "${entry.exportName}" in ${entry.file}`);
    }
    const leaves: Array<{ leafPath: string[] }> = [];
    walkObject(root, [], leaves, fileSources);
    const bucket: Record<string, string> = {};
    for (const { leafPath } of leaves) {
        const key = leafPath.join('-');
        const cssVar = `--vapor-${[...entry.cssVarPrefix, ...leafPath].join('-')}`;
        bucket[key] = cssVar;
    }
    return bucket;
}

const fileSources = new Map<string, t.File>();
for (const src of SOURCES) fileSources.set(src.file, loadAst(src.file));

const manifest: ManifestShape = {
    version: '1',
    tokens: {
        color: {},
        space: {},
        dimension: {},
        borderRadius: {},
        shadow: {},
        typography: {},
    },
    propertyScopes: PROPERTY_SCOPES,
};

for (const entry of SOURCES) {
    const bucket = buildBucket(entry, fileSources);
    Object.assign(manifest.tokens[entry.scope], bucket);
}

const mode = process.argv.includes('--src-only')
    ? 'src'
    : process.argv.includes('--dist-only')
      ? 'dist'
      : 'both';

function emitTokenUnion(scope: TokenScope): string {
    const keys = Object.keys(manifest.tokens[scope]).sort();
    if (!keys.length) return 'never';
    return keys.map((k) => `'$${k}'`).join(' | ');
}

if (mode === 'src' || mode === 'both') {
    const srcDir = resolve(here, '..', 'src');
    const manifestPath = resolve(srcDir, 'manifest.generated.ts');
    const manifestContent = `// AUTO-GENERATED by scripts/build.ts. Do not edit.

import type { ManifestShape } from './types';

export const manifest: ManifestShape = ${JSON.stringify(manifest, null, 4)};
`;
    writeFileSync(manifestPath, manifestContent, 'utf-8');
    // eslint-disable-next-line no-console
    console.log('src/manifest.generated.ts written');

    const tokensPath = resolve(srcDir, '$style.tokens.generated.ts');
    const tokensContent = `// AUTO-GENERATED by scripts/build.ts. Do not edit.

export type ColorToken = ${emitTokenUnion('color')};
export type SpaceToken = ${emitTokenUnion('space')};
export type DimensionToken = ${emitTokenUnion('dimension')};
export type BorderRadiusToken = ${emitTokenUnion('borderRadius')};
export type ShadowToken = ${emitTokenUnion('shadow')};
export type TypographyToken = ${emitTokenUnion('typography')};
`;
    writeFileSync(tokensPath, tokensContent, 'utf-8');
    // eslint-disable-next-line no-console
    console.log('src/$style.tokens.generated.ts written');
}

if (mode === 'dist' || mode === 'both') {
    const outDir = resolve(here, '..', 'dist');
    mkdirSync(outDir, { recursive: true });
    const outPath = resolve(outDir, 'manifest.json');
    writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');

    const counts = (Object.keys(manifest.tokens) as TokenScope[])
        .map((s) => `${s}=${Object.keys(manifest.tokens[s]).length}`)
        .join(', ');
    // eslint-disable-next-line no-console
    console.log(`dist/manifest.json written: ${counts}`);
}
