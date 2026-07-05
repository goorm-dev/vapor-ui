export type { ManifestShape, TokenScope } from '@vapor-ui/tokens';

export interface BuildError {
    code:
        | 'unknown-token'
        | 'scope-mismatch'
        | 'unknown-property'
        | 'invalid-input-shape'
        | 'dynamic-value'
        | 'computed-key'
        | 'spread'
        | 'layer-non-static'
        | 'layer-unknown-registry-key';
    message: string;
    loc: { line: number; column: number };
    frame?: string;
}

export interface Tuple {
    property: string;
    propertyShort: string;
    valueShort: string;
    cssValue: string;
    condition: ConditionKey;
}

export type ConditionKey =
    | { kind: 'default' }
    | { kind: 'named-bp'; name: 'sm' | 'md' | 'lg' }
    | { kind: 'pseudo'; name: PseudoName }
    | { kind: 'raw-media'; query: string; hash: string };

export type PseudoName =
    | '_before'
    | '_after'
    | '_hover'
    | '_focus'
    | '_focusVisible'
    | '_focusWithin'
    | '_active';
