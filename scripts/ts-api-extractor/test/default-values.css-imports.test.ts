/**
 * Style import parser unit tests
 */
import { findCssImports } from '#infrastructure/ts-morph/default-values';
import { Project } from 'ts-morph';

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
