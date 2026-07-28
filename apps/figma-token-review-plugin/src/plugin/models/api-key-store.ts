const STORAGE_KEY = 'litellm-api-key';

export async function readKey(): Promise<string | null> {
    const raw = await figma.clientStorage.getAsync(STORAGE_KEY);
    return typeof raw === 'string' && raw.length > 0 ? raw : null;
}

/** trim 후 빈 값이면 삭제와 동일 취급 — 기존 api-key:set 핸들러 의미 보존. */
export async function writeKey(value: string): Promise<void> {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
        await figma.clientStorage.deleteAsync(STORAGE_KEY);
    } else {
        await figma.clientStorage.setAsync(STORAGE_KEY, trimmed);
    }
}

export async function clearKey(): Promise<void> {
    await figma.clientStorage.deleteAsync(STORAGE_KEY);
}
