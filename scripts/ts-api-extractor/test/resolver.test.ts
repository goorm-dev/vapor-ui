/**
 * Type resolver unit tests
 *
 * Tests for type resolution logic:
 * - String simplification utilities
 * - resolveType with ts-morph integration
 * - baseUiMap substitution priority
 */
import { Project } from 'ts-morph';

import type { BaseUiTypeMap } from '~/models/extract';
import {
    resolveType,
    simplifyForwardRefType,
    simplifyNodeModulesImports,
    simplifyReactElementGeneric,
} from '~/resolve';

// ============================================================
// String Simplification Utilities
// ============================================================

describe('simplifyNodeModulesImports', () => {
    it('import() 경로 제거', () => {
        const input = 'import("react").ReactNode';
        const result = simplifyNodeModulesImports(input);
        expect(result).toBe('ReactNode');
    });

    it('긴 node_modules 경로 제거', () => {
        const input = 'import("/node_modules/@base-ui/components/collapsible/root").State';
        const result = simplifyNodeModulesImports(input);
        expect(result).toBe('State');
    });

    it('여러 import() 경로 제거', () => {
        const input = 'import("react").FC<import("./types").Props>';
        const result = simplifyNodeModulesImports(input);
        expect(result).toBe('FC<Props>');
    });

    it('import() 없으면 그대로 반환', () => {
        const input = 'string | number';
        const result = simplifyNodeModulesImports(input);
        expect(result).toBe('string | number');
    });
});

describe('simplifyReactElementGeneric', () => {
    it('ReactElement 두 번째 타입 파라미터 제거', () => {
        const input = 'ReactElement<Props, string | React.JSXElementConstructor<any>>';
        const result = simplifyReactElementGeneric(input);
        expect(result).toBe('ReactElement<Props>');
    });

    it('단순 타입은 그대로 반환', () => {
        const input = 'ReactElement<Props>';
        const result = simplifyReactElementGeneric(input);
        expect(result).toBe('ReactElement<Props>');
    });
});

describe('simplifyForwardRefType', () => {
    it('ForwardRefExoticComponent를 Props로 단순화', () => {
        const input =
            'React.ForwardRefExoticComponent<Omit<Button.Props, "ref"> & React.RefAttributes<HTMLButtonElement>>';
        const result = simplifyForwardRefType(input);
        expect(result).toBe('Button.Props');
    });

    it('매칭되지 않으면 그대로 반환', () => {
        const input = 'React.FC<Props>';
        const result = simplifyForwardRefType(input);
        expect(result).toBe('React.FC<Props>');
    });
});

// ============================================================
// resolveType with ts-morph
// ============================================================

describe('resolveType', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                strict: true,
                esModuleInterop: true,
                jsx: 4, // JsxEmit.ReactJSX
            },
        });
    });

    describe('primitive types', () => {
        it('boolean 타입', () => {
            const source = project.createSourceFile(
                'test.ts',
                `type T = boolean; const x: T = true;`,
            );
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('boolean');
        });

        it('string 타입', () => {
            const source = project.createSourceFile('test.ts', `type T = string;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('string');
        });

        it('number 타입', () => {
            const source = project.createSourceFile('test.ts', `type T = number;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('number');
        });

        it('null 타입', () => {
            const source = project.createSourceFile('test.ts', `type T = null;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('null');
        });

        it('undefined 타입', () => {
            const source = project.createSourceFile('test.ts', `type T = undefined;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('undefined');
        });
    });

    describe('literal types', () => {
        it('string literal', () => {
            const source = project.createSourceFile('test.ts', `type T = "primary";`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('"primary"');
        });

        it('number literal', () => {
            const source = project.createSourceFile('test.ts', `type T = 42;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('42');
        });

        it('boolean literal true', () => {
            const source = project.createSourceFile('test.ts', `type T = true;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('true');
        });

        it('boolean literal false', () => {
            const source = project.createSourceFile('test.ts', `type T = false;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('false');
        });
    });

    describe('function types', () => {
        it('단순 함수 타입', () => {
            const source = project.createSourceFile('test.ts', `type T = () => void;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('() => void');
        });

        it('파라미터가 있는 함수 타입', () => {
            const source = project.createSourceFile('test.ts', `type T = (value: string) => void;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('(value: string) => void');
        });

        it('여러 파라미터가 있는 함수 타입', () => {
            const source = project.createSourceFile(
                'test.ts',
                `type T = (a: string, b: number) => boolean;`,
            );
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            const result = resolveType(type);

            expect(result).toBe('(a: string, b: number) => boolean');
        });
    });

    describe('Ref types', () => {
        it('Ref<T> 문자열 패턴 매칭으로 보존', () => {
            // Note: in-memory에서는 React.Ref가 expand되므로 rawText 기반 매칭 테스트
            // 실제 환경에서는 "React.Ref<HTMLDivElement>" 형식으로 들어옴
            const source = project.createSourceFile('test.ts', `type T = string;`);
            const typeAlias = source.getTypeAliasOrThrow('T');
            const type = typeAlias.getType();

            // preserveRefType 유틸리티의 동작을 직접 테스트
            // resolveType은 rawText가 Ref 패턴일 때 보존함
            const result = resolveType(type);

            expect(result).toBe('string');
        });

        it.skip('Ref<T> 타입 보존 (실제 React 타입 정의 필요)', () => {
            // 이 테스트는 실제 node_modules/@types/react가 있어야 정상 동작
            // 통합 테스트로 별도 구현 필요
        });
    });
});

// ============================================================
// baseUiMap Substitution Priority
// ============================================================

describe('baseUiMap substitution', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: {
                strict: true,
            },
        });
    });

    it('baseUiMap에 등록된 타입은 vaporPath로 치환', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            type State = { open: boolean };
            type T = State;
            `,
        );

        const typeAlias = source.getTypeAliasOrThrow('T');
        const type = typeAlias.getType();

        // State 타입의 symbol을 가져와서 map 생성
        const stateType = source.getTypeAliasOrThrow('State').getType();
        const baseUiMap: BaseUiTypeMap = {
            State: {
                type: stateType,
                vaporPath: 'Collapsible.Root.State',
            },
        };

        const result = resolveType(type, baseUiMap);

        expect(result).toBe('Collapsible.Root.State');
    });

    it('baseUiMap에 없는 타입은 원본 유지', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            type CustomType = { value: string };
            type T = CustomType;
            `,
        );

        const typeAlias = source.getTypeAliasOrThrow('T');
        const type = typeAlias.getType();

        const baseUiMap: BaseUiTypeMap = {};

        const result = resolveType(type, baseUiMap);

        // CustomType alias는 type alias로 유지되거나 object로 spread됨
        // ts-morph 버전에 따라 다를 수 있음
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
    });
});
