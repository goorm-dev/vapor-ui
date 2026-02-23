import { describe, expect, it } from 'vitest';

import { DeclarationSourceType } from '~/core/parser/constants';
import {
    getDeclarationSourceType,
    isExternalDeclaration,
} from '~/core/parser/type/declaration-source';

describe('getDeclarationSourceType', () => {
    describe('React types', () => {
        it('should identify @types/react path as REACT_TYPES', () => {
            const path = '/node_modules/@types/react/index.d.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.REACT_TYPES);
        });

        it('should identify nested @types/react path', () => {
            const path = '/Users/user/project/node_modules/@types/react/ts5.0/index.d.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.REACT_TYPES);
        });

        it('should identify @types/react-dom path as REACT_TYPES', () => {
            const path = '/node_modules/@types/react-dom/index.d.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.REACT_TYPES);
        });
    });

    describe('TypeScript DOM types', () => {
        it('should identify typescript/lib path as DOM_TYPES', () => {
            const path = '/node_modules/typescript/lib/lib.dom.d.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.DOM_TYPES);
        });

        it('should identify lib.es2015.d.ts as DOM_TYPES', () => {
            const path = '/node_modules/typescript/lib/lib.es2015.d.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.DOM_TYPES);
        });
    });

    describe('Base UI types', () => {
        it('should identify @base-ui-components path as BASE_UI', () => {
            const path = '/node_modules/@base-ui-components/react/button/index.d.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.BASE_UI);
        });
    });

    describe('Project types', () => {
        it('should identify project file as PROJECT', () => {
            const path = '/Users/user/vapor-ui/packages/core/src/button.tsx';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.PROJECT);
        });

        it('should identify .css.ts file as PROJECT', () => {
            const path = '/Users/user/vapor-ui/packages/core/src/button.css.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.PROJECT);
        });

        it('should return PROJECT for undefined path', () => {
            expect(getDeclarationSourceType(undefined)).toBe(DeclarationSourceType.PROJECT);
        });
    });

    describe('Other node_modules', () => {
        it('should identify other node_modules as EXTERNAL', () => {
            const path = '/node_modules/lodash/index.d.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.EXTERNAL);
        });

        it('should identify @floating-ui as EXTERNAL', () => {
            const path = '/node_modules/@floating-ui/dom/dist/floating-ui.dom.d.ts';
            expect(getDeclarationSourceType(path)).toBe(DeclarationSourceType.EXTERNAL);
        });
    });
});

describe('isExternalDeclaration', () => {
    it('should return true for React types', () => {
        expect(isExternalDeclaration('/node_modules/@types/react/index.d.ts')).toBe(true);
    });

    it('should return true for DOM types', () => {
        expect(isExternalDeclaration('/node_modules/typescript/lib/lib.dom.d.ts')).toBe(true);
    });

    it('should return true for other external packages', () => {
        expect(isExternalDeclaration('/node_modules/lodash/index.d.ts')).toBe(true);
    });

    it('should return false for Base UI', () => {
        expect(isExternalDeclaration('/node_modules/@base-ui-components/react/index.d.ts')).toBe(
            false,
        );
    });

    it('should return false for project files', () => {
        expect(isExternalDeclaration('/project/src/button.tsx')).toBe(false);
    });

    it('should return false for undefined path', () => {
        expect(isExternalDeclaration(undefined)).toBe(false);
    });
});
