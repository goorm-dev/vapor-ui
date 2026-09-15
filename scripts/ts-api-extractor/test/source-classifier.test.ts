/**
 * Declaration source unit tests
 */
import { classifyPath, isProjectOwned } from '#infrastructure/ts-morph/source-classifier';

describe('classifyPath', () => {
    describe('project', () => {
        it('일반 프로젝트 파일', () => {
            expect(classifyPath('/src/components/button.tsx')).toBe('project');
        });

        it('undefined는 project', () => {
            expect(classifyPath(undefined)).toBe('project');
        });

        it('프로젝트 내 types 파일', () => {
            expect(classifyPath('/src/types/common.ts')).toBe('project');
        });
    });

    describe('react', () => {
        it('@types/react 경로', () => {
            expect(classifyPath('/node_modules/@types/react/index.d.ts')).toBe('react');
        });

        it('@types/react-dom 경로', () => {
            expect(classifyPath('/node_modules/@types/react-dom/index.d.ts')).toBe('react');
        });
    });

    describe('dom', () => {
        it('typescript/lib 경로', () => {
            expect(classifyPath('/node_modules/typescript/lib/lib.dom.d.ts')).toBe('dom');
        });
    });

    describe('base-ui', () => {
        it('@base-ui 경로', () => {
            expect(classifyPath('/node_modules/@base-ui/components/button/root.d.ts')).toBe(
                'base-ui',
            );
        });

        it('@base-ui 중첩 경로', () => {
            expect(classifyPath('/node_modules/@base-ui/react/collapsible/root/index.d.ts')).toBe(
                'base-ui',
            );
        });
    });

    describe('sprinkles', () => {
        it('sprinkles.css 파일', () => {
            expect(classifyPath('/src/styles/sprinkles.css.ts')).toBe('sprinkles');
        });
    });

    describe('variants', () => {
        it('.css.ts 파일', () => {
            expect(classifyPath('/src/components/button.css.ts')).toBe('variants');
        });
    });

    describe('external', () => {
        it('기타 node_modules 패키지', () => {
            expect(classifyPath('/node_modules/lodash/index.d.ts')).toBe('external');
        });

        it('@scope 패키지', () => {
            expect(classifyPath('/node_modules/@emotion/react/index.d.ts')).toBe('external');
        });
    });

    describe('우선순위', () => {
        it('base-ui가 sprinkles/variants보다 앞선다', () => {
            expect(classifyPath('/node_modules/@base-ui/react/button.css.ts')).toBe('base-ui');
        });

        it('sprinkles가 variants보다 앞선다', () => {
            expect(classifyPath('/src/styles/sprinkles.css.ts')).not.toBe('variants');
        });
    });
});

describe('isProjectOwned', () => {
    it.each([
        ['/src/components/button.tsx', true],
        ['/src/components/button.css.ts', true],
        ['/src/styles/sprinkles.css.ts', true],
        [undefined, true],
        ['/node_modules/@base-ui/components/root.d.ts', false],
        ['/node_modules/@types/react/index.d.ts', false],
        ['/node_modules/typescript/lib/lib.dom.d.ts', false],
        ['/node_modules/lodash/index.d.ts', false],
    ])('%s → %s', (filePath, expected) => {
        expect(isProjectOwned(filePath)).toBe(expected);
    });
});
