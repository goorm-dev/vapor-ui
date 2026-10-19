/**
 * remark plugin: `<Demo file="./button/default-button.tsx" />` → inject a `doc-gen:file`
 * code block as the Demo's children so the Code tab renders the same file the Preview tab
 * loads. Runs before `fumadocs-docgen` so the generated block gets inlined with real file
 * contents at MDX build time.
 *
 * Zero external deps: walks the mdast tree with a plain recursion to keep the website
 * package graph lean.
 */
import { fileToDocGenPath } from '~/components/demo/paths';

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
    type: 'mdxJsxFlowElement';
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

interface Node {
    type: string;
    children?: Node[];
}

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

export const buildDocGenBlock = (file: string): CodeNode => ({
    type: 'code',
    lang: 'json',
    meta: 'doc-gen:file',
    value: JSON.stringify({ file: fileToDocGenPath(file), codeblock: true }, null, 4),
});

export function remarkDemoSource() {
    const visit = (node: Node): void => {
        if (isDemoElement(node)) {
            const file = readStringAttr(node.attributes, 'file');
            // Author already supplied their own code block → leave it alone.
            if (file && node.children.length === 0) {
                node.children.push(buildDocGenBlock(file));
            }
        }
        for (const child of node.children ?? []) visit(child);
    };
    return (tree: Node) => {
        visit(tree);
    };
}
