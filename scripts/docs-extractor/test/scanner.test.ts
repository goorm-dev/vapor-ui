/**
 * Component scanner unit tests
 */
import {
    findFileByComponentName,
    normalizeComponentName,
} from '~/core/parser/component/scanner';

describe('normalizeComponentName', () => {
    it('소문자로 변환', () => {
        expect(normalizeComponentName('Button')).toBe('button');
    });

    it('하이픈 제거', () => {
        expect(normalizeComponentName('button-group')).toBe('buttongroup');
    });

    it('PascalCase 변환', () => {
        expect(normalizeComponentName('ButtonGroup')).toBe('buttongroup');
    });

    it('kebab-case 변환', () => {
        expect(normalizeComponentName('button-group-item')).toBe('buttongroupitem');
    });

    it('빈 문자열', () => {
        expect(normalizeComponentName('')).toBe('');
    });
});

describe('findFileByComponentName', () => {
    const files = [
        '/components/button/button.tsx',
        '/components/button/button-group.tsx',
        '/components/input/input.tsx',
        '/components/collapsible/collapsible-root.tsx',
    ];

    it('정확한 이름 매칭', () => {
        const result = findFileByComponentName(files, 'button');
        expect(result).toBe('/components/button/button.tsx');
    });

    it('PascalCase로 검색', () => {
        const result = findFileByComponentName(files, 'Button');
        expect(result).toBe('/components/button/button.tsx');
    });

    it('kebab-case 파일 매칭', () => {
        const result = findFileByComponentName(files, 'ButtonGroup');
        expect(result).toBe('/components/button/button-group.tsx');
    });

    it('kebab-case로 검색', () => {
        const result = findFileByComponentName(files, 'button-group');
        expect(result).toBe('/components/button/button-group.tsx');
    });

    it('찾지 못하면 null', () => {
        const result = findFileByComponentName(files, 'NotFound');
        expect(result).toBeNull();
    });

    it('빈 파일 목록', () => {
        const result = findFileByComponentName([], 'Button');
        expect(result).toBeNull();
    });

    it('복합 컴포넌트 이름', () => {
        const result = findFileByComponentName(files, 'CollapsibleRoot');
        expect(result).toBe('/components/collapsible/collapsible-root.tsx');
    });
});
