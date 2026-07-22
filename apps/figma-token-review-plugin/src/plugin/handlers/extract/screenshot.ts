/**
 * 프레임 전체 스크린샷(1x PNG base64). LLM 컨텍스트로 전달.
 */
export async function captureScreenshot(frame: FrameNode): Promise<string> {
    const bytes = await frame.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: 1 },
    });

    return figma.base64Encode(bytes);
}
