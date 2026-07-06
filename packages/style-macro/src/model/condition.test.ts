import { describe, expect, it } from 'vitest';

import { classifyCondition, hashMediaQuery } from './condition';

describe('classifyCondition', () => {
    it('classifies default', () => {
        expect(classifyCondition('default')).toEqual({ kind: 'default' });
    });
    it('classifies named BP', () => {
        expect(classifyCondition('sm')).toEqual({ kind: 'named-bp', name: 'sm' });
        expect(classifyCondition('md')).toEqual({ kind: 'named-bp', name: 'md' });
        expect(classifyCondition('lg')).toEqual({ kind: 'named-bp', name: 'lg' });
    });
    it('classifies pseudo', () => {
        expect(classifyCondition('_hover')).toEqual({ kind: 'pseudo', name: '_hover' });
        expect(classifyCondition('_focusVisible')).toEqual({
            kind: 'pseudo',
            name: '_focusVisible',
        });
    });
    it('classifies raw @media with normalized hash', () => {
        const asRawMedia = (c: ReturnType<typeof classifyCondition>) => {
            if (!('kind' in c) || c.kind !== 'raw-media')
                throw new Error(`expected raw-media, got ${JSON.stringify(c)}`);
            return c;
        };
        const a = asRawMedia(classifyCondition('@media (min-width: 2560px)'));
        const b = asRawMedia(classifyCondition('@media (min-width:2560px)'));
        const c = asRawMedia(classifyCondition('@media   (MIN-WIDTH:  2560PX)'));
        expect(a.kind).toBe('raw-media');
        expect(a.hash).toBe(b.hash);
        expect(a.hash).toBe(c.hash);
        expect(a.hash).toHaveLength(8);
    });
    it('rejects unknown keys', () => {
        expect(classifyCondition('xl')).toEqual({ error: 'unknown-condition' });
        expect(classifyCondition('_unknownPseudo')).toEqual({ error: 'unknown-condition' });
    });
});

describe('hashMediaQuery', () => {
    it('produces 8-char lowercase hex', () => {
        expect(hashMediaQuery('(min-width: 2560px)')).toMatch(/^[0-9a-f]{8}$/);
    });
    it('is normalize-stable', () => {
        expect(hashMediaQuery('(min-width: 2560px)')).toBe(hashMediaQuery('(MIN-WIDTH:  2560px)'));
    });
});
