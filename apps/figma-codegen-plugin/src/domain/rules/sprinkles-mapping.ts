/**
 * Sprinkles 매핑 규칙
 *
 * PRD 6.4 참조: Figma 스타일 속성을 Sprinkles Props로 매핑
 */

import type { FigmaNode } from '../types';
import {
    findClosestDimensionToken,
    findClosestRadiusToken,
    findClosestSpaceToken,
    mapFontSizeToToken,
    mapFontWeightToToken,
    mapLineHeightToToken,
    mapRgbToColorToken,
    mapShadowToToken,
} from '../constants';

/**
 * Sprinkles Props 추출
 *
 * @param node - Figma 노드
 * @returns Sprinkles Props 객체
 */
export function extractSprinkleProps(node: FigmaNode): Record<string, unknown> {
    const props: Record<string, unknown> = {};

    // Dimensions
    if (node.width !== undefined) {
        const token = findClosestDimensionToken(node.width);
        props.width = token ?? `${Math.round(node.width)}px`;
    }

    if (node.height !== undefined) {
        const token = findClosestDimensionToken(node.height);
        props.height = token ?? `${Math.round(node.height)}px`;
    }

    // Spacing - Padding
    if (node.paddingLeft !== undefined && node.paddingLeft > 0) {
        props.paddingLeft = findClosestSpaceToken(node.paddingLeft);
    }

    if (node.paddingRight !== undefined && node.paddingRight > 0) {
        props.paddingRight = findClosestSpaceToken(node.paddingRight);
    }

    if (node.paddingTop !== undefined && node.paddingTop > 0) {
        props.paddingTop = findClosestSpaceToken(node.paddingTop);
    }

    if (node.paddingBottom !== undefined && node.paddingBottom > 0) {
        props.paddingBottom = findClosestSpaceToken(node.paddingBottom);
    }

    // Padding Shorthand 최적화
    const { paddingLeft, paddingRight, paddingTop, paddingBottom } = props;
    if (paddingLeft === paddingRight && paddingLeft !== undefined) {
        props.paddingX = paddingLeft;
        delete props.paddingLeft;
        delete props.paddingRight;
    }
    if (paddingTop === paddingBottom && paddingTop !== undefined) {
        props.paddingY = paddingTop;
        delete props.paddingTop;
        delete props.paddingBottom;
    }
    if (
        props.paddingX === props.paddingY &&
        props.paddingX !== undefined &&
        props.paddingY !== undefined
    ) {
        props.padding = props.paddingX;
        delete props.paddingX;
        delete props.paddingY;
    }

    // Border Radius
    if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
        props.borderRadius = findClosestRadiusToken(node.cornerRadius);
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity !== 1) {
        props.opacity = node.opacity;
    }

    // Background Color - Phase 2: Color Token 매핑 추가
    if (node.fills && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.visible && fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color;
            const colorToken = mapRgbToColorToken(r, g, b);
            if (colorToken) {
                props.backgroundColor = colorToken;
            }
        }
    }

    // Text Color - Phase 2 추가
    // TextNode의 경우 fills가 텍스트 색상을 나타냄
    if (node.type === 'TEXT' && node.fills && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.visible && fill.type === 'SOLID' && fill.color) {
            const { r, g, b } = fill.color;
            const colorToken = mapRgbToColorToken(r, g, b);
            if (colorToken) {
                props.color = colorToken;
            }
        }
    }

    // Border Color - Phase 2 추가
    if (node.strokes && node.strokes.length > 0) {
        const stroke = node.strokes[0];
        if (stroke.visible && stroke.type === 'SOLID' && stroke.color) {
            const { r, g, b } = stroke.color;
            const colorToken = mapRgbToColorToken(r, g, b);
            if (colorToken) {
                props.borderColor = colorToken;
            }
        }
    }

    // Typography - Phase 2 추가
    if (node.type === 'TEXT') {
        // Font Size
        if (node.fontSize !== undefined && typeof node.fontSize === 'number') {
            const fontSizeToken = mapFontSizeToToken(node.fontSize);
            if (fontSizeToken) {
                props.fontSize = fontSizeToken;
            }
        }

        // Font Weight
        if (node.fontWeight !== undefined && typeof node.fontWeight === 'number') {
            const fontWeightToken = mapFontWeightToToken(node.fontWeight);
            if (fontWeightToken) {
                props.fontWeight = fontWeightToken;
            }
        }

        // Line Height
        if (node.lineHeight !== undefined && typeof node.lineHeight === 'object') {
            const lineHeightValue = (node.lineHeight as { value?: number }).value;
            if (lineHeightValue !== undefined) {
                const lineHeightToken = mapLineHeightToToken(lineHeightValue);
                if (lineHeightToken) {
                    props.lineHeight = lineHeightToken;
                }
            }
        }

        // Letter Spacing
        if (node.letterSpacing !== undefined && typeof node.letterSpacing === 'object') {
            const letterSpacingValue = (node.letterSpacing as { value?: number }).value;
            if (letterSpacingValue !== undefined && letterSpacingValue !== 0) {
                props.letterSpacing = `${letterSpacingValue}px`;
            }
        }
    }

    // Shadow (Box Shadow) - Phase 2 추가
    if (node.effects && node.effects.length > 0) {
        const dropShadow = node.effects.find((effect) => effect.type === 'DROP_SHADOW');
        if (dropShadow && dropShadow.visible) {
            const { offset, radius, spread } = dropShadow;
            if (offset && radius !== undefined) {
                const shadowToken = mapShadowToToken(
                    offset.x ?? 0,
                    offset.y ?? 0,
                    radius,
                    spread ?? 0,
                );
                if (shadowToken) {
                    props.boxShadow = shadowToken;
                }
            }
        }
    }

    return props;
}

/**
 * Flexbox Props 추출 (AutoLayout)
 *
 * @param node - Figma 노드
 * @returns Flexbox Props 객체
 */
export function extractFlexboxProps(node: FigmaNode): Record<string, unknown> {
    const props: Record<string, unknown> = {};

    // FlexDirection
    if (node.layoutMode === 'HORIZONTAL') {
        props.flexDirection = 'row';
    } else if (node.layoutMode === 'VERTICAL') {
        props.flexDirection = 'column';
    }

    // AlignItems (Counter Axis)
    if (node.counterAxisAlignItems) {
        props.alignItems = mapCounterAxisAlign(node.counterAxisAlignItems);
    }

    // JustifyContent (Primary Axis)
    if (node.primaryAxisAlignItems) {
        props.justifyContent = mapPrimaryAxisAlign(node.primaryAxisAlignItems);
    }

    // Gap
    if (node.itemSpacing !== undefined && node.itemSpacing > 0) {
        props.gap = findClosestSpaceToken(node.itemSpacing);
    }

    return props;
}

/**
 * Counter Axis Align 매핑
 */
function mapCounterAxisAlign(align: string): string {
    const map: Record<string, string> = {
        MIN: 'flex-start',
        CENTER: 'center',
        MAX: 'flex-end',
        BASELINE: 'baseline',
    };
    return map[align] ?? 'stretch';
}

/**
 * Primary Axis Align 매핑
 */
function mapPrimaryAxisAlign(align: string): string {
    const map: Record<string, string> = {
        MIN: 'flex-start',
        CENTER: 'center',
        MAX: 'flex-end',
        SPACE_BETWEEN: 'space-between',
    };
    return map[align] ?? 'flex-start';
}
