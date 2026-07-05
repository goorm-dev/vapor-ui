import type {
    BorderRadiusToken,
    ColorToken,
    DimensionToken,
    ShadowToken,
    SpaceToken,
} from '@vapor-ui/tokens';
import type * as CSS from 'csstype';

export type StyleTokenValue = `$${string}`;

export type PseudoCondition =
    | '_before'
    | '_after'
    | '_hover'
    | '_focus'
    | '_focusVisible'
    | '_focusWithin'
    | '_active';

export type BreakpointCondition = 'sm' | 'md' | 'lg';

export type ConditionKey = 'default' | BreakpointCondition | PseudoCondition | `@media ${string}`;

export type ConditionRecord<V> = Partial<Record<ConditionKey, V>>;

type V<T> = T | ConditionRecord<T>;

type SpaceValue = SpaceToken | CSS.Property.Padding;
type DimensionValue = DimensionToken | CSS.Property.Width;
type ColorValue = ColorToken | CSS.Property.Color;
type BorderRadiusValue = BorderRadiusToken | CSS.Property.BorderRadius;
type ShadowValue = ShadowToken | CSS.Property.BoxShadow;

export interface StyleInput {
    all?: V<CSS.Property.All>;

    // ── Space (padding) ────────────────────────────────────────────
    padding?: V<SpaceValue>;
    paddingTop?: V<SpaceValue>;
    paddingBottom?: V<SpaceValue>;
    paddingLeft?: V<SpaceValue>;
    paddingRight?: V<SpaceValue>;
    paddingInline?: V<SpaceValue>;
    paddingInlineStart?: V<SpaceValue>;
    paddingInlineEnd?: V<SpaceValue>;
    paddingBlock?: V<SpaceValue>;
    paddingBlockStart?: V<SpaceValue>;
    paddingBlockEnd?: V<SpaceValue>;
    paddingX?: V<SpaceValue>;
    paddingY?: V<SpaceValue>;

    // ── Space (margin) ─────────────────────────────────────────────
    margin?: V<SpaceValue>;
    marginTop?: V<SpaceValue>;
    marginBottom?: V<SpaceValue>;
    marginLeft?: V<SpaceValue>;
    marginRight?: V<SpaceValue>;
    marginInline?: V<SpaceValue>;
    marginInlineStart?: V<SpaceValue>;
    marginInlineEnd?: V<SpaceValue>;
    marginBlock?: V<SpaceValue>;
    marginBlockStart?: V<SpaceValue>;
    marginBlockEnd?: V<SpaceValue>;
    marginX?: V<SpaceValue>;
    marginY?: V<SpaceValue>;

    // ── Space (gap) ────────────────────────────────────────────────
    gap?: V<SpaceValue>;
    rowGap?: V<SpaceValue>;
    columnGap?: V<SpaceValue>;

    // ── Dimension ──────────────────────────────────────────────────
    width?: V<DimensionValue>;
    height?: V<DimensionValue>;
    minWidth?: V<DimensionValue>;
    minHeight?: V<DimensionValue>;
    maxWidth?: V<DimensionValue>;
    maxHeight?: V<DimensionValue>;
    inlineSize?: V<DimensionValue>;
    blockSize?: V<DimensionValue>;

    // ── Color ──────────────────────────────────────────────────────
    color?: V<ColorValue>;
    backgroundColor?: V<ColorValue>;
    background?: V<CSS.Property.Background>;
    borderColor?: V<ColorValue>;
    borderTopColor?: V<ColorValue>;
    borderBottomColor?: V<ColorValue>;
    borderLeftColor?: V<ColorValue>;
    borderRightColor?: V<ColorValue>;
    outlineColor?: V<ColorValue>;
    caretColor?: V<ColorValue>;
    fill?: V<ColorValue>;
    stroke?: V<ColorValue>;

