/**
 * Prop filter unit tests
 */
import type { ParsedComponent, PropSource } from '~/models/pipeline';
import { filterParsedComponents, shouldIncludeProp } from '~/stages/filter';

describe('shouldIncludeProp', () => {
    describe('include whitelist priority', () => {
        it('includeSet에 있는 prop은 항상 포함된다', () => {
            expect(shouldIncludeProp('className', 'react' as PropSource, new Set(['className']))).toBe(true);
        });

        it('includeSet에 있는 HTML attribute도 포함된다', () => {
            expect(shouldIncludeProp('aria-label', 'project' as PropSource, new Set(['aria-label']))).toBe(true);
        });
    });

    describe('external declaration filtering (always on)', () => {
        it('react 출처 prop은 제외된다', () => {
            expect(shouldIncludeProp('onClick', 'react' as PropSource, new Set())).toBe(false);
        });

        it('dom 출처 prop은 제외된다', () => {
            expect(shouldIncludeProp('id', 'dom' as PropSource, new Set())).toBe(false);
        });

        it('external 출처 prop은 제외된다', () => {
            expect(shouldIncludeProp('someExternalProp', 'external' as PropSource, new Set())).toBe(false);
        });

        it('project 출처 prop은 포함된다', () => {
            expect(shouldIncludeProp('size', 'project' as PropSource, new Set())).toBe(true);
        });
    });

    describe('HTML attribute filtering (always on)', () => {
        it('data-* prop은 제외된다', () => {
            expect(shouldIncludeProp('data-testid', 'project' as PropSource, new Set())).toBe(false);
        });

        it('aria-* prop은 제외된다', () => {
            expect(shouldIncludeProp('aria-hidden', 'project' as PropSource, new Set())).toBe(false);
        });
    });

    describe('sprinkles filtering (always on)', () => {
        it('sprinkles 출처 prop은 제외된다', () => {
            expect(shouldIncludeProp('color', 'sprinkles' as PropSource, new Set())).toBe(false);
        });

        it('deprecated CSS prop은 제외된다', () => {
            expect(shouldIncludeProp('$css', 'project' as PropSource, new Set())).toBe(false);
        });

        it('padding은 deprecated CSS prop으로 제외된다', () => {
            expect(shouldIncludeProp('padding', 'project' as PropSource, new Set())).toBe(false);
        });
    });

    describe('regular props', () => {
        it('일반 project prop은 포함된다', () => {
            expect(shouldIncludeProp('disabled', 'project' as PropSource, new Set())).toBe(true);
        });

        it('variant prop은 포함된다', () => {
            expect(shouldIncludeProp('variant', 'project' as PropSource, new Set())).toBe(true);
        });
    });
});

describe('filterParsedComponents', () => {
    const makeComponent = (name: string, props: ParsedComponent['props']): ParsedComponent => ({
        name,
        props,
    });

    it('external prop은 제외된다', () => {
        const components: ParsedComponent[] = [
            makeComponent('Button', [
                { name: 'size', typeString: 'string', isOptional: true, source: 'project' },
                { name: 'onClick', typeString: '() => void', isOptional: true, source: 'react' },
            ]),
        ];

        const result = filterParsedComponents(components, {});

        expect(result[0].props).toHaveLength(1);
        expect(result[0].props[0].name).toBe('size');
    });

    it('include에 있는 prop은 external이어도 포함된다', () => {
        const components: ParsedComponent[] = [
            makeComponent('Button', [
                { name: 'className', typeString: 'string', isOptional: true, source: 'react' },
                { name: 'onClick', typeString: '() => void', isOptional: true, source: 'react' },
            ]),
        ];

        const result = filterParsedComponents(components, { include: ['className'] });

        expect(result[0].props).toHaveLength(1);
        expect(result[0].props[0].name).toBe('className');
    });

    it('컴포넌트 이름과 description이 보존된다', () => {
        const components: ParsedComponent[] = [
            { name: 'Button', description: 'A button component', props: [] },
        ];

        const result = filterParsedComponents(components, {});

        expect(result[0].name).toBe('Button');
        expect(result[0].description).toBe('A button component');
    });
});
