/**
 * Declaration source unit tests
 */
import { DeclarationSourceType } from '~/core/parser/constants';
import {
    getDeclarationSourceType,
    isExternalDeclaration,
} from '~/core/parser/type/declaration-source';

describe('getDeclarationSourceType', () => {
    describe('PROJECT', () => {
        it('일반 프로젝트 파일', () => {
            expect(getDeclarationSourceType('/src/components/button.tsx')).toBe(
                DeclarationSourceType.PROJECT,
            );
        });

        it('undefined는 PROJECT', () => {
            expect(getDeclarationSourceType(undefined)).toBe(DeclarationSourceType.PROJECT);
        });

        it('프로젝트 내 types 파일', () => {
            expect(getDeclarationSourceType('/src/types/common.ts')).toBe(
                DeclarationSourceType.PROJECT,
            );
        });
    });

    describe('REACT_TYPES', () => {
        it('@types/react 경로', () => {
            expect(
                getDeclarationSourceType('/node_modules/@types/react/index.d.ts'),
            ).toBe(DeclarationSourceType.REACT_TYPES);
        });

        it('@types/react-dom 경로', () => {
            expect(
                getDeclarationSourceType('/node_modules/@types/react-dom/index.d.ts'),
            ).toBe(DeclarationSourceType.REACT_TYPES);
        });
    });

    describe('DOM_TYPES', () => {
        it('typescript/lib 경로', () => {
            expect(
                getDeclarationSourceType('/node_modules/typescript/lib/lib.dom.d.ts'),
            ).toBe(DeclarationSourceType.DOM_TYPES);
        });
    });

    describe('BASE_UI', () => {
        it('@base-ui 경로', () => {
            expect(
                getDeclarationSourceType('/node_modules/@base-ui/components/button/root.d.ts'),
            ).toBe(DeclarationSourceType.BASE_UI);
        });

        it('@base-ui 중첩 경로', () => {
            expect(
                getDeclarationSourceType('/node_modules/@base-ui/react/collapsible/root/index.d.ts'),
            ).toBe(DeclarationSourceType.BASE_UI);
        });
    });

    describe('EXTERNAL', () => {
        it('기타 node_modules 패키지', () => {
            expect(
                getDeclarationSourceType('/node_modules/lodash/index.d.ts'),
            ).toBe(DeclarationSourceType.EXTERNAL);
        });

        it('@scope 패키지', () => {
            expect(
                getDeclarationSourceType('/node_modules/@emotion/react/index.d.ts'),
            ).toBe(DeclarationSourceType.EXTERNAL);
        });
    });
});

describe('isExternalDeclaration', () => {
    it('REACT_TYPES는 external', () => {
        expect(isExternalDeclaration('/node_modules/@types/react/index.d.ts')).toBe(true);
    });

    it('DOM_TYPES는 external', () => {
        expect(isExternalDeclaration('/node_modules/typescript/lib/lib.dom.d.ts')).toBe(true);
    });

    it('EXTERNAL은 external', () => {
        expect(isExternalDeclaration('/node_modules/lodash/index.d.ts')).toBe(true);
    });

    it('PROJECT는 external 아님', () => {
        expect(isExternalDeclaration('/src/components/button.tsx')).toBe(false);
    });

    it('BASE_UI는 external 아님', () => {
        expect(isExternalDeclaration('/node_modules/@base-ui/components/root.d.ts')).toBe(false);
    });

    it('undefined는 external 아님', () => {
        expect(isExternalDeclaration(undefined)).toBe(false);
    });
});
