/**
 * Vapor-UI 컴포넌트 타입 정의
 *
 * Vapor-UI 디자인 시스템의 컴포넌트 Props 및 토큰 타입
 */

/**
 * Space Tokens
 * Spacing(gap, padding, margin)에 사용되는 토큰
 */
export type SpaceToken =
    | '$000'
    | '$025'
    | '$050'
    | '$075'
    | '$100'
    | '$150'
    | '$175'
    | '$200'
    | '$225'
    | '$250'
    | '$300'
    | '$400'
    | '$500'
    | '$600'
    | '$700'
    | '$800'
    | '$900';

/**
 * Negative Space Tokens (margin 전용)
 */
export type NegativeSpaceToken =
    | '-$025'
    | '-$050'
    | '-$075'
    | '-$100'
    | '-$150'
    | '-$175'
    | '-$200'
    | '-$225'
    | '-$250'
    | '-$300'
    | '-$400'
    | '-$500'
    | '-$600'
    | '-$700'
    | '-$800'
    | '-$900';

/**
 * Dimension Tokens
 * width, height 등에 사용되는 토큰
 */
export type DimensionToken =
    | '$025'
    | '$050'
    | '$075'
    | '$100'
    | '$150'
    | '$175'
    | '$200'
    | '$225'
    | '$250'
    | '$300'
    | '$400'
    | '$500'
    | '$600'
    | '$700'
    | '$800';

/**
 * Radius Tokens
 * borderRadius에 사용되는 토큰
 */
export type RadiusToken =
    | '$000'
    | '$050'
    | '$100'
    | '$200'
    | '$300'
    | '$400'
    | '$500'
    | '$600'
    | '$700'
    | '$800'
    | '$900';

/**
 * Background Color Tokens
 */
export type BackgroundColorToken =
    // Semantic
    | 'primary-100'
    | 'primary-200'
    | 'secondary-100'
    | 'success-100'
    | 'success-200'
    | 'warning-100'
    | 'warning-200'
    | 'danger-100'
    | 'danger-200'
    | 'hint-100'
    | 'hint-200'
    | 'contrast-100'
    | 'contrast-200'
    | 'canvas'
    | 'surface-100'
    | 'surface-200'
    // Primitives
    | `${'blue' | 'cyan' | 'grape' | 'green' | 'lime' | 'orange' | 'pink' | 'red'}-${
          | '050'
          | '100'
          | '150'
          | '200'
          | '250'
          | '300'
          | '350'
          | '400'
          | '450'
          | '500'
          | '550'
          | '600'
          | '650'
          | '700'
          | '750'
          | '800'
          | '850'
          | '900'}`
    | `gray-${'000' | '050' | '100' | '150' | '200' | '250' | '300' | '350' | '400' | '450' | '500' | '550' | '600' | '650' | '700' | '750' | '800' | '850' | '900' | '950'}`
    // Base
    | 'black'
    | 'white';

/**
 * Text Color Tokens
 */
export type TextColorToken =
    | 'primary-100'
    | 'primary-200'
    | 'secondary-100'
    | 'secondary-200'
    | 'success-100'
    | 'success-200'
    | 'warning-100'
    | 'warning-200'
    | 'danger-100'
    | 'danger-200'
    | 'hint-100'
    | 'hint-200'
    | 'contrast-100'
    | 'contrast-200'
    | 'normal-100'
    | 'normal-200'
    | 'button-primary';

/**
 * Border Color Tokens
 */
export type BorderColorToken =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'contrast'
    | 'hint'
    | 'normal';

/**
 * Sprinkles Props
 * Vapor-UI의 유틸리티 Props
 */
export interface SprinklesProps {
    // Layout
    position?: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky';
    display?: 'block' | 'inline' | 'inline-block' | 'flex' | 'inline-flex' | 'grid' | 'none';

    // Flexbox
    alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch' | 'baseline';
    justifyContent?:
        | 'flex-start'
        | 'center'
        | 'flex-end'
        | 'space-between'
        | 'space-around'
        | 'space-evenly';
    flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
    gap?: SpaceToken;

    // Spacing
    padding?: SpaceToken;
    paddingTop?: SpaceToken;
    paddingBottom?: SpaceToken;
    paddingLeft?: SpaceToken;
    paddingRight?: SpaceToken;
    paddingX?: SpaceToken;
    paddingY?: SpaceToken;

    margin?: SpaceToken | NegativeSpaceToken;
    marginTop?: SpaceToken | NegativeSpaceToken;
    marginBottom?: SpaceToken | NegativeSpaceToken;
    marginLeft?: SpaceToken | NegativeSpaceToken;
    marginRight?: SpaceToken | NegativeSpaceToken;
    marginX?: SpaceToken | NegativeSpaceToken;
    marginY?: SpaceToken | NegativeSpaceToken;

    // Dimensions
    width?: DimensionToken | string;
    height?: DimensionToken | string;
    minWidth?: DimensionToken | string;
    minHeight?: DimensionToken | string;
    maxWidth?: DimensionToken | string;
    maxHeight?: DimensionToken | string;

    // Visual
    border?: string;
    borderColor?: BorderColorToken;
    borderRadius?: RadiusToken;
    backgroundColor?: BackgroundColorToken;
    color?: TextColorToken;
    opacity?: number;

    // Behavior
    pointerEvents?: 'auto' | 'none';
    overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
    textAlign?: 'left' | 'center' | 'right' | 'justify';
}

/**
 * 컴포넌트별 Variant Props
 */
export interface ButtonProps {
    colorPalette?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'contrast';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'fill' | 'outline' | 'ghost';
    disabled?: boolean;
}

export interface BreadcrumbRootProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export interface BreadcrumbItemProps {
    current?: boolean;
}