    // ── Border / radius ────────────────────────────────────────────
    border?: V<CSS.Property.Border>;
    borderTop?: V<CSS.Property.BorderTop>;
    borderBottom?: V<CSS.Property.BorderBottom>;
    borderLeft?: V<CSS.Property.BorderLeft>;
    borderRight?: V<CSS.Property.BorderRight>;
    borderWidth?: V<CSS.Property.BorderWidth>;
    borderStyle?: V<CSS.Property.BorderStyle>;
    borderRadius?: V<BorderRadiusValue>;
    borderTopLeftRadius?: V<BorderRadiusValue>;
    borderTopRightRadius?: V<BorderRadiusValue>;
    borderBottomLeftRadius?: V<BorderRadiusValue>;
    borderBottomRightRadius?: V<BorderRadiusValue>;

    // ── Shadow ─────────────────────────────────────────────────────
    boxShadow?: V<ShadowValue>;
    textShadow?: V<CSS.Property.TextShadow>;

    // ── Layout ─────────────────────────────────────────────────────
    display?: V<CSS.Property.Display>;
    position?: V<CSS.Property.Position>;
    top?: V<CSS.Property.Top>;
    right?: V<CSS.Property.Right>;
    bottom?: V<CSS.Property.Bottom>;
    left?: V<CSS.Property.Left>;
    inset?: V<CSS.Property.Inset>;
    zIndex?: V<CSS.Property.ZIndex>;
    overflow?: V<CSS.Property.Overflow>;
    overflowX?: V<CSS.Property.OverflowX>;
    overflowY?: V<CSS.Property.OverflowY>;
    visibility?: V<CSS.Property.Visibility>;
    isolation?: V<CSS.Property.Isolation>;

    // ── Flex / Grid ────────────────────────────────────────────────
    flex?: V<CSS.Property.Flex>;
    flexBasis?: V<CSS.Property.FlexBasis>;
    flexDirection?: V<CSS.Property.FlexDirection>;
    flexGrow?: V<CSS.Property.FlexGrow>;
    flexShrink?: V<CSS.Property.FlexShrink>;
    flexWrap?: V<CSS.Property.FlexWrap>;
    alignItems?: V<CSS.Property.AlignItems>;
    alignContent?: V<CSS.Property.AlignContent>;
    alignSelf?: V<CSS.Property.AlignSelf>;
    justifyItems?: V<CSS.Property.JustifyItems>;
    justifyContent?: V<CSS.Property.JustifyContent>;
    justifySelf?: V<CSS.Property.JustifySelf>;
    placeContent?: V<CSS.Property.PlaceContent>;
    placeItems?: V<CSS.Property.PlaceItems>;
    placeSelf?: V<CSS.Property.PlaceSelf>;
    order?: V<CSS.Property.Order>;
    grid?: V<CSS.Property.Grid>;
    gridArea?: V<CSS.Property.GridArea>;
    gridAutoColumns?: V<CSS.Property.GridAutoColumns>;
    gridAutoFlow?: V<CSS.Property.GridAutoFlow>;
    gridAutoRows?: V<CSS.Property.GridAutoRows>;
    gridColumn?: V<CSS.Property.GridColumn>;
    gridColumnEnd?: V<CSS.Property.GridColumnEnd>;
    gridColumnStart?: V<CSS.Property.GridColumnStart>;
    gridRow?: V<CSS.Property.GridRow>;
    gridRowEnd?: V<CSS.Property.GridRowEnd>;
    gridRowStart?: V<CSS.Property.GridRowStart>;
    gridTemplate?: V<CSS.Property.GridTemplate>;
    gridTemplateAreas?: V<CSS.Property.GridTemplateAreas>;
    gridTemplateColumns?: V<CSS.Property.GridTemplateColumns>;
    gridTemplateRows?: V<CSS.Property.GridTemplateRows>;

    // ── Typography ─────────────────────────────────────────────────
    fontFamily?: V<CSS.Property.FontFamily>;
    fontSize?: V<CSS.Property.FontSize>;
    fontStyle?: V<CSS.Property.FontStyle>;
    fontWeight?: V<CSS.Property.FontWeight>;
    fontVariant?: V<CSS.Property.FontVariant>;
    lineHeight?: V<CSS.Property.LineHeight>;
    letterSpacing?: V<CSS.Property.LetterSpacing>;
    wordSpacing?: V<CSS.Property.WordSpacing>;
    textAlign?: V<CSS.Property.TextAlign>;
    textDecoration?: V<CSS.Property.TextDecoration>;
    textTransform?: V<CSS.Property.TextTransform>;
    textOverflow?: V<CSS.Property.TextOverflow>;
    whiteSpace?: V<CSS.Property.WhiteSpace>;
    wordBreak?: V<CSS.Property.WordBreak>;
    overflowWrap?: V<CSS.Property.OverflowWrap>;
    verticalAlign?: V<CSS.Property.VerticalAlign>;

