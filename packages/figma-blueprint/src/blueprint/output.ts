import type { Pkg } from '~/packages';

import type { Box, TextLine } from './design';

export type { Box, TextLine };

export interface BlueprintNode {
    id: string;
    tag: string;
    props: string[];
    pkg: Pkg;
    anyParent?: true;
    children: BlueprintNode[];
    box?: Box;
}

export interface Excluded {
    node: string;
    name: string;
    reason:
        'part-draws-icon' | 'part-draws-itself' | 'inside-self-closing-part' | 'inside-unscorable';
    box?: Box;
}

export interface Unscorable {
    node: string;
    name: string;
    cause: 'no-template' | 'template-error' | 'not-installed';
    message?: string;
    box?: Box;
}

export interface Blueprint {
    version: 4;
    size?: { w: number; h: number };
    nodes: BlueprintNode[];
    excluded: Excluded[];
    unscorable: Unscorable[];
    texts: TextLine[];
}

export function formatText({ nodes, excluded, unscorable, texts }: Blueprint) {
    const out: string[] = [];
    const walk = (list: BlueprintNode[], depth: number) => {
        for (const n of list) {
            const jsx = `<${[n.tag, ...n.props].join(' ')} />`;
            out.push(`${'  '.repeat(depth)}${jsx}  ${n.id}${n.anyParent ? '  (any parent)' : ''}`);
            walk(n.children, depth + 1);
        }
    };
    walk(nodes, 0);
    if (excluded.length)
        out.push('excluded:', ...excluded.map((e) => `  ${e.name} (${e.node}): ${e.reason}`));
    if (unscorable.length)
        out.push(
            'unscorable:',
            ...unscorable.map(
                (u) => `  ${u.name} (${u.node}): ${u.cause}${u.message ? ` ${u.message}` : ''}`,
            ),
        );
    out.push(`texts: ${texts.length}`);
    return out.join('\n');
}
