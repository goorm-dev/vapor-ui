/**
 * 노드 필터링 규칙
 *
 * PRD 6.3 참조: Figma 노드를 필터링하여 변환 대상을 결정
 */

import type { FigmaNode } from '../types';
import { FIGMA_LAYER_PREFIX } from '../constants';

export interface FilterResult {
    action: 'pass' | 'skip' | 'unwrap-children';
    reason?: string;
}

/**
 * 노드 필터링 규칙 적용
 *
 * @param node - Figma 노드
 * @returns 필터링 결과
 */
export function applyFilters(node: FigmaNode): FilterResult {
    // [1] InteractionLayer 필터링
    // PRD 8.4.2: 인터랙션 레이어는 시각적 상태만 담당하므로 코드 생성에서 제외
    if (node.name.startsWith(FIGMA_LAYER_PREFIX.INTERACTION)) {
        return {
            action: 'skip',
            reason: 'InteractionLayer는 인터랙션 상태 전용으로 코드 생성 제외',
        };
    }

    // [2] ContentLayer 투명화
    // PRD 8.4.3: ContentLayer는 단순 래핑 컨테이너이므로 자식만 추출
    if (
        node.type === 'INSTANCE' &&
        node.name.includes(FIGMA_LAYER_PREFIX.CONTENT) &&
        node.name.includes('/ContentLayer')
    ) {
        return {
            action: 'unwrap-children',
            reason: 'ContentLayer는 시각적 래퍼이므로 자식만 추출',
        };
    }

    // [3] 이미지 노드 제외
    // 이미지 처리는 Phase 2 이후로 미뤄짐
    if (node.fills?.some((f) => f.type === 'IMAGE')) {
        return {
            action: 'skip',
            reason: '이미지 노드는 현재 Phase에서 지원하지 않음',
        };
    }

    // [4] 벡터 노드 제외 (아이콘 제외)
    // Phase 2: 아이콘 감지 개선 - ❤️ prefix 또는 icon 키워드 확인
    const vectorTypes: FigmaNode['type'][] = ['VECTOR', 'LINE', 'STAR', 'ELLIPSE'];
    if (vectorTypes.includes(node.type)) {
        // 아이콘으로 인식할 조건
        const isIcon =
            node.name.includes(FIGMA_LAYER_PREFIX.ICON) ||
            node.name.toLowerCase().includes('icon') ||
            // ❤️ 같은 이모지 prefix 감지 (유니코드 이모지 범위)
            /^[\u{1F300}-\u{1F9FF}]/u.test(node.name);

        if (!isIcon) {
            return {
                action: 'skip',
                reason: '아이콘이 아닌 벡터 노드는 제외',
            };
        }
    }

    // [5] AutoLayout 없는 FRAME/GROUP → 투명 컨테이너
    // 레이아웃 의미가 없는 컨테이너는 자식만 추출
    if (
        (node.type === 'FRAME' || node.type === 'GROUP') &&
        (!node.layoutMode || node.layoutMode === 'NONE')
    ) {
        return {
            action: 'unwrap-children',
            reason: 'AutoLayout이 없는 컨테이너는 자식만 추출',
        };
    }

    // [6] 숨겨진 노드 제외
    if (!node.visible) {
        return {
            action: 'skip',
            reason: '숨겨진 노드는 제외',
        };
    }

    // 모든 필터 통과
    return { action: 'pass' };
}
