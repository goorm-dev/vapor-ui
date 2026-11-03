import type { ReactNode } from 'react';

export type DetailedTypeSegment =
    | { kind: 'plain'; node: ReactNode }
    | { kind: 'ref'; node: ReactNode; refName: string; definition: ReactNode };

export interface HighlightedPropRow {
    key: string;
    name: ReactNode;
    description?: string;
    required: boolean;
    types: ReactNode[];
    detailedType?: DetailedTypeSegment[];
    defaultValue?: ReactNode;
}
