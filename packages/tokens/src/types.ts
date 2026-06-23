export type TokenScope = 'color' | 'space' | 'dimension' | 'borderRadius' | 'shadow' | 'typography';

export interface ManifestShape {
    version: '1';
    tokens: Record<TokenScope, Record<string, string>>;
    propertyScopes: Record<string, TokenScope>;
}
