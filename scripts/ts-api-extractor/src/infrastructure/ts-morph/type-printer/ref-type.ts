import type { Resolver } from '~/infrastructure/ts-morph/type-printer/shared';

function isRefType(typeText: string): boolean {
    return /^(React\.)?Ref<([^>]+)>(\s*\|\s*undefined)?$/.test(typeText);
}

function resolveRefType(typeText: string): string {
    const match = typeText.match(/^(React\.)?Ref<([^>]+)>(\s*\|\s*undefined)?$/);
    return match ? `Ref<${match[2]}>` : typeText;
}

export const refTypeResolver: Resolver = {
    name: 'ref-type',
    resolve: (_type, ctx) => (isRefType(ctx.rawText) ? resolveRefType(ctx.rawText) : null),
};