    // ── Effects / transform ────────────────────────────────────────
    opacity?: V<CSS.Property.Opacity>;
    transform?: V<CSS.Property.Transform>;
    transformOrigin?: V<CSS.Property.TransformOrigin>;
    transition?: V<CSS.Property.Transition>;
    transitionDelay?: V<CSS.Property.TransitionDelay>;
    transitionDuration?: V<CSS.Property.TransitionDuration>;
    transitionProperty?: V<CSS.Property.TransitionProperty>;
    transitionTimingFunction?: V<CSS.Property.TransitionTimingFunction>;
    animation?: V<CSS.Property.Animation>;
    filter?: V<CSS.Property.Filter>;
    backdropFilter?: V<CSS.Property.BackdropFilter>;
    mixBlendMode?: V<CSS.Property.MixBlendMode>;
    cursor?: V<CSS.Property.Cursor>;
    pointerEvents?: V<CSS.Property.PointerEvents>;
    userSelect?: V<CSS.Property.UserSelect>;

    // ── Background / image ─────────────────────────────────────────
    backgroundImage?: V<CSS.Property.BackgroundImage>;
    backgroundPosition?: V<CSS.Property.BackgroundPosition>;
    backgroundRepeat?: V<CSS.Property.BackgroundRepeat>;
    backgroundSize?: V<CSS.Property.BackgroundSize>;
    backgroundAttachment?: V<CSS.Property.BackgroundAttachment>;
    backgroundOrigin?: V<CSS.Property.BackgroundOrigin>;
    backgroundClip?: V<CSS.Property.BackgroundClip>;
    objectFit?: V<CSS.Property.ObjectFit>;
    objectPosition?: V<CSS.Property.ObjectPosition>;
    aspectRatio?: V<CSS.Property.AspectRatio>;
}

export type SpaceProperty = Extract<
    keyof StyleInput,
    | 'padding'
    | 'paddingTop'
    | 'paddingBottom'
    | 'paddingLeft'
    | 'paddingRight'
    | 'paddingX'
    | 'paddingY'
    | 'margin'
    | 'marginTop'
    | 'marginBottom'
    | 'marginLeft'
    | 'marginRight'
    | 'marginX'
    | 'marginY'
    | 'gap'
    | 'rowGap'
    | 'columnGap'
>;

export type DimensionProperty = Extract<
    keyof StyleInput,
    'width' | 'height' | 'minWidth' | 'minHeight' | 'maxWidth' | 'maxHeight'
>;

export type ColorProperty = Extract<keyof StyleInput, 'color' | 'backgroundColor' | 'borderColor'>;
export type BorderRadiusProperty = Extract<keyof StyleInput, 'borderRadius'>;
export type ShadowProperty = Extract<keyof StyleInput, 'boxShadow'>;

export type SupportedProperty = keyof StyleInput;
export type StyleValue = string | number;

export type { ColorToken, SpaceToken, DimensionToken, BorderRadiusToken, ShadowToken };

/**
 * Build-time macro. `@vapor-ui/style-macro/unplugin` rewrites every call site of this
 * function into a literal class-name string and emits the corresponding atomic CSS.
 *
 * If you see this body executing at runtime, the macro is not configured in your
 * bundler — install `@vapor-ui/style-macro/unplugin` per the migration guide.
 */
export function $style(_input: StyleInput): string {
    if (
        typeof console !== 'undefined' &&
        typeof process !== 'undefined' &&
        process.env?.NODE_ENV !== 'production'
    ) {
        console.warn(
            '[@vapor-ui/style-macro] $style was called at runtime — your bundler is missing @vapor-ui/style-macro/unplugin. Returning empty string.',
        );
    }
    return '';
}
