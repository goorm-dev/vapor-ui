import { calc } from '@vanilla-extract/css-utils';
import { createRainbowSprinkles, defineProperties } from 'rainbow-sprinkles';

import { layers } from './layers.css';
import { vars } from './themes.css';

const spaceTokens = vars.size.space;
type SpaceKey = keyof typeof spaceTokens;

const negativeSpaces = Object.keys(spaceTokens).reduce(
    (acc, key) => {
        const spaceKey = key as SpaceKey;
        const negativeKey = `-${key}` as `-${SpaceKey}`;

        return {
            ...acc,
            [negativeKey]: `${calc(spaceTokens[spaceKey]).negate()}`,
        };
    },
    {} as Record<`-${SpaceKey}`, string>,
);

const marginTokens = { ...spaceTokens, ...negativeSpaces };
const dimensionTokens = vars.size.dimension;
const borderRadiusTokens = vars.size.borderRadius;
const boxShadowTokens = vars.shadow;

const { foreground, border, black, white, ...colors } = vars.color;

const basicColorTokens = {
    // Blue colors with prefix
    'basic-blue-050': colors.blue['050'],
    'basic-blue-100': colors.blue['100'],
    'basic-blue-200': colors.blue['200'],
    'basic-blue-300': colors.blue['300'],
    'basic-blue-400': colors.blue['400'],
    'basic-blue-500': colors.blue['500'],
    'basic-blue-600': colors.blue['600'],
    'basic-blue-700': colors.blue['700'],
    'basic-blue-800': colors.blue['800'],
    'basic-blue-900': colors.blue['900'],

    // Cyan colors with prefix
    'basic-cyan-050': colors.cyan['050'],
    'basic-cyan-100': colors.cyan['100'],
    'basic-cyan-200': colors.cyan['200'],
    'basic-cyan-300': colors.cyan['300'],
    'basic-cyan-400': colors.cyan['400'],
    'basic-cyan-500': colors.cyan['500'],
    'basic-cyan-600': colors.cyan['600'],
    'basic-cyan-700': colors.cyan['700'],
    'basic-cyan-800': colors.cyan['800'],
    'basic-cyan-900': colors.cyan['900'],

    // Grape colors with prefix
    'basic-grape-050': colors.grape['050'],
    'basic-grape-100': colors.grape['100'],
    'basic-grape-200': colors.grape['200'],
    'basic-grape-300': colors.grape['300'],
    'basic-grape-400': colors.grape['400'],
    'basic-grape-500': colors.grape['500'],
    'basic-grape-600': colors.grape['600'],
    'basic-grape-700': colors.grape['700'],
    'basic-grape-800': colors.grape['800'],
    'basic-grape-900': colors.grape['900'],

    // Gray colors with prefix
    'basic-gray-050': colors.gray['050'],
    'basic-gray-100': colors.gray['100'],
    'basic-gray-200': colors.gray['200'],
    'basic-gray-300': colors.gray['300'],
    'basic-gray-400': colors.gray['400'],
    'basic-gray-500': colors.gray['500'],
    'basic-gray-600': colors.gray['600'],
    'basic-gray-700': colors.gray['700'],
    'basic-gray-800': colors.gray['800'],
    'basic-gray-900': colors.gray['900'],

    // Green colors with prefix
    'basic-green-050': colors.green['050'],
    'basic-green-100': colors.green['100'],
    'basic-green-200': colors.green['200'],
    'basic-green-300': colors.green['300'],
    'basic-green-400': colors.green['400'],
    'basic-green-500': colors.green['500'],
    'basic-green-600': colors.green['600'],
    'basic-green-700': colors.green['700'],
    'basic-green-800': colors.green['800'],
    'basic-green-900': colors.green['900'],

    // Lime colors with prefix
    'basic-lime-050': colors.lime['050'],
    'basic-lime-100': colors.lime['100'],
    'basic-lime-200': colors.lime['200'],
    'basic-lime-300': colors.lime['300'],
    'basic-lime-400': colors.lime['400'],
    'basic-lime-500': colors.lime['500'],
    'basic-lime-600': colors.lime['600'],
    'basic-lime-700': colors.lime['700'],
    'basic-lime-800': colors.lime['800'],
    'basic-lime-900': colors.lime['900'],

    // Orange colors with prefix
    'basic-orange-050': colors.orange['050'],
    'basic-orange-100': colors.orange['100'],
    'basic-orange-200': colors.orange['200'],
    'basic-orange-300': colors.orange['300'],
    'basic-orange-400': colors.orange['400'],
    'basic-orange-500': colors.orange['500'],
    'basic-orange-600': colors.orange['600'],
    'basic-orange-700': colors.orange['700'],
    'basic-orange-800': colors.orange['800'],
    'basic-orange-900': colors.orange['900'],

    // Pink colors with prefix
    'basic-pink-050': colors.pink['050'],
    'basic-pink-100': colors.pink['100'],
    'basic-pink-200': colors.pink['200'],
    'basic-pink-300': colors.pink['300'],
    'basic-pink-400': colors.pink['400'],
    'basic-pink-500': colors.pink['500'],
    'basic-pink-600': colors.pink['600'],
    'basic-pink-700': colors.pink['700'],
    'basic-pink-800': colors.pink['800'],
    'basic-pink-900': colors.pink['900'],

    // Red colors with prefix
    'basic-red-050': colors.red['050'],
    'basic-red-100': colors.red['100'],
    'basic-red-200': colors.red['200'],
    'basic-red-300': colors.red['300'],
    'basic-red-400': colors.red['400'],
    'basic-red-500': colors.red['500'],
    'basic-red-600': colors.red['600'],
    'basic-red-700': colors.red['700'],
    'basic-red-800': colors.red['800'],
    'basic-red-900': colors.red['900'],

    // Violet colors with prefix
    'basic-violet-050': colors.violet['050'],
    'basic-violet-100': colors.violet['100'],
    'basic-violet-200': colors.violet['200'],
    'basic-violet-300': colors.violet['300'],
    'basic-violet-400': colors.violet['400'],
    'basic-violet-500': colors.violet['500'],
    'basic-violet-600': colors.violet['600'],
    'basic-violet-700': colors.violet['700'],
    'basic-violet-800': colors.violet['800'],
    'basic-violet-900': colors.violet['900'],

    // Yellow colors with prefix
    'basic-yellow-050': colors.yellow['050'],
    'basic-yellow-100': colors.yellow['100'],
    'basic-yellow-200': colors.yellow['200'],
    'basic-yellow-300': colors.yellow['300'],
    'basic-yellow-400': colors.yellow['400'],
    'basic-yellow-500': colors.yellow['500'],
    'basic-yellow-600': colors.yellow['600'],
    'basic-yellow-700': colors.yellow['700'],
    'basic-yellow-800': colors.yellow['800'],
    'basic-yellow-900': colors.yellow['900'],

    // Base colors
    'basic-black': black,
    'basic-white': white,
};

