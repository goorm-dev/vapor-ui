export const EXPLORER_MESSAGES = {
    HIGHLIGHT_PART: 'EXPLORER_HIGHLIGHT_PART',
    CLEAR_HIGHLIGHT: 'EXPLORER_CLEAR_HIGHLIGHT',
    AVAILABLE_PARTS: 'EXPLORER_AVAILABLE_PARTS',
    PREVIEW_READY: 'EXPLORER_PREVIEW_READY',
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

export interface AvailablePartsMessage {
    type: typeof EXPLORER_MESSAGES.AVAILABLE_PARTS;
    payload: {
        parts: string[];
    };
}

export interface PreviewReadyMessage {
    type: typeof EXPLORER_MESSAGES.PREVIEW_READY;
}

export type ExplorerMessage =
    | HighlightPartMessage
    | ClearHighlightMessage
    | AvailablePartsMessage
    | PreviewReadyMessage;
