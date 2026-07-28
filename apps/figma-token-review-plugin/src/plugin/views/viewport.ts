/** 캔버스 인터페이스 부수효과: 선택 변경 + 뷰포트 이동. */
export function focusNodes(nodes: SceneNode[]): void {
    figma.currentPage.selection = nodes;
    figma.viewport.scrollAndZoomIntoView(nodes);
}
