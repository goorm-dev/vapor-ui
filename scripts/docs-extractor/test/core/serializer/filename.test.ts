import { describe, expect, it } from 'vitest';

import { formatFileName, toKebabCase } from '~/core/serializer/filename';

describe('toKebabCase', () => {
    it('should convert PascalCase to kebab-case', () => {
        expect(toKebabCase('SimpleButton')).toBe('simple-button');
    });

    it('should convert camelCase to kebab-case', () => {
        expect(toKebabCase('simpleButton')).toBe('simple-button');
    });

    it('should handle single word', () => {
        expect(toKebabCase('Button')).toBe('button');
    });

    it('should handle multiple uppercase letters', () => {
        expect(toKebabCase('TabsListIndicator')).toBe('tabs-list-indicator');
    });

    it('should preserve already kebab-case', () => {
        expect(toKebabCase('simple-button')).toBe('simple-button');
    });

    it('should handle lowercase string', () => {
        expect(toKebabCase('button')).toBe('button');
    });
});

describe('formatFileName', () => {
    it('should format component name to json file name', () => {
        expect(formatFileName('SimpleButton')).toBe('simple-button.json');
    });

    it('should handle already kebab-case', () => {
        expect(formatFileName('simple-button')).toBe('simple-button.json');
    });

    it('should handle compound component names', () => {
        expect(formatFileName('TabsRoot')).toBe('tabs-root.json');
    });
});
