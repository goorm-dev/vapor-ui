import { describe, expect, it } from 'vitest';

import { transform } from './transform';

/** VLQ mappings → 생성 줄별 [생성 열, 원본 줄, 원본 열] 목록 (모두 0 기준). */
function decode(mappings: string): Array<Array<[number, number, number]>> {
    const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    let srcLine = 0;
    let srcCol = 0;
    return mappings.split(';').map((line) => {
        let genCol = 0;
        return line
            .split(',')
            .filter(Boolean)
            .map((seg) => {
                const vals: number[] = [];
                let v = 0;
                let shift = 0;
                for (const ch of seg) {
                    const d = B64.indexOf(ch);
                    v += (d & 31) << shift;
                    if (d & 32) shift += 5;
                    else {
                        vals.push(v & 1 ? -(v >> 1) : v >> 1);
                        v = 0;
                        shift = 0;
                    }
                }
                genCol += vals[0]!;
                srcLine += vals[2] ?? 0;
                srcCol += vals[3] ?? 0;
                return [genCol, srcLine, srcCol] as [number, number, number];
            });
    });
}

/** 생성 코드에서 `needle` 위치가 원본의 어느 줄로 매핑되는지 (1 기준). */
function originalLineOf(code: string, map: { mappings: string }, needle: string): number {
    const at = code.indexOf(needle);
    const line = code.slice(0, at).split('\n').length - 1;
    const col = at - (code.lastIndexOf('\n', at - 1) + 1);
    const segs = decode(map.mappings)[line] ?? [];
    const seg = [...segs].reverse().find(([g]) => g <= col);
    return seg ? seg[1] + 1 : -1;
}

describe('transform source map', () => {
    const source = [
        `'use client';`,
        `import { css } from '@vapor-ui/style-macro';`,
        `const base = { width: w, height: '1px' };`,
        `export function marker() {}`,
        `export const C = ({ c }) => <div className={css(base, { color: c })} />;`,
    ].join('\n');

    it('maps generated code back to the original lines past injected imports and captures', () => {
        const out = transform({ source, filename: '/S.tsx', cssImport: './S.tsx.vapor.css' });
        expect(out.errors).toEqual([]);
        expect(out.map).toMatchObject({ version: 3, sources: ['/S.tsx'] });
        expect(out.map!.sourcesContent).toEqual([source]);
        expect(out.code.indexOf('export function marker')).toBeGreaterThan(
            source.indexOf('export function marker'),
        );
        expect(originalLineOf(out.code, out.map!, 'export function marker')).toBe(4);
        expect(originalLineOf(out.code, out.map!, 'export const C')).toBe(5);
    });

    it('returns no map when nothing changes', () => {
        expect(transform({ source: 'export const a = 1;', filename: '/N.tsx' }).map).toBeNull();
    });
});
