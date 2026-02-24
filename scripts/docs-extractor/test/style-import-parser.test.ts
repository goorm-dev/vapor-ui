/**
 * Style import parser unit tests
 */
import { Project } from 'ts-morph';

import { findCssImports, findVariantsTypeImports } from '~/core/parser/defaults/style-import-parser';

describe('findCssImports', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('.css import 찾기', () => {
        const source = project.createSourceFile(
            '/components/button/button.tsx',
            `
            import * as styles from './button.css';
            import { something } from './utils';
            `,
        );

        const result = findCssImports(source);

        expect(result).toHaveLength(1);
        expect(result[0].modulePath).toBe('./button.css');
        expect(result[0].resolvedPath).toContain('button.css.ts');
    });

    it('여러 .css import', () => {
        const source = project.createSourceFile(
            '/components/card/card.tsx',
            `
            import * as styles from './card.css';
            import * as shared from '../shared.css';
            `,
        );

        const result = findCssImports(source);

        expect(result).toHaveLength(2);
    });

    it('.css import 없으면 빈 배열', () => {
        const source = project.createSourceFile(
            '/components/simple/simple.tsx',
            `
            import { useState } from 'react';
            `,
        );

        const result = findCssImports(source);

        expect(result).toEqual([]);
    });
});

describe('findVariantsTypeImports', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('.css 파일이 아닌 import는 무시', () => {
        const source = project.createSourceFile(
            '/components/button/button.tsx',
            `
            import { ButtonVariants } from './types';
            `,
        );

        const result = findVariantsTypeImports(source);

        expect(result).toEqual([]);
    });

    it('.css import의 named import 검사', () => {
        const source = project.createSourceFile(
            '/components/button/button.tsx',
            `
            import { buttonRecipe } from './button.css';
            `,
        );

        const result = findVariantsTypeImports(source);

        // RecipeVariants 타입이 아니므로 빈 배열
        expect(result).toEqual([]);
    });

    it('빈 파일', () => {
        const source = project.createSourceFile(
            '/components/empty/empty.tsx',
            ``,
        );

        const result = findVariantsTypeImports(source);

        expect(result).toEqual([]);
    });
});
