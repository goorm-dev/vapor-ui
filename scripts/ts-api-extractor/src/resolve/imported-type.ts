import { simplifyNodeModulesImports } from '~/resolve/shared';

export function isImportedType(typeText: string): boolean {
    return typeText.includes('import(');
}

export function resolveImportedType(typeText: string): string {
    return simplifyNodeModulesImports(typeText);
}
