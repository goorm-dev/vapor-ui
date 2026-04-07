/**
 * Prop filter unit tests
 */
import type { FilterConfig } from '~/models/config';
import type { ParsedComponent, PropSource } from '~/models/pipeline';
import { filterParsedComponents, shouldIncludeProp } from '~/stages/filter';

const BASE_OPTIONS: FilterConfig = {
    filterExternal: false,
    filterHtml: false,
    filterSprinkles: false,
};

describe('shouldIncludeProp', () => {
    describe('includeSet priority', () => {
        it('always includes props present in includeSet', () => {
            const result = shouldIncludeProp(
                'className',
                'react' as PropSource,
                { ...BASE_OPTIONS, filterExternal: true },
                new Set(['className']),
                new Set(),
            );
            expect(result).toBe(true);
        });
    });

    describe('includeHtml whitelist', () => {
        it('includes whitelisted html-like props even when filterHtml is on', () => {
            const result = shouldIncludeProp(
                'ariaLabel',
                'project' as PropSource,
                { ...BASE_OPTIONS, filterHtml: true, includeHtml: ['ariaLabel'] },
                new Set(),
                new Set(['ariaLabel']),
            );
            expect(result).toBe(true);
        });
    });

    describe('external declaration filtering', () => {
        it('excludes props declared in node_modules/@types/react when filterExternal is on', () => {
            const result = shouldIncludeProp(
                'onClick',
                'react' as PropSource,
                { ...BASE_OPTIONS, filterExternal: true },
                new Set(),
                new Set(),
            );
            expect(result).toBe(false);
        });

        it('keeps props declared in node_modules/@types/react when filterExternal is off', () => {
            const result = shouldIncludeProp(
                'onClick',
                'react' as PropSource,
                { ...BASE_OPTIONS, filterExternal: false },
                new Set(),
                new Set(),
            );
            expect(result).toBe(true);
        });

        it('keeps project-level props when filterExternal is on', () => {
            const result = shouldIncludeProp(
                'size',
                'project' as PropSource,
                { ...BASE_OPTIONS, filterExternal: true },
                new Set(),
                new Set(),
            );
            expect(result).toBe(true);
        });
    });

    describe('HTML attribute filtering', () => {
        it('excludes data-* props when filterHtml is on', () => {
            const result = shouldIncludeProp(
                'data-testid',
                'project' as PropSource,
                { ...BASE_OPTIONS, filterHtml: true },
                new Set(),
                new Set(),
            );
            expect(result).toBe(false);
        });

        it('excludes aria-* props when filterHtml is on', () => {
            const result = shouldIncludeProp(
                'aria-hidden',
                'project' as PropSource,
                { ...BASE_OPTIONS, filterHtml: true },
                new Set(),
                new Set(),
            );
            expect(result).toBe(false);
        });

        it('keeps data-* props when filterHtml is off', () => {
            const result = shouldIncludeProp(
                'data-testid',
                'project' as PropSource,
                { ...BASE_OPTIONS, filterHtml: false },
                new Set(),
                new Set(),
            );
            expect(result).toBe(true);
        });
    });

    describe('sprinkles filtering', () => {
        it('excludes props declared in sprinkles.css.ts when filterSprinkles is on', () => {
            const result = shouldIncludeProp(
                'color',
                'sprinkles' as PropSource,
                { ...BASE_OPTIONS, filterSprinkles: true },
                new Set(),
                new Set(),
            );
            expect(result).toBe(false);
        });

        it('excludes deprecated css props when filterSprinkles is on', () => {
            const result = shouldIncludeProp(
                '$css',
                'project' as PropSource,
                { ...BASE_OPTIONS, filterSprinkles: true },
                new Set(),
                new Set(),
            );
            expect(result).toBe(false);
        });

        it('keeps sprinkles-path props when filterSprinkles is off', () => {
            const result = shouldIncludeProp(
                'color',
                'sprinkles' as PropSource,
                { ...BASE_OPTIONS, filterSprinkles: false },
                new Set(),
                new Set(),
            );
            expect(result).toBe(true);
        });
    });

    describe('regular props', () => {
        it('includes regular project-level props', () => {
            const result = shouldIncludeProp(
                'disabled',
                'project' as PropSource,
                BASE_OPTIONS,
                new Set(),
                new Set(),
            );
            expect(result).toBe(true);
        });

        it('includes props with undefined declarationFilePath', () => {
            const result = shouldIncludeProp(
                'size',
                'project' as PropSource,
                BASE_OPTIONS,
                new Set(),
                new Set(),
            );
            expect(result).toBe(true);
        });
    });
});

describe('filterParsedComponents', () => {
    const makeComponent = (name: string, props: ParsedComponent['props']): ParsedComponent => ({
        name,
        props,
    });

    it('filters out external props when filterExternal is on', () => {
        const components: ParsedComponent[] = [
            makeComponent('Button', [
                {
                    name: 'size',
                    typeString: 'string',
                    isOptional: true,
                    source: 'project',
                },
                {
                    name: 'onClick',
                    typeString: '() => void',
                    isOptional: true,
                    source: 'react',
                },
            ]),
        ];

        const result = filterParsedComponents(components, {
            ...BASE_OPTIONS,
            filterExternal: true,
        });

        expect(result[0].props).toHaveLength(1);
        expect(result[0].props[0].name).toBe('size');
    });

    it('keeps all props when all filters are off', () => {
        const components: ParsedComponent[] = [
            makeComponent('Button', [
                {
                    name: 'size',
                    typeString: 'string',
                    isOptional: true,
                    source: 'project',
                },
                {
                    name: 'aria-label',
                    typeString: 'string',
                    isOptional: true,
                    source: 'project',
                },
                {
                    name: 'padding',
                    typeString: 'string',
                    isOptional: true,
                    source: 'sprinkles',
                },
            ]),
        ];

        const result = filterParsedComponents(components, BASE_OPTIONS);

        expect(result[0].props).toHaveLength(3);
    });

    it('preserves component name and description', () => {
        const components: ParsedComponent[] = [
            {
                name: 'Button',
                description: 'A button component',
                props: [],
            },
        ];

        const result = filterParsedComponents(components, BASE_OPTIONS);

        expect(result[0].name).toBe('Button');
        expect(result[0].description).toBe('A button component');
    });
});
