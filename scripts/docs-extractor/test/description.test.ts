/**
 * Prop description extraction unit tests
 */
import { Project } from 'ts-morph';

import { getPropDescription } from '~/core/parser/props/description';

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
