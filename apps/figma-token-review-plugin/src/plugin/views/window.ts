export const DEFAULT_SIZE = { width: 500, height: 600 };
export const MIN_SIZE = { width: 360, height: 480 };

/** 플러그인 창 크기 조절 — MIN_SIZE 미만으로 줄어들지 않게 클램프. */
export function resizeWindow(width: number, height: number): void {
    figma.ui.resize(
        Math.max(MIN_SIZE.width, Math.round(width)),
        Math.max(MIN_SIZE.height, Math.round(height)),
    );
}
