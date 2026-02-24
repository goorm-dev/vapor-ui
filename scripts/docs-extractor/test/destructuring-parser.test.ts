/**
 * Destructuring parser unit tests
 */
import { Project } from 'ts-morph';

import { extractDestructuringDefaults } from '~/core/parser/defaults/destructuring-parser';

describe('extractDestructuringDefaults', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('구조 분해에서 기본값 추출', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            const Button = (props: Props) => {
                const { size = 'md', variant = 'primary' } = props;
                return null;
            };
            `,
        );

        const result = extractDestructuringDefaults(source, 'Button');

        expect(result).toEqual({
            size: 'md',
            variant: 'primary',
        });
    });

    it('문자열 기본값 따옴표 제거', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            const Input = (props: Props) => {
                const { type = "text" } = props;
                return null;
            };
            `,
        );

        const result = extractDestructuringDefaults(source, 'Input');

        expect(result.type).toBe('text');
    });

    it('숫자/불린 기본값 유지', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            const Slider = (props: Props) => {
                const { min = 0, max = 100, disabled = false } = props;
                return null;
            };
            `,
        );

        const result = extractDestructuringDefaults(source, 'Slider');

        expect(result).toEqual({
            min: '0',
            max: '100',
            disabled: 'false',
        });
    });

    it('컴포넌트 없으면 빈 객체', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            const Other = () => null;
            `,
        );

        const result = extractDestructuringDefaults(source, 'Button');

        expect(result).toEqual({});
    });

    it('declaredPropNames로 필터링', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            const Button = (props: Props) => {
                const { size = 'md', internalFlag = true } = props;
                return null;
            };
            `,
        );

        const declaredProps = new Set(['size']);
        const result = extractDestructuringDefaults(source, 'Button', declaredProps);

        expect(result).toEqual({ size: 'md' });
        expect(result).not.toHaveProperty('internalFlag');
    });

    it('화살표 함수 컴포넌트', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            const Card = ({ padding = 16, rounded = true }: Props) => null;
            `,
        );

        const result = extractDestructuringDefaults(source, 'Card');

        expect(result).toEqual({
            padding: '16',
            rounded: 'true',
        });
    });

    it('첫 번째 기본값만 사용 (중복 구조분해)', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            const Widget = (props: Props) => {
                const { size = 'sm' } = props;
                const { size = 'lg' } = props; // 두 번째는 무시됨
                return null;
            };
            `,
        );

        const result = extractDestructuringDefaults(source, 'Widget');

        expect(result.size).toBe('sm');
    });

    it('중첩 구조분해는 무시', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            const Form = (props: Props) => {
                const { config: { theme = 'light' } } = props;
                return null;
            };
            `,
        );

        const result = extractDestructuringDefaults(source, 'Form');

        // config는 identifier가 아니므로 무시됨
        // theme는 수집됨
        expect(result).toHaveProperty('theme', 'light');
    });
});
