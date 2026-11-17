// What a blueprint is to the outside: the object `--json` prints and the JS API returns, and the text printed without
// --json. The plugin's check-components and visual-score skills and the private bench read it, so changing or removing a
// field bumps version (RFC-0002 "출력과 종료 코드").
import type { Pkg } from '~/packages';

import type { Box, TextLine } from './design';

export type { Box, TextLine };

// id: the Figma instance whose template wrote the node; the second and later elements one template writes are
// "<id>#1", "<id>#2"... in snippet order.
// pkg: the package whose template wrote the node, so a composites Dialog.Root is not met by core's.
// anyParent: Figma's nesting is not the code's here (inside a self-closing part), so the node sits under its owner's
// root for reading and its position must not be judged.
// box: the instance's, shared by every element its template writes.
export interface BlueprintNode {
    id: string;
    tag: string;
    props: string[];
    pkg: Pkg;
    anyParent?: true;
    children: BlueprintNode[];
    box?: Box;
}

// A library instance the design draws that is not a node, and why. One inside an excluded instance shares its reason;
// one inside an unscorable instance is inside-unscorable.
// box: the code still draws it, so visual scoring still measures it.
export interface Excluded {
    node: string;
    name: string;
    reason:
        'part-draws-icon' | 'part-draws-itself' | 'inside-self-closing-part' | 'inside-unscorable';
    box?: Box;
}

// A library instance that could not be read, so the design cannot be graded.
// not-installed: a composites component while composites is not installed; message says so.
export interface Unscorable {
    node: string;
    name: string;
    cause: 'no-template' | 'template-error' | 'not-installed';
    message?: string;
    box?: Box;
}

// size: the graded frame's, which boxes are relative to.
export interface Blueprint {
    version: 4;
    size?: { w: number; h: number };
    nodes: BlueprintNode[];
    excluded: Excluded[];
    unscorable: Unscorable[];
    texts: TextLine[];
}

// A node, then its children two spaces in, as the code writes them.
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
