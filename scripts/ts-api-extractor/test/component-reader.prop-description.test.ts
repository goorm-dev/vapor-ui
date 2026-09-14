/**
 * Prop description extraction unit tests
 */
import { Project } from 'ts-morph';

import { getPropDescription } from '~/infrastructure/ts-morph/component-reader';

describe('getPropDescription', () => {
    let project: Project;

    beforeEach(() => {
        project = new Project({
            useInMemoryFileSystem: true,
            compilerOptions: { strict: true },
        });
    });

    it('JSDoc 주석에서 설명 추출', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            interface Props {
                /** 버튼 비활성화 여부 */
                disabled?: boolean;
            }
            `,
        );

        const propsInterface = source.getInterfaceOrThrow('Props');
        const disabledProp = propsInterface.getPropertyOrThrow('disabled');
        const symbol = disabledProp.getSymbol()!;

        const result = getPropDescription(symbol);

        expect(result).toBe('버튼 비활성화 여부');
    });

    it('JSDoc 없으면 undefined', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            interface Props {
                disabled?: boolean;
            }
            `,
        );

        const propsInterface = source.getInterfaceOrThrow('Props');
        const disabledProp = propsInterface.getPropertyOrThrow('disabled');
        const symbol = disabledProp.getSymbol()!;

        const result = getPropDescription(symbol);

        expect(result).toBeUndefined();
    });

    it('여러 줄 JSDoc', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            interface Props {
                /**
                 * 클릭 이벤트 핸들러
                 * 버튼 클릭 시 호출됩니다
                 */
                onClick?: () => void;
            }
            `,
        );

        const propsInterface = source.getInterfaceOrThrow('Props');
        const onClickProp = propsInterface.getPropertyOrThrow('onClick');
        const symbol = onClickProp.getSymbol()!;

        const result = getPropDescription(symbol);

        expect(result).toContain('클릭 이벤트 핸들러');
    });

    it('빈 JSDoc', () => {
        const source = project.createSourceFile(
            'test.ts',
            `
            interface Props {
                /** */
                value?: string;
            }
            `,
        );

        const propsInterface = source.getInterfaceOrThrow('Props');
        const valueProp = propsInterface.getPropertyOrThrow('value');
        const symbol = valueProp.getSymbol()!;

        const result = getPropDescription(symbol);

        // 빈 문자열은 undefined로 반환
        expect(result).toBeUndefined();
    });
});

describe('getPropDescription — 선언이 여러 개인 prop', () => {
    const build = (files: Record<string, string>) => {
        const project = new Project({ useInMemoryFileSystem: true });
        for (const [path, content] of Object.entries(files)) {
            project.createSourceFile(path, content);
        }
        return project;
    };

    it('여러 선언의 JSDoc을 이어붙이지 않는다', () => {
        const project = build({
            '/merged.ts': `
                interface Base {
                    /** Style applied to the element, based on the component's state. */
                    style?: string;
                }
                interface Own {
                    /** Style applied to the element, based on the component’s state. */
                    style?: string;
                }
                export type Merged = Base & Own;
            `,
        });

        const merged = project.getSourceFileOrThrow('/merged.ts').getTypeAliasOrThrow('Merged');
        const description = getPropDescription(merged.getType().getPropertyOrThrow('style'));

        expect(description).toBe("Style applied to the element, based on the component's state.");
    });

    it('node_modules 선언보다 프로젝트 선언의 설명을 쓴다', () => {
        const project = build({
            '/node_modules/@base-ui/react/types.d.ts': `
                export interface Upstream {
                    /** Upstream wording. */
                    style?: string;
                }
            `,
            '/merged.ts': `
                import type { Upstream } from '@base-ui/react/types';
                interface Own {
                    /** Vapor wording. */
                    style?: string;
                }
                export type Merged = Upstream & Own;
            `,
        });

        const merged = project.getSourceFileOrThrow('/merged.ts').getTypeAliasOrThrow('Merged');
        const description = getPropDescription(merged.getType().getPropertyOrThrow('style'));

        expect(description).toBe('Vapor wording.');
    });

    it('설명이 없는 선언은 건너뛴다', () => {
        const project = build({
            '/merged.ts': `
                interface NoDoc {
                    style?: string;
                }
                interface Documented {
                    /** The only wording. */
                    style?: string;
                }
                export type Merged = NoDoc & Documented;
            `,
        });

        const merged = project.getSourceFileOrThrow('/merged.ts').getTypeAliasOrThrow('Merged');
        const description = getPropDescription(merged.getType().getPropertyOrThrow('style'));

        expect(description).toBe('The only wording.');
    });
});
