/**
 * remark plugin that resolves Demo content at MDX build time.
 *
 * `<Demo file="…" />` self-closing — synthesise a code block whose body is the resolved demo
 * file. The Code tab renders this directly.
 *
 * `file` is resolved from `content/docs` (e.g.
 * `components/(components)/button/demos/default-button.tsx`).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';

import { CONTENT_PATH } from '~/constants/demo';

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

const buildCodeBlockFromFile = (abs: string): CodeNode | null => {
    try {
        const raw = fs.readFileSync(abs, 'utf-8').trim();
        const ext = path.extname(abs).slice(1) || 'tsx';
        return { type: 'code', lang: ext, meta: null, value: raw };
    } catch {
        return null;
    }
};

export function remarkDemoSource() {
    return (tree: Node, file?: { cwd?: string }) => {
        const cwd = file?.cwd ?? process.cwd();
        const visit = (node: Node): void => {
            if (isDemoElement(node)) {
                const fileAttr = readStringAttr(node.attributes, 'file');
                if (fileAttr && node.children.length === 0) {
                    const inlined = buildCodeBlockFromFile(
                        path.resolve(cwd, CONTENT_PATH, fileAttr),
                    );
                    if (inlined) node.children.push(inlined);
                }
            }
            for (const child of node.children ?? []) visit(child);
        };
        visit(tree);
    };
}
