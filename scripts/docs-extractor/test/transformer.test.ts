/**
 * Transformer unit tests
 *
 * Tests for model transformation logic:
 * - parsedPropToModel conversion
 * - category classification
 * - type string parsing
 */
import { parsedComponentToModel, parsedPropToModel } from '~/core/model/transformer';
import type { ParsedProp } from '~/core/parser/types';

describe('parsedPropToModel', () => {
    describe('required 계산', () => {
        it('isOptional: false → required: true', () => {
            const parsed: ParsedProp = {
                name: 'onClick',
                typeString: '() => void',
                isOptional: false,
            };

            const result = parsedPropToModel(parsed);

            expect(result.required).toBe(true);
        });

        it('isOptional: true → required: false', () => {
            const parsed: ParsedProp = {
                name: 'disabled',
                typeString: 'boolean',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.required).toBe(false);
        });
    });

    describe('category 분류', () => {
        it('required prop → "required" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'children',
                typeString: 'ReactNode',
                isOptional: false,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('required');
        });

        it('asChild → "composition" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'asChild',
                typeString: 'boolean',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('composition');
        });

        it('render → "composition" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'render',
                typeString: '(props: Props) => ReactNode',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('composition');
        });

        it('.css.ts 파일의 prop → "variants" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'size',
                typeString: '"sm" | "md" | "lg"',
                isOptional: true,
                declarationFilePath: '/path/to/button.css.ts',
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('variants');
        });

        it('상태 prop (value) → "state" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'value',
                typeString: 'string',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('state');
        });

        it('상태 prop (onChange) → "state" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'onChange',
                typeString: '(value: string) => void',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('state');
        });

        it('상태 prop (onOpenChange) → "state" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'onOpenChange',
                typeString: '(open: boolean) => void',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('state');
        });

        it('상태 prop (open) → "state" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'open',
                typeString: 'boolean',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('state');
        });

        it('상태 prop (defaultOpen) → "state" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'defaultOpen',
                typeString: 'boolean',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('state');
        });

        it('@base-ui 파일의 prop → "base-ui" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'keepMounted',
                typeString: 'boolean',
                isOptional: true,
                declarationFilePath: '/node_modules/@base-ui/components/collapsible/root.d.ts',
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('base-ui');
        });

        it('일반 optional prop → "custom" 카테고리', () => {
            const parsed: ParsedProp = {
                name: 'className',
                typeString: 'string',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.category).toBe('custom');
        });
    });

    describe('types 배열 변환', () => {
        it('단순 타입 → 단일 요소 배열', () => {
            const parsed: ParsedProp = {
                name: 'disabled',
                typeString: 'boolean',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.types).toEqual(['boolean']);
        });

        it('단순 union 타입 → 분리된 배열', () => {
            const parsed: ParsedProp = {
                name: 'size',
                typeString: '"sm" | "md" | "lg"',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.types).toEqual(['"sm"', '"md"', '"lg"']);
        });

        it('복잡한 union 타입 → 단일 요소 배열 (분리 안함)', () => {
            const parsed: ParsedProp = {
                name: 'render',
                typeString: '(props: Props) => ReactNode | undefined',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            // 복잡한 타입은 분리하지 않음
            expect(result.types).toEqual(['(props: Props) => ReactNode | undefined']);
        });

        it('숫자 union 타입 → 분리된 배열', () => {
            const parsed: ParsedProp = {
                name: 'columns',
                typeString: '1 | 2 | 3 | 4',
                isOptional: true,
            };

            const result = parsedPropToModel(parsed);

            expect(result.types).toEqual(['1', '2', '3', '4']);
        });
    });

    describe('기타 필드 매핑', () => {
        it('description 전달', () => {
            const parsed: ParsedProp = {
                name: 'label',
                typeString: 'string',
                isOptional: true,
                description: '버튼에 표시될 텍스트',
            };

            const result = parsedPropToModel(parsed);

            expect(result.description).toBe('버튼에 표시될 텍스트');
        });

        it('defaultValue 전달', () => {
            const parsed: ParsedProp = {
                name: 'size',
                typeString: '"sm" | "md" | "lg"',
                isOptional: true,
                defaultValue: 'md',
            };

            const result = parsedPropToModel(parsed);

            expect(result.defaultValue).toBe('md');
        });
    });
});

describe('parsedComponentToModel', () => {
    it('props를 카테고리 순서대로 정렬', () => {
        const parsed = {
            name: 'Button',
            props: [
                { name: 'className', typeString: 'string', isOptional: true },
                { name: 'children', typeString: 'ReactNode', isOptional: false },
                {
                    name: 'size',
                    typeString: '"sm" | "md"',
                    isOptional: true,
                    declarationFilePath: '/button.css.ts',
                },
                { name: 'asChild', typeString: 'boolean', isOptional: true },
                { name: 'onChange', typeString: '() => void', isOptional: true },
            ],
        };

        const result = parsedComponentToModel(parsed);

        // 정렬 순서: required → variants → state → custom → base-ui → composition
        const propNames = result.props.map((p) => p.name);
        expect(propNames).toEqual(['children', 'size', 'onChange', 'className', 'asChild']);
    });

    it('같은 카테고리 내에서 알파벳 순 정렬', () => {
        const parsed = {
            name: 'Panel',
            props: [
                { name: 'zIndex', typeString: 'number', isOptional: true },
                { name: 'aria-label', typeString: 'string', isOptional: true },
                { name: 'className', typeString: 'string', isOptional: true },
            ],
        };

        const result = parsedComponentToModel(parsed);

        const propNames = result.props.map((p) => p.name);
        // 모두 custom 카테고리 → 알파벳 순
        expect(propNames).toEqual(['aria-label', 'className', 'zIndex']);
    });

    it('displayName은 name과 동일하게 설정', () => {
        const parsed = {
            name: 'CollapsibleRoot',
            props: [],
        };

        const result = parsedComponentToModel(parsed);

        expect(result.displayName).toBe('CollapsibleRoot');
    });

    it('description 전달', () => {
        const parsed = {
            name: 'Button',
            description: '기본 버튼 컴포넌트',
            props: [],
        };

        const result = parsedComponentToModel(parsed);

        expect(result.description).toBe('기본 버튼 컴포넌트');
    });
});
