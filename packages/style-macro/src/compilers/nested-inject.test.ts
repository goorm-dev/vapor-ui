import { describe, expect, it } from 'vitest';

import { type Props, byKey, run } from './_run-transformed';

/** element 의 style slot 값들 (`--` 로 시작하는 key). */
const slots = (p: Props | undefined) =>
    Object.entries((p?.style as Record<string, string>) ?? {})
        .filter(([k]) => k.startsWith('--'))
        .map(([, v]) => v);

describe('an element nested inside another element’s rewritten attributes keeps its own slots', () => {
    it('render prop inside the spread region (outer becomes _withStyle)', async () => {
        const { exports, rendered } = await run(
            `export const C = ({ v, u, p, q }) => <div {...p} data-k="outer" className={css({ height: v })} render={<span data-k="inner" className={css({ width: u })} />} {...q} />;`,
        );
        (exports.C as (p: Props) => void)({ v: '13px', u: '17px', p: { title: 't' }, q: {} });
        expect(slots(byKey(rendered, 'outer'))).toEqual(['13px']);
        expect(slots(byKey(rendered, 'inner'))).toEqual(['17px']);
        expect(byKey(rendered, 'outer')?.title).toBe('t');
    });

    it('element inside the style value (outer becomes _mergeStyle)', async () => {
        const { exports, rendered } = await run(
            `export const C = ({ v, u }) => <div data-k="outer" className={css({ height: v })} style={{ x: <span data-k="inner" className={css({ width: u })} /> }} />;`,
        );
        (exports.C as (p: Props) => void)({ v: '13px', u: '17px' });
        expect(slots(byKey(rendered, 'outer'))).toEqual(['13px']);
        expect(slots(byKey(rendered, 'inner'))).toEqual(['17px']);
    });

    it('three levels deep', async () => {
        const { exports, rendered } = await run(
            `export const C = ({ a, b, c, p }) => <i {...p} data-k="1" className={css({ width: a })} x={<i {...p} data-k="2" className={css({ width: b })} y={<i data-k="3" style={{ z: 1 }} className={css({ width: c })} />} />} />;`,
        );
        (exports.C as (p: Props) => void)({ a: '1px', b: '2px', c: '3px', p: {} });
        expect(['1', '2', '3'].map((k) => slots(byKey(rendered, k)))).toEqual([
            ['1px'],
            ['2px'],
            ['3px'],
        ]);
        expect(byKey(rendered, '3')?.style).toMatchObject({ z: 1 });
    });
});