const backgroundColorTokens = {
    ...basicColorTokens,

    // Background colors
    'bg-primary-100': colors.background.primary[100],
    'bg-primary-200': colors.background.primary[200],
    'bg-secondary-100': colors.background.secondary[100],
    'bg-success-100': colors.background.success[100],
    'bg-success-200': colors.background.success[200],
    'bg-warning-100': colors.background.warning[100],
    'bg-warning-200': colors.background.warning[200],
    'bg-danger-100': colors.background.danger[100],
    'bg-danger-200': colors.background.danger[200],
    'bg-hint-100': colors.background.hint[100],
    'bg-hint-200': colors.background.hint[200],
    'bg-contrast-100': colors.background.contrast[100],
    'bg-contrast-200': colors.background.contrast[200],
    'bg-canvas-100': colors.background.canvas[100],
    'bg-canvas-200': colors.background.canvas[200],
    'bg-overlay-100': colors.background.overlay[100],
};

const colorTokens = {
    ...basicColorTokens,

    'fg-primary-100': foreground.primary[100],
    'fg-primary-200': foreground.primary[200],
    'fg-secondary-100': foreground.secondary[100],
    'fg-secondary-200': foreground.secondary[200],
    'fg-success-100': foreground.success[100],
    'fg-success-200': foreground.success[200],
    'fg-warning-100': foreground.warning[100],
    'fg-warning-200': foreground.warning[200],
    'fg-danger-100': foreground.danger[100],
    'fg-danger-200': foreground.danger[200],
    'fg-hint-100': foreground.hint[100],
    'fg-hint-200': foreground.hint[200],
    'fg-contrast-100': foreground.contrast[100],
    'fg-contrast-200': foreground.contrast[200],
    'fg-normal-100': foreground.normal[100],
    'fg-normal-200': foreground.normal[200],
    'fg-inverse': foreground.inverse,
};

