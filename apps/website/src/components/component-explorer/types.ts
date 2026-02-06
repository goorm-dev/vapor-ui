export const EXPLORER_MESSAGES = {
    HIGHLIGHT_PART: 'EXPLORER_HIGHLIGHT_PART',
    CLEAR_HIGHLIGHT: 'EXPLORER_CLEAR_HIGHLIGHT',
} as const;

export interface HighlightPartMessage {
    type: typeof EXPLORER_MESSAGES.HIGHLIGHT_PART;
    payload: {
        partName: string;
    };
}

export interface ClearHighlightMessage {
    type: typeof EXPLORER_MESSAGES.CLEAR_HIGHLIGHT;
}

export type ExplorerMessage = HighlightPartMessage | ClearHighlightMessage;

export interface Part {
    name: string;
    fullName: string;
    isPrimitive: boolean;
}

export interface AnatomyData {
    componentName: string;
    displayNamePrefix: string;
    parts: Part[];
}
