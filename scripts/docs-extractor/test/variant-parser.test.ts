/**
 * Variant parser unit tests
 */
import { Project } from 'ts-morph';

import {
    findRecipeUsageInComponent,
    getRecipeNameFromVariantsType,
    parseRecipeDefaultVariants,
} from '~/core/parser/defaults/variant-parser';

describe('getRecipeNameFromVariantsType', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('Variants type에서 recipe 변수명 추출', () => {
        const cssFile = project.createSourceFile(
            'button.css.ts',
            `
            const buttonRecipe = recipe({});
            export type ButtonVariants = typeof buttonRecipe;
            `,
        );

        const result = getRecipeNameFromVariantsType(cssFile, 'ButtonVariants');

        expect(result).toBe('buttonRecipe');
    });

    it('type alias 없으면 null', () => {
        const cssFile = project.createSourceFile(
            'button.css.ts',
            `
            const buttonRecipe = recipe({});
            `,
        );

        const result = getRecipeNameFromVariantsType(cssFile, 'NonExistentType');

        expect(result).toBeNull();
    });

    it('TypeQuery 없으면 null', () => {
        const cssFile = project.createSourceFile(
            'button.css.ts',
            `
            export type ButtonVariants = { size: 'sm' | 'md' };
            `,
        );

        const result = getRecipeNameFromVariantsType(cssFile, 'ButtonVariants');

        expect(result).toBeNull();
    });
});

describe('findRecipeUsageInComponent', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('컴포넌트에서 사용된 recipe 찾기', () => {
        const source = project.createSourceFile(
            'button.tsx',
            `
            import * as styles from './button.css';

            const Button = (props: Props) => {
                const className = styles.buttonRecipe({ size: props.size });
                return null;
            };
            `,
        );

        const result = findRecipeUsageInComponent(source, 'Button', 'styles');

        expect(result).toBe('buttonRecipe');
    });

    it('컴포넌트 없으면 null', () => {
        const source = project.createSourceFile(
            'button.tsx',
            `
            const Other = () => null;
            `,
        );

        const result = findRecipeUsageInComponent(source, 'Button', 'styles');

        expect(result).toBeNull();
    });

    it('다른 style name은 무시', () => {
        const source = project.createSourceFile(
            'button.tsx',
            `
            import * as otherStyles from './other.css';

            const Button = (props: Props) => {
                const className = otherStyles.buttonRecipe({ size: props.size });
                return null;
            };
            `,
        );

        const result = findRecipeUsageInComponent(source, 'Button', 'styles');

        expect(result).toBeNull();
    });
});

describe('parseRecipeDefaultVariants', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('recipe에서 defaultVariants 추출', () => {
        const cssFile = project.createSourceFile(
            'button.css.ts',
            `
            const buttonRecipe = recipe({
                variants: {
                    size: { sm: {}, md: {}, lg: {} },
                    variant: { primary: {}, secondary: {} },
                },
                defaultVariants: {
                    size: 'md',
                    variant: 'primary',
                },
            });
            `,
        );

        const result = parseRecipeDefaultVariants(cssFile, 'buttonRecipe');

        expect(result).toEqual({
            size: 'md',
            variant: 'primary',
        });
    });

    it('변수 없으면 null', () => {
        const cssFile = project.createSourceFile(
            'button.css.ts',
            `
            const otherRecipe = recipe({});
            `,
        );

        const result = parseRecipeDefaultVariants(cssFile, 'buttonRecipe');

        expect(result).toBeNull();
    });

    it('recipe 호출이 아니면 null', () => {
        const cssFile = project.createSourceFile(
            'button.css.ts',
            `
            const buttonRecipe = style({});
            `,
        );

        const result = parseRecipeDefaultVariants(cssFile, 'buttonRecipe');

        expect(result).toBeNull();
    });

    it('defaultVariants 없으면 null', () => {
        const cssFile = project.createSourceFile(
            'button.css.ts',
            `
            const buttonRecipe = recipe({
                variants: {
                    size: { sm: {}, md: {} },
                },
            });
            `,
        );

        const result = parseRecipeDefaultVariants(cssFile, 'buttonRecipe');

        expect(result).toBeNull();
    });

    it('따옴표 제거', () => {
        const cssFile = project.createSourceFile(
            'button.css.ts',
            `
            const buttonRecipe = recipe({
                defaultVariants: {
                    size: "large",
                    mode: 'dark',
                },
            });
            `,
        );

        const result = parseRecipeDefaultVariants(cssFile, 'buttonRecipe');

        expect(result).toEqual({
            size: 'large',
            mode: 'dark',
        });
    });
});