const borderColorTokens = {
    ...basicColorTokens,

    'border-primary': border.primary,
    'border-secondary': border.secondary,
    'border-success': border.success,
    'border-warning': border.warning,
    'border-danger': border.danger,
    'border-contrast': border.contrast,
    'border-hint': border.hint,
    'border-normal': border.normal,
};

const sprinkleProperties = defineProperties({
    '@layer': layers.utilities,

    defaultCondition: 'lg',
    conditions: {
        // breakpoints
        // '@media': `screen and (max-width: env(--mobile))`,
        sm: { '@media': `screen and (max-width: 767px)` },
        // '@media': `screen and (max-width: env(--tablet))`,
        md: { '@media': `screen and (max-width: 1024px)` },
        lg: {},

        // states
        _before: { selector: '&::before' },
        _after: { selector: '&::after' },
        _hover: { '@media': '(hover: hover)', selector: '&:hover' },
        _focus: { selector: '&:focus' },
        _focusVisible: { selector: '&:focus-visible' },
        _focusWithin: { selector: '&:focus-within' },
        // _selected: { selector: '&:active' },
        // _checked: { selector: '&:checked, &[data-checked]' },
        // _indeterminate: { selector: '&:indeterminate, &[data-indeterminate]' },
        // _disabled: { selector: '&:disabled, &[data-disabled]' },
        // _readonly: { selector: '&:readonly, &[data-readonly]' },
        // _required: { selector: '&:required, &[data-required]' },
        // _invalid: { selector: '&:invalid, &[data-invalid]' },
    },

    dynamicProperties: {
        // Composition and Blending
        backgroundBlendMode: true,
        isolation: true,
        mixBlendMode: true,

        // CSS Animations
        animation: true,
        animationDelay: true,
        animationDirection: true,
        animationDuration: true,
        animationFillMode: true,
        animationIterationCount: true,
        animationName: true,
        animationPlayState: true,
        animationTimingFunction: true,

        // CSS Backgrounds and Borders
        background: true,
        backgroundAttachment: true,
        backgroundClip: true,
        backgroundColor: backgroundColorTokens,
        backgroundImage: true,
        backgroundOrigin: true,
        backgroundRepeat: true,
        backgroundSize: true,
        backgroundPosition: true,
        border: true, // OF SHORTHANDS!
        borderColor: borderColorTokens,
        borderStyle: true,
        borderWidth: true,
        borderBlock: true,
        borderBlockColor: borderColorTokens,
        borderBlockStyle: true,
        borderBlockWidth: true,
        borderBlockStart: true,
        borderTop: true,
        borderBlockStartColor: borderColorTokens,
        borderTopColor: borderColorTokens,
        borderBlockStartStyle: true,
        borderTopStyle: true,
        borderBlockStartWidth: true,
        borderTopWidth: true,
        borderBlockEnd: true,
        borderBottom: true,
        borderBlockEndColor: borderColorTokens,
        borderBottomColor: borderColorTokens,
        borderBlockEndStyle: true,
        borderBottomStyle: true,
        borderBlockEndWidth: true,
        borderBottomWidth: true,
        borderInline: true,
        borderInlineColor: borderColorTokens,
        borderInlineStyle: true,
        borderInlineWidth: true,
        borderInlineStart: true,
        borderLeft: true,
        borderInlineStartColor: borderColorTokens,
        borderLeftColor: borderColorTokens,
        borderInlineStartStyle: true,
        borderLeftStyle: true,
        borderInlineStartWidth: true,
        borderLeftWidth: true,
        borderInlineEnd: true,
        borderRight: true,
        borderInlineEndColor: borderColorTokens,
        borderRightColor: borderColorTokens,
        borderInlineEndStyle: true,
        borderRightStyle: true,
        borderInlineEndWidth: true,
        borderRightWidth: true,
        borderRadius: borderRadiusTokens,
        borderStartEndRadius: borderRadiusTokens,
        borderStartStartRadius: borderRadiusTokens,
        borderEndEndRadius: borderRadiusTokens,
        borderEndStartRadius: borderRadiusTokens,
        borderTopLeftRadius: borderRadiusTokens,
        borderTopRightRadius: borderRadiusTokens,
        borderBottomLeftRadius: borderRadiusTokens,
        borderBottomRightRadius: borderRadiusTokens,
        boxShadow: boxShadowTokens,

        // CSS Basic User Interface
        // accentColor: true, // NOTE: supported in tailwindcss
        appearance: true,
        aspectRatio: true,
        caretColor: colorTokens,
        cursor: true,
        outline: true,
        outlineColor: borderColorTokens,
        outlineOffset: true,
        outlineStyle: true,
        outlineWidth: true,
        pointerEvents: true,
        resize: true, // horizontal, vertical, block, inline, both
        textOverflow: true,
        userSelect: true,

        // CSS Box Alignment
        gridGap: spaceTokens, // alias for `gap`
        gap: spaceTokens,
        gridRowGap: spaceTokens,
        rowGap: spaceTokens,
        gridColumnGap: spaceTokens,
        columnGap: spaceTokens,
        placeContent: true,
        alignContent: true,
        justifyContent: true,
        placeItems: true,
        alignItems: true,
        justifyItems: true,
        placeSelf: true,
        alignSelf: true,
        justifySelf: true,

        // CSS Box Model
        boxSizing: true,
        // fieldSizing: true,  // NOTE: supported in tailwindcss
        blockSize: dimensionTokens,
        height: dimensionTokens,
        inlineSize: dimensionTokens,
        width: dimensionTokens,
        maxBlockSize: dimensionTokens,
        maxHeight: dimensionTokens,
        maxInlineSize: dimensionTokens,
        maxWidth: dimensionTokens,
        minBlockSize: dimensionTokens,
        minHeight: dimensionTokens,
        minInlineSize: dimensionTokens,
        minWidth: dimensionTokens,
        margin: marginTokens,
        marginBlock: marginTokens,
        marginBlockStart: marginTokens,
        marginTop: marginTokens,
        marginBlockEnd: marginTokens,
        marginBottom: marginTokens,
        marginInline: marginTokens,
        marginInlineStart: marginTokens,
        marginLeft: marginTokens,
        marginInlineEnd: marginTokens,
        marginRight: marginTokens,
        marginTrim: marginTokens,
        overscrollBehavior: true,
        overscrollBehaviorBlock: true,
        overscrollBehaviorY: true,
        overscrollBehaviorInline: true,
        overscrollBehaviorX: true,
        padding: spaceTokens,
        paddingBlock: spaceTokens,
        paddingBlockStart: spaceTokens,
        paddingTop: spaceTokens,
        paddingBlockEnd: spaceTokens,
        paddingBottom: spaceTokens,
        paddingInline: spaceTokens,
        paddingInlineStart: spaceTokens,
        paddingLeft: spaceTokens,
        paddingInlineEnd: spaceTokens,
        paddingRight: spaceTokens,
        visibility: true,

        // CSS Color
        color: colorTokens,
        opacity: true,

        // CSS Columns
        columns: true,
        columnCount: true,
        columnWidth: true,
        columnFill: true,
        columnSpan: true,
        columnRule: true,
        columnRuleColor: true,
        columnRuleStyle: true,
        columnRuleWidth: true,

        // CSS Containment
        contain: true,
        contentVisibility: true,

        // CSS Counter Styles

        // CSS Display
        display: true,

        // CSS Flexible Box Layout
        flex: true,
        flexBasis: true,
        flexGrow: true,
        flexShrink: true,
        flexFlow: true,
        flexDirection: true,
        flexWrap: true,
        order: true,

        // CSS Fonts
        // NOTE: should apply font tokens for all components? Text components only?
        font: true,
        fontFamily: true,
        fontSize: true,
        fontStretch: true,
        fontStyle: true,
        fontWeight: true,
        lineHeight: true,
        fontVariant: true,
        fontVariantNumeric: true,
        fontSmooth: true, // Non-standard

        // CSS Fragmentation
        boxDecorationBreak: true,
        breakAfter: true,
        breakBefore: true,
        breakInside: true,

        // CSS Generated Content
        content: true,
        quotes: true,

        // CSS Grid Layout
        grid: true,
        gridAutoFlow: true,
        gridAutoRows: true,
        gridAutoColumns: true,
        gridTemplate: true,
        gridTemplateAreas: true,
        gridTemplateColumns: true,
        gridTemplateRows: true,
        gridArea: true,
        gridRow: true,
        gridRowStart: true,
        gridRowEnd: true,
        gridColumn: true,
        gridColumnStart: true,
        gridColumnEnd: true,

        // CSS Images
        imageRendering: true,
        objectFit: true,
        objectPosition: true,

        // CSS Inline

        // CSS Lists and Counters
        listStyle: true,
        listStyleImage: true,
        listStylePosition: true,
        listStyleType: true,

        // CSS Masking
        maskClip: true,
        maskComposite: true,
        maskImage: true,
        maskMode: true,
        maskOrigin: true,
        maskPosition: true,
        maskRepeat: true,
        maskSize: true,
        maskType: true,

        // CSS Miscellaneous
        all: true, // avoid!
        textRendering: true,

        // CSS Motion Path

        // CSS Overflow
        // WebkitBoxOrient: true,
        // WebkitLineClamp: true,
        lineClamp: true,
        overflow: true,
        overflowBlock: true,
        overflowY: true,
        overflowInline: true,
        overflowX: true,
        scrollBehavior: true,

        // CSS Pages

        // CSS Positioning
        inset: true,
        insetBlock: spaceTokens,
        insetBlockStart: spaceTokens,
        top: spaceTokens,
        insetBlockEnd: spaceTokens,
        bottom: spaceTokens,
        insetInline: spaceTokens,
        insetInlineStart: spaceTokens,
        left: spaceTokens,
        insetInlineEnd: spaceTokens,
        right: spaceTokens,
        clear: true,
        float: true,
        position: true,
        zIndex: true,

        // CSS Ruby

        // CSS Scroll Anchoring

        // CSS Scroll Snap
        scrollMargin: marginTokens,
        scrollMarginBlock: marginTokens,
        scrollMarginBlockStart: true,
        scrollMarginTop: true,
        scrollMarginBlockEnd: true,
        scrollMarginBottom: true,
        scrollMarginInline: marginTokens,
        scrollMarginInlineStart: true,
        scrollMarginLeft: true,
        scrollMarginInlineEnd: true,
        scrollMarginRight: true,
        scrollPadding: spaceTokens,
        scrollPaddingBlock: spaceTokens,
        scrollPaddingBlockStart: spaceTokens,
        scrollPaddingTop: spaceTokens,
        scrollPaddingBlockEnd: spaceTokens,
        scrollPaddingBottom: spaceTokens,
        scrollPaddingInline: spaceTokens,
        scrollPaddingInlineStart: spaceTokens,
        scrollPaddingLeft: spaceTokens,
        scrollPaddingInlineEnd: spaceTokens,
        scrollPaddingRight: spaceTokens,
        scrollSnapAlign: true,
        scrollSnapStop: true,
        scrollSnapType: true,

        // CSS Scrollbars

        // CSS Shapes

        // CSS Speech

        // CSS Table
        borderCollapse: true,
        borderSpacing: true,
        captionSide: true,
        emptyCells: true,
        tableLayout: true,
        verticalAlign: true,

        // CSS Text Decoration
        textDecoration: true,
        textDecorationColor: true,
        textDecorationLine: true,
        textDecorationStyle: true,
        textDecorationThickness: true,
        textShadow: true,
        textUnderlineOffset: true,
        textUnderlinePosition: true,

        // CSS Text
        hyphens: true,
        letterSpacing: true,
        overflowWrap: true,
        textAlign: true,
        textTransform: true,
        // textWrap: true,  // NOTE: supported in tailwindcss
        whiteSpace: true,
        wordBreak: true,
        wordSpacing: true,
        wordWrap: true,

        // CSS Transforms
        backfaceVisibility: true,
        perspective: true,
        perspectiveOrigin: true,
        rotate: true,
        scale: true,
        transform: true,
        transformOrigin: true,
        translate: true,

        // CSS Transitions
        transition: true,
        // transitionBehavior: true, // NOTE: supported in tailwindcss
        transitionDelay: true,
        transitionDuration: true,
        transitionProperty: true,
        transitionTimingFunction: true,

        // CSS View Transitions

        // CSS Will Change
        willChange: true,

        // CSS Writing Modes
        direction: true,

        // CSS Filter Effects
        backdropFilter: true,
        filter: true,

        // MathML

        // CSS Pointer Events
        touchAction: true,
    },

    // deprecated
    shorthands: {
        paddingX: ['paddingLeft', 'paddingRight'],
        paddingY: ['paddingTop', 'paddingBottom'],
        marginX: ['marginLeft', 'marginRight'],
        marginY: ['marginTop', 'marginBottom'],
    },
});

