import { exportWithoutInteractionLayers } from './hide-interaction-layers';

/**
 * 프레임 전체 스크린샷(1x PNG base64). LLM 컨텍스트로 전달.
 * 🔶InteractionLayer 는 hover/focus 오버레이라 실제 배경색이 아니므로
 * 원본을 건드리지 않고 clone 위에서 감춘 뒤 export → clone 제거.
 */
export async function captureScreenshot(frame: FrameNode): Promise<string> {
    const bytes = await exportWithoutInteractionLayers(frame, {
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1 },
    });

    return figma.base64Encode(bytes);
}
