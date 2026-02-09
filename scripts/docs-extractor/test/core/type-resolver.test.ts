import { describe, expect, it } from 'vitest';

import { simplifyNodeModulesImports } from '~/core/types';

describe('simplifyNodeModulesImports', () => {
    describe('basic import path removal', () => {
        it('should remove simple import path', () => {
            const input = 'import("/path/to/module").TypeName';
            expect(simplifyNodeModulesImports(input)).toBe('TypeName');
        });

        it('should remove node_modules import path', () => {
            const input = 'import("/Users/project/node_modules/@floating-ui/dom").VirtualElement';
            expect(simplifyNodeModulesImports(input)).toBe('VirtualElement');
        });
    });

    describe('namespace chaining', () => {
        it('should preserve namespace chain after import removal', () => {
            const input = 'import("/path/to/module").Namespace.TypeName';
            expect(simplifyNodeModulesImports(input)).toBe('Namespace.TypeName');
        });
    });

    describe('generic type handling', () => {
        it('should remove import inside generic type', () => {
            const input = 'Box<import("/path/to/module").Item>';
            expect(simplifyNodeModulesImports(input)).toBe('Box<Item>');
        });

        it('should handle multiple imports in generic', () => {
            const input = 'Map<import("/path1").Key, import("/path2").Value>';
            expect(simplifyNodeModulesImports(input)).toBe('Map<Key, Value>');
        });
    });

    describe('union types', () => {
        it('should handle union type with imports', () => {
            const input = 'import("/path1").TypeA | import("/path2").TypeB';
            expect(simplifyNodeModulesImports(input)).toBe('TypeA | TypeB');
        });
    });

    describe('edge cases', () => {
        it('should return unchanged string when no import pattern', () => {
            expect(simplifyNodeModulesImports('string | number')).toBe('string | number');
        });

        it('should handle empty string', () => {
            expect(simplifyNodeModulesImports('')).toBe('');
        });

        it('should handle single quotes', () => {
            const input = "import('/path/to/module').TypeName";
            expect(simplifyNodeModulesImports(input)).toBe('TypeName');
        });
    });
});
