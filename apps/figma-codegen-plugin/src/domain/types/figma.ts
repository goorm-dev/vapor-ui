/**
 * Figma 노드 타입 정의
 *
 * Figma Plugin API의 노드 구조를 타입으로 정의합니다.
 */

export type NodeType =
    | 'COMPONENT'
    | 'INSTANCE'
    | 'FRAME'
    | 'TEXT'
    | 'VECTOR'
    | 'GROUP'
    | 'RECTANGLE'
    | 'ELLIPSE'
    | 'LINE'
    | 'STAR';

export interface ComponentProperties {
    [key: string]: {
        type: 'VARIANT' | 'INSTANCE_SWAP' | 'TEXT' | 'BOOLEAN';
        value: string | boolean;
    };
}

export interface Paint {
    type: 'SOLID' | 'IMAGE' | 'GRADIENT_LINEAR' | 'GRADIENT_RADIAL';
    visible: boolean;
    opacity?: number;
    color?: RGB;
    boundVariables?: {
        color?: VariableAlias;
    };
}

export interface RGB {
    r: number;
    g: number;
    b: number;
}

export interface VariableAlias {
    type: 'VARIABLE_ALIAS';
    id: string;
}

export interface Effect {
    type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR';
    visible: boolean;
    radius?: number;
    color?: RGBA;
    offset?: { x: number; y: number };
    spread?: number;
}

export interface RGBA extends RGB {
    a: number;
}

export interface LineHeight {
    unit: 'PIXELS' | 'PERCENT' | 'AUTO';
    value: number;
}

export interface FigmaNode {
    id: string;
    name: string;
    type: NodeType;
    visible: boolean;
    children?: FigmaNode[];

    // InstanceNode 전용
    componentProperties?: ComponentProperties;
    mainComponent?: ComponentNode;

    // Layout (Auto Layout)
    layoutMode?: 'HORIZONTAL' | 'VERTICAL' | 'NONE' | 'GRID';
    primaryAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'SPACE_BETWEEN';
    counterAxisAlignItems?: 'MIN' | 'MAX' | 'CENTER' | 'BASELINE';
    itemSpacing?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
    layoutGrow?: number;
    layoutAlign?: 'INHERIT' | 'STRETCH' | 'MIN' | 'CENTER' | 'MAX';

    // Dimensions
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;

    // Style
    fills?: Paint[];
    strokes?: Paint[];
    effects?: Effect[];
    opacity?: number;
    cornerRadius?: number;
    strokeWeight?: number;

    // Text
    characters?: string;
    fontSize?: number;
    fontWeight?: number;
    lineHeight?: LineHeight;
    textAlignHorizontal?: 'LEFT' | 'CENTER' | 'RIGHT' | 'JUSTIFIED';
    fontFamily?: string;
    letterSpacing?: { unit: string; value: number };
}

export interface ComponentNode {
    id: string;
    name: string;
    key: string;
    description?: string;
}
