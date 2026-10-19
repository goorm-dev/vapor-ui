/**
 * remark plugin that resolves Demo content at MDX build time.
 *
 * Two shapes are handled, both bypassing `fumadocs-docgen`'s `fileGenerator` because the
 * Turbopack loader doesn't populate `vfile.cwd`, which the stock generator relies on:
 *
 *   1. `<Demo file="…" />` self-closing — synthesise a code block whose body is the
 *      resolved example file. The Code tab renders this directly.
 *   2. Any `code` node with `lang: "json"` + `meta: "doc-gen:file"` inside the subtree —
 *      replace it with the resolved file contents. Mirrors `fileGenerator` so multi-source
 *      Demos (nav-bar, form patterns) keep working with authored blocks.
 *
 * File paths are absolute from `apps/website/` (e.g.
 * `/content/docs/components/(components)/button/default-button.tsx`), consistent with the
 * SSOT `file` prop contract.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { normalizeFile } from '~/components/demo/paths';

interface Node {
    type: string;
    children?: Node[];
    [key: string]: unknown;
}

type MdxJsxAttribute = {
    type: 'mdxJsxAttribute';
    name: string;
    value: string | null | { type: string; value?: string };
};

type MdxJsxExpressionAttribute = {
    type: 'mdxJsxExpressionAttribute';
    value: string;
};

type MdxJsxFlowElement = {
    type: 'mdxJsxFlowElement' | 'mdxJsxTextElement';
    name: string | null;
    attributes: Array<MdxJsxAttribute | MdxJsxExpressionAttribute>;
    children: Node[];
};

type CodeNode = {
    type: 'code';
    lang: string | null;
    meta: string | null;
    value: string;
};

const DEMO_TAG = 'Demo';
const DOC_GEN_META = /^doc-gen:file\b/;

const readStringAttr = (attrs: MdxJsxFlowElement['attributes'], name: string): string | null => {
    for (const attr of attrs) {
        if (attr.type !== 'mdxJsxAttribute' || attr.name !== name) continue;
        if (typeof attr.value === 'string') return attr.value;
    }
    return null;
};

const isDemoElement = (node: Node): node is MdxJsxFlowElement =>
    (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') &&
    (node as MdxJsxFlowElement).name === DEMO_TAG;

const isDocGenCodeBlock = (node: Node): node is CodeNode => {
    if (node.type !== 'code') return false;
    const code = node as CodeNode;
    return code.lang === 'json' && typeof code.meta === 'string' && DOC_GEN_META.test(code.meta);
};

const resolveAbsolute = (file: string, cwd: string): string =>
    path.resolve(cwd, normalizeFile(file));

const buildCodeBlockFromFile = (file: string, cwd: string): CodeNode | null => {
    const abs = resolveAbsolute(file, cwd);
    try {
        const raw = fs.readFileSync(abs, 'utf-8').trim();
        const ext = path.extname(file).slice(1) || 'tsx';
        return { type: 'code', lang: ext, meta: null, value: raw };
    } catch {
        return null;
    }
};

const inlineDocGenBlock = (block: CodeNode, cwd: string): CodeNode => {
    try {
        const config = JSON.parse(block.value) as { file?: string };
        if (typeof config.file === 'string') {
            const inlined = buildCodeBlockFromFile(config.file, cwd);
            if (inlined) return inlined;
        }
    } catch {
        /* fall through — keep original block */
    }
    return block;
};

export function remarkDemoSource() {
    return (tree: Node, file?: { cwd?: string }) => {
        const cwd = file?.cwd ?? process.cwd();
        const visit = (node: Node): void => {
            if (Array.isArray(node.children)) {
                node.children = node.children.map((child) =>
                    isDocGenCodeBlock(child) ? inlineDocGenBlock(child, cwd) : child,
                );
            }
            if (isDemoElement(node)) {
                const fileAttr = readStringAttr(node.attributes, 'file');
                if (fileAttr && node.children.length === 0) {
                    const inlined = buildCodeBlockFromFile(fileAttr, cwd);
                    if (inlined) node.children.push(inlined);
                }
            }
            for (const child of node.children ?? []) visit(child);
        };
        visit(tree);
    };
}
