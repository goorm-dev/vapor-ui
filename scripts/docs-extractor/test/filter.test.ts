/**
 * Prop filter unit tests
 */
import { Project } from 'ts-morph';

import { shouldIncludeSymbol } from '~/core/parser/props/filter';
import type { ExtractOptions } from '~/core/parser/types';

function mockSymbol(name: string) {
    return {
        getName: () => name,
    } as Parameters<typeof shouldIncludeSymbol>[0];
}

describe('shouldIncludeSymbol', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    describe('includeSet priority', () => {
        it('always includes props present in includeSet', () => {
            const source = project.createSourceFile(
                'test.ts',
                `interface Props { className?: string; }`,
            );
            const prop = source.getInterfaceOrThrow('Props').getPropertyOrThrow('className');
            const symbol = prop.getSymbol()!;

            const result = shouldIncludeSymbol(
                symbol,
                { filterExternal: true },
                new Set(['className']),
            );

            expect(result).toBe(true);
        });
    });

    describe('includeHtmlWhitelist', () => {
        it('includes whitelisted html-like props', () => {
            const source = project.createSourceFile(
                'test.ts',
                `interface Props { ariaLabel?: string; }`,
            );
            const prop = source.getInterfaceOrThrow('Props').getPropertyOrThrow('ariaLabel');
            const symbol = prop.getSymbol()!;

            const options: ExtractOptions = {
                filterHtml: true,
                includeHtmlWhitelist: new Set(['ariaLabel']),
            };

            const result = shouldIncludeSymbol(symbol, options, new Set());

            expect(result).toBe(true);
        });
    });

    describe('HTML attribute filtering', () => {
        it('excludes data-* props when html filtering is enabled', () => {
            const symbol = mockSymbol('data-testid');

            const result = shouldIncludeSymbol(
                symbol,
                { filterHtml: true, filterExternal: false, filterSprinkles: false },
                new Set(),
            );

            expect(result).toBe(false);
        });

        it('excludes aria-* props when html filtering is enabled', () => {
            const symbol = mockSymbol('aria-hidden');

            const result = shouldIncludeSymbol(
                symbol,
                { filterHtml: true, filterExternal: false, filterSprinkles: false },
                new Set(),
            );

            expect(result).toBe(false);
        });

        it('keeps data-* props when html filtering is disabled', () => {
            const symbol = mockSymbol('data-testid');

            const result = shouldIncludeSymbol(
                symbol,
                { filterHtml: false, filterExternal: false, filterSprinkles: false },
                new Set(),
            );

            expect(result).toBe(true);
        });
    });

    describe('regular props', () => {
        it('includes regular props by default', () => {
            const source = project.createSourceFile(
                'test.ts',
                `interface Props { disabled?: boolean; }`,
            );
            const prop = source.getInterfaceOrThrow('Props').getPropertyOrThrow('disabled');
            const symbol = prop.getSymbol()!;

            const result = shouldIncludeSymbol(symbol, {}, new Set());

            expect(result).toBe(true);
        });
    });

    describe('combined options', () => {
        it('works with multiple filter options enabled', () => {
            const source = project.createSourceFile(
                'test.ts',
                `interface Props {
                    size?: string;
                    onClick?: () => void;
                }`,
            );
            const sizeProp = source.getInterfaceOrThrow('Props').getPropertyOrThrow('size');
            const symbol = sizeProp.getSymbol()!;

            const options: ExtractOptions = {
                filterExternal: true,
                filterHtml: true,
                filterSprinkles: true,
            };

            const result = shouldIncludeSymbol(symbol, options, new Set());

            expect(result).toBe(true);
        });
    });
});
