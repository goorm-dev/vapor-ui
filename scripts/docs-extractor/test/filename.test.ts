/**
 * Filename utilities unit tests
 */
import { formatFileName, toKebabCase } from '~/core/serializer/filename';

describe('toKebabCase', () => {
    it('PascalCase → kebab-case', () => {
        expect(toKebabCase('ButtonGroup')).toBe('button-group');
    });

    it('단일 단어', () => {
        expect(toKebabCase('Button')).toBe('button');
    });

    it('여러 단어', () => {
        expect(toKebabCase('CollapsibleTrigger')).toBe('collapsible-trigger');
    });

    it('이미 소문자', () => {
        expect(toKebabCase('button')).toBe('button');
    });

    it('연속 대문자', () => {
        expect(toKebabCase('HTMLElement')).toBe('htmlelement');
    });

    it('빈 문자열', () => {
        expect(toKebabCase('')).toBe('');
    });
});

describe('formatFileName', () => {
    it('컴포넌트명 → kebab-case.json', () => {
        expect(formatFileName('Button')).toBe('button.json');
    });

    it('복합 컴포넌트명', () => {
        expect(formatFileName('CollapsibleRoot')).toBe('collapsible-root.json');
    });

    it('세 단어 이상', () => {
        expect(formatFileName('DataTableHeader')).toBe('data-table-header.json');
    });
});
