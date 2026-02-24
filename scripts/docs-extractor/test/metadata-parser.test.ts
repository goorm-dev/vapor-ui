/**
 * Metadata parser unit tests
 */
import { Project } from 'ts-morph';

import { getComponentDescription } from '~/core/parser/component/metadata-parser';

describe('getComponentDescription', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('JSDoc에서 컴포넌트 설명 추출', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            /**
             * 기본 버튼 컴포넌트
             */
            export const Button = () => null;
            export namespace Button {
                export interface Props {}
            }
            `,
        );

        const result = getComponentDescription(source, 'Button');

        expect(result).toBe('기본 버튼 컴포넌트');
    });

    it('JSDoc 없으면 undefined', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            export const Button = () => null;
            export namespace Button {
                export interface Props {}
            }
            `,
        );

        const result = getComponentDescription(source, 'Button');

        expect(result).toBeUndefined();
    });

    it('컴포넌트 없으면 undefined', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            export const Other = () => null;
            `,
        );

        const result = getComponentDescription(source, 'Button');

        expect(result).toBeUndefined();
    });

    it('여러 줄 JSDoc', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            /**
             * 입력 필드 컴포넌트
             *
             * 다양한 타입의 입력을 지원합니다.
             */
            export const Input = () => null;
            `,
        );

        const result = getComponentDescription(source, 'Input');

        expect(result).toContain('입력 필드 컴포넌트');
    });

    it('빈 JSDoc은 undefined', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            /**
             */
            export const Empty = () => null;
            `,
        );

        const result = getComponentDescription(source, 'Empty');

        expect(result).toBeUndefined();
    });

    it('마지막 JSDoc 사용', () => {
        const source = project.createSourceFile(
            'test.tsx',
            `
            /**
             * 첫 번째 주석
             */
            /**
             * 두 번째 주석 (사용됨)
             */
            export const Multi = () => null;
            `,
        );

        const result = getComponentDescription(source, 'Multi');

        expect(result).toBe('두 번째 주석 (사용됨)');
    });
});
