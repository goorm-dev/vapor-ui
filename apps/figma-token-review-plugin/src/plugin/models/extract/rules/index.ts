import type { AnyExtractionRule } from '../engine/types';
import { fillColorsRule, strokeColorsRule } from './color';
import { heightRule, widthRule } from './dimension';
import { radiusRule } from './radius';
import { shadowRule } from './shadow';
import { gapRule, paddingRule } from './space';
import { typographyRule } from './typography';

/**
 * 노드 하나에서 추출하는 사실의 전체 선언.
 * 필드 추가 = 여기에 행 추가. 배열 순서 = NodeFacts 내 emission 순서.
 * 순서: colors(fills→strokes) / typography / spaces(padding→gap) / dimensions(width→height) / radii / shadows
 */
export const RULES: readonly AnyExtractionRule[] = [
    fillColorsRule(),
    strokeColorsRule(),
    typographyRule(),
    paddingRule(),
    gapRule,
    widthRule,
    heightRule,
    radiusRule(),
    shadowRule(),
];
