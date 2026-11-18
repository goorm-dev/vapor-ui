import { describe, expect, it } from 'vitest';

import { reachesOwnSubtree } from '~/models/selector';

import { transform } from './transform';

const slotNames = (code: string) => [...new Set(code.match(/--vapor-_\w+/g) ?? [])];
const run = (body: string, filename = '/A.tsx') =>
    transform({ source: `import { css } from '@vapor-ui/style-macro';\n${body}`, filename });

describe('slot variable names are unique per declaration, like Vanilla Extract createVar', () => {
    it('two components with the same descendant rule text do not share a slot', () => {
        const a = run(
            `export const A = ({ c }) => <div className={css({ '& span': { color: c } })} />;`,
            '/A.tsx',
        );
        const b = run(
            `export const B = ({ c }) => <div className={css({ '& span': { color: c } })} />;`,
            '/B.tsx',
        );
        expect(slotNames(a.code)).toHaveLength(1);
        expect(slotNames(a.code)).not.toEqual(slotNames(b.code));
    });

    it('two declarations in one file do not share a slot', () => {
        const out = run(
            `export const A = ({ c }) => <div className={css({ '& span': { color: c } })} />;\nexport const B = ({ c }) => <div className={css({ '& span': { color: c } })} />;`,
        );
        expect(slotNames(out.code)).toHaveLength(2);
    });

    it('one declaration keeps one slot wherever it is merged', () => {
        const out = run(
            `const base = { width: w };\nexport const A = () => <div className={css(base)} />;\nexport const B = () => <div className={css(base, { color: 'red' })} />;`,
        );
        expect(slotNames(out.code)).toHaveLength(1);
    });

    it('is deterministic', () => {
        const src = `export const A = ({ c }) => <div className={css({ color: c })} />;`;
        expect(run(src).code).toBe(run(src).code);
    });
});

describe('reachesOwnSubtree — a slot set on the element is inherited only by itself and descendants', () => {
    it.each([
        '&',
        '&:hover',
        '&::before',
        '& span',
        '& > span',
        '[data-x] &',
        '.a + &',
        '&:has(+ span)',
        '&:is(.a, .b) span',
        '& span, &:hover',
    ])('reachable: %s', (sel) => expect(reachesOwnSubtree(sel)).toBe(true));

    it.each(['& + span', '& ~ span', '& > a + b', '&:hover, & + span', '& span ~ i'])(
        'unreachable: %s',
        (sel) => expect(reachesOwnSubtree(sel)).toBe(false),
    );
});

describe('dynamic value under a sibling selector', () => {
    it('compiles, and logs a console error once when the module loads', () => {
        const out = run(
            `export const A = ({ c }) => <div className={css({ '& + span': { color: c } })} />;`,
        );
        expect(out.errors).toEqual([]);
        expect(out.code.match(/console\.error\(/g) ?? []).toHaveLength(1);
        expect(out.code).toMatch(/console\.error\([^\n]*A\.tsx:2[^\n]*& \+ span/);
    });

    it('no console error in a hashed (production) build', () => {
        const out = transform({
            source: `import { css } from '@vapor-ui/style-macro';\nexport const A = ({ c }) => <div className={css({ '& + span': { color: c } })} />;`,
            filename: '/A.tsx',
            hash: true,
        });
        expect(out.code).not.toContain('console.error');
    });

    it('no console error for descendant selectors', () => {
        const out = run(
            `export const A = ({ c }) => <div className={css({ '& span': { color: c } })} />;`,
        );
        expect(out.code).not.toContain('console.error');
    });
});
