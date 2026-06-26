import { defineExtensionMessaging } from '@webext-core/messaging';

export interface LightboxBox {
    rect: { top: number; left: number; width: number; height: number };
    index?: number;
}

interface ProtocolMap {
    // popup → content: 현재 탭의 인스펙팅 ON/OFF 조회. 수신자 없으면 reject → 비지원 탭으로 본다.
    getInspecting(): boolean;
    setInspecting(data: { on: boolean }): void;
    setPanelOpen(data: { open: boolean }): void;
    openReviewPanel(): void;
    captureAndStore(data: { pageUrl: string; scrollX: number; scrollY: number; width: number }): {
        imageRef: string;
        index: number;
        tabId: number;
    };
    // sidepanel → background: 활성 탭 위에 전체화면 이미지 라이트박스를 띄운다.
    openLightbox(data: {
        imageRef: string;
        boxes: LightboxBox[];
        alt: string;
        tabId?: number;
    }): void;
    // background → content: 이미지 dataURL을 받아 페이지 위에 오버레이로 그린다.
    showLightbox(data: { dataUrl: string; boxes: LightboxBox[]; alt: string }): void;
}

export const { onMessage, sendMessage } = defineExtensionMessaging<ProtocolMap>();