const deprecatedSprinkleProperties = defineProperties({
    '@layer': layers.utilities,

    defaultCondition: 'desktop',
    conditions: {
        mobile: {
            '@media': `screen and (max-width: 767px)`,
            // '@media': `screen and (max-width: env(--mobile))`,
        },
        tablet: {
            '@media': `screen and (max-width: 1024px)`,
            // '@media': `screen and (max-width: env(--tablet))`,
        },
        desktop: {},
    },

    dynamicProperties: {
        // Layout
        position: true,
        display: true,

        // Flexbox
        alignItems: true,
        justifyContent: true,
        flexDirection: true,
        gap: spaceTokens,

        // Alignment
        alignContent: true,

        // Spacing
        padding: spaceTokens,
        paddingTop: spaceTokens,
        paddingBottom: spaceTokens,
        paddingLeft: spaceTokens,
        paddingRight: spaceTokens,
        margin: marginTokens,
        marginTop: marginTokens,
        marginBottom: marginTokens,
        marginLeft: marginTokens,
        marginRight: marginTokens,

        // Dimensions
        width: dimensionTokens,
        height: dimensionTokens,
        minWidth: dimensionTokens,
        minHeight: dimensionTokens,
        maxWidth: dimensionTokens,
        maxHeight: dimensionTokens,

        // Visual
        border: true,
        borderColor: borderColorTokens,
        borderRadius: borderRadiusTokens,
        backgroundColor: backgroundColorTokens,
        color: colorTokens,
        opacity: true,

        // Behavior
        pointerEvents: true,
        overflow: true,
        textAlign: true,
    },

    shorthands: {
        paddingX: ['paddingLeft', 'paddingRight'],
        paddingY: ['paddingTop', 'paddingBottom'],
        marginX: ['marginLeft', 'marginRight'],
        marginY: ['marginTop', 'marginBottom'],
    },
});

export const sprinkles = createRainbowSprinkles(sprinkleProperties);
export type Sprinkles = Parameters<typeof sprinkles>[0];

// deprecated
export const deprecatedSprinkles = createRainbowSprinkles(deprecatedSprinkleProperties);
export type DeprecatedSprinkles = Parameters<typeof deprecatedSprinkles>[0];
