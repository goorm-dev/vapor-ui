import type { Resolver } from '#read/type-printer/shared';
import { simplifyNodeModulesImports } from '#read/type-printer/shared';

function isImportedType(typeText: string): boolean {
    return typeText.includes('import(');
}

function resolveImportedType(typeText: string): string {
    return simplifyNodeModulesImports(typeText);
}

export const importedTypeResolver: Resolver = {
    name: 'imported-type',
    resolve: (_type, ctx) =>
        isImportedType(ctx.rawText) ? resolveImportedType(ctx.rawText) : null,
};
