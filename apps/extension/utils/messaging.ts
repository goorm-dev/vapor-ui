import { defineExtensionMessaging } from '@webext-core/messaging';

interface ProtocolMap {
    startInspecting(): void;
    setInspecting(data: { on: boolean }): void;
    openReviewPanel(): void;
    captureAndStore(data: { scrollX: number; scrollY: number }): {
        imageRef: string;
        index: number;
    };
}

export const { onMessage, sendMessage } = defineExtensionMessaging<ProtocolMap>();
