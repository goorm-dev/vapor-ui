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

const { foreground, border, black, white, ...colors } = vars.color;

const backgroundColorTokens = {
    // Background colors
    'primary-100': colors.background.primary[100],
    'primary-200': colors.background.primary[200],
    'secondary-100': colors.background.secondary[100],
    'success-100': colors.background.success[100],
    'success-200': colors.background.success[200],
    'warning-100': colors.background.warning[100],
    'warning-200': colors.background.warning[200],
    'danger-100': colors.background.danger[100],
    'danger-200': colors.background.danger[200],
    'hint-100': colors.background.hint[100],
    'hint-200': colors.background.hint[200],
    'contrast-100': colors.background.contrast[100],
    'contrast-200': colors.background.contrast[200],
    'canvas-100': colors.background.canvas[100],
    'canvas-200': colors.background.canvas[200],
    'overlay-100': colors.background.overlay[100],

    // Blue colors with prefix
    'blue-050': colors.blue['050'],
    'blue-100': colors.blue['100'],
    'blue-200': colors.blue['200'],
    'blue-300': colors.blue['300'],
    'blue-400': colors.blue['400'],
    'blue-500': colors.blue['500'],
    'blue-600': colors.blue['600'],
    'blue-700': colors.blue['700'],
    'blue-800': colors.blue['800'],
    'blue-900': colors.blue['900'],

    // Cyan colors with prefix
    'cyan-050': colors.cyan['050'],
    'cyan-100': colors.cyan['100'],
    'cyan-200': colors.cyan['200'],
    'cyan-300': colors.cyan['300'],
    'cyan-400': colors.cyan['400'],
    'cyan-500': colors.cyan['500'],
    'cyan-600': colors.cyan['600'],
    'cyan-700': colors.cyan['700'],
    'cyan-800': colors.cyan['800'],
    'cyan-900': colors.cyan['900'],

    // Grape colors with prefix
    'grape-050': colors.grape['050'],
    'grape-100': colors.grape['100'],
    'grape-200': colors.grape['200'],
    'grape-300': colors.grape['300'],
    'grape-400': colors.grape['400'],
    'grape-500': colors.grape['500'],
    'grape-600': colors.grape['600'],
    'grape-700': colors.grape['700'],
    'grape-800': colors.grape['800'],
    'grape-900': colors.grape['900'],

    // Gray colors with prefix
    'gray-050': colors.gray['050'],
    'gray-100': colors.gray['100'],
    'gray-200': colors.gray['200'],
    'gray-300': colors.gray['300'],
    'gray-400': colors.gray['400'],
    'gray-500': colors.gray['500'],
    'gray-600': colors.gray['600'],
    'gray-700': colors.gray['700'],
    'gray-800': colors.gray['800'],
    'gray-900': colors.gray['900'],

    // Green colors with prefix
    'green-050': colors.green['050'],
    'green-100': colors.green['100'],
    'green-200': colors.green['200'],
    'green-300': colors.green['300'],
    'green-400': colors.green['400'],
    'green-500': colors.green['500'],
    'green-600': colors.green['600'],
    'green-700': colors.green['700'],
    'green-800': colors.green['800'],
    'green-900': colors.green['900'],

    // Lime colors with prefix
    'lime-050': colors.lime['050'],
    'lime-100': colors.lime['100'],
    'lime-200': colors.lime['200'],
    'lime-300': colors.lime['300'],
    'lime-400': colors.lime['400'],
    'lime-500': colors.lime['500'],
    'lime-600': colors.lime['600'],
    'lime-700': colors.lime['700'],
    'lime-800': colors.lime['800'],
    'lime-900': colors.lime['900'],

    // Orange colors with prefix
    'orange-050': colors.orange['050'],
    'orange-100': colors.orange['100'],
    'orange-200': colors.orange['200'],
    'orange-300': colors.orange['300'],
    'orange-400': colors.orange['400'],
    'orange-500': colors.orange['500'],
    'orange-600': colors.orange['600'],
    'orange-700': colors.orange['700'],
    'orange-800': colors.orange['800'],
    'orange-900': colors.orange['900'],

    // Pink colors with prefix
    'pink-050': colors.pink['050'],
    'pink-100': colors.pink['100'],
    'pink-200': colors.pink['200'],
    'pink-300': colors.pink['300'],
    'pink-400': colors.pink['400'],
    'pink-500': colors.pink['500'],
    'pink-600': colors.pink['600'],
    'pink-700': colors.pink['700'],
    'pink-800': colors.pink['800'],
    'pink-900': colors.pink['900'],

    // Red colors with prefix
    'red-050': colors.red['050'],
    'red-100': colors.red['100'],
    'red-200': colors.red['200'],
    'red-300': colors.red['300'],
    'red-400': colors.red['400'],
    'red-500': colors.red['500'],
    'red-600': colors.red['600'],
    'red-700': colors.red['700'],
    'red-800': colors.red['800'],
    'red-900': colors.red['900'],

    // Violet colors with prefix
    'violet-050': colors.violet['050'],
    'violet-100': colors.violet['100'],
    'violet-200': colors.violet['200'],
    'violet-300': colors.violet['300'],
    'violet-400': colors.violet['400'],
    'violet-500': colors.violet['500'],
    'violet-600': colors.violet['600'],
    'violet-700': colors.violet['700'],
    'violet-800': colors.violet['800'],
    'violet-900': colors.violet['900'],

    // Yellow colors with prefix
    'yellow-050': colors.yellow['050'],
    'yellow-100': colors.yellow['100'],
    'yellow-200': colors.yellow['200'],
    'yellow-300': colors.yellow['300'],
    'yellow-400': colors.yellow['400'],
    'yellow-500': colors.yellow['500'],
    'yellow-600': colors.yellow['600'],
    'yellow-700': colors.yellow['700'],
    'yellow-800': colors.yellow['800'],
    'yellow-900': colors.yellow['900'],

    // Base colors
    black,
    white,
};

const colorTokens = {
    'primary-100': foreground.primary[100],
    'primary-200': foreground.primary[200],
    'secondary-100': foreground.secondary[100],
    'secondary-200': foreground.secondary[200],
    'success-100': foreground.success[100],
    'success-200': foreground.success[200],
    'warning-100': foreground.warning[100],
    'warning-200': foreground.warning[200],
    'danger-100': foreground.danger[100],
    'danger-200': foreground.danger[200],
    'hint-100': foreground.hint[100],
    'hint-200': foreground.hint[200],
    'contrast-100': foreground.contrast[100],
    'contrast-200': foreground.contrast[200],
    'normal-100': foreground.normal[100],
    'normal-200': foreground.normal[200],
    inverse: foreground.inverse,
};

const borderColorTokens = {
    primary: border.primary,
    secondary: border.secondary,
    success: border.success,
    warning: border.warning,
    danger: border.danger,
    contrast: border.contrast,
    hint: border.hint,
    normal: border.normal,
};

const sprinkleProperties = defineProperties({
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

    // Border Width는 토큰 안써도 되는지?
    // Accent Color 같은 건 어떤 토큰을 사용해야 할까?
    // Background Color, Border Color, Color는 모두 배타적인가?
    // Outline은 Border랑 동일하게 적용하면 되는건가?
    dynamicProperties: {
        // Composition and Blending
        backgroundBlendMode: true,
        isolation: true,
        mixBlendMode: true,

        // CSS Animations
        animation: true,
        // animationComposition: true,
        animationDelay: true,
        animationDirection: true,
        animationDuration: true,
        animationFillMode: true,
        animationIterationCount: true,
        animationName: true,
        animationPlayState: true,
        // animationRange: true,
        // animationRangeEnd: true,
        // animationRangeStart: true,
        animationTimingFunction: true,
        // animationTimeline: true,
        // scrollTimeline: true,
        // scrollTimelineAxis: true,
        // scrollTimelineName: true,
        // timelineScope: true,
        // viewTimeline: true,
        // viewTimelineAxis: true,
        // viewTimelineInset: true,
        // viewTimelineName: true,

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
        backgroundPositionX: true,
        backgroundPositionY: true,
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
        borderTopColor: true,
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
        borderImage: true,
        borderImageOutset: true,
        borderImageRepeat: true,
        borderImageSlice: true,
        borderImageSource: true,
        borderImageWidth: true,
        borderRadius: borderRadiusTokens,
        borderStartEndRadius: borderRadiusTokens,
        borderStartStartRadius: borderRadiusTokens,
        borderEndEndRadius: borderRadiusTokens,
        borderEndStartRadius: borderRadiusTokens,
        borderTopLeftRadius: borderRadiusTokens,
        borderTopRightRadius: borderRadiusTokens,
        borderBottomLeftRadius: borderRadiusTokens,
        borderBottomRightRadius: borderRadiusTokens,
        boxShadow: true,

        // CSS Basic User Interface
        // accentColor: true,
        appearance: true,
        aspectRatio: true,
        // caret: true,
        // caretColor: true,
        // caretShape: true,
        cursor: true,
        // imeMode: true,
        // inputSecurity: true,
        outline: true,
        outlineColor: true,
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
        // fieldSizing: true,
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
        colorScheme: true,
        forcedColorAdjust: true,
        opacity: true,
        // printColorAdjust: true,

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
        // containIntrinsicSize: true,
        // containIntrinsicBlockSize: true,
        // containIntrinsicWidth: true,
        // containIntrinsicHeight: true,
        // containIntrinsicInlineSize: true,
        // container: true,
        // containerName: true,
        // containerType: true,
        contentVisibility: true,

        // CSS Counter Styles
        counterIncrement: true,
        counterReset: true,
        counterSet: true,

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
        // fontVariantAlternates: true,
        fontVariantCaps: true,
        fontVariantEastAsian: true,
        // fontVariantEmoji: true,
        fontVariantLigatures: true,
        fontVariantNumeric: true,
        fontVariantPosition: true,
        fontFeatureSettings: true,
        fontKerning: true,
        fontLanguageOverride: true,
        fontOpticalSizing: true,
        // fontPalette: true,
        fontVariationSettings: true,
        fontSizeAdjust: true,
        fontSmooth: true, // Non-standard
        // fontSynthesisPosition: true,
        // fontSynthesisSmallCaps: true,
        // fontSynthesisStyle: true,
        // fontSynthesisWeight: true,
        fontSynthesis: true,
        lineHeightStep: true,

        // CSS Fragmentation
        boxDecorationBreak: true,
        breakAfter: true,
        breakBefore: true,
        breakInside: true,
        orphans: true,
        widows: true,

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
        alignTracks: true,
        justifyTracks: true,
        // masonryAutoFlow: true,

        // CSS Images
        imageOrientation: true,
        imageRendering: true,
        imageResolution: true,
        objectFit: true,
        objectPosition: true,

        // CSS Inline
        initialLetter: true,
        // initialLetterAlign: true,

        // CSS Lists and Counters
        listStyle: true,
        listStyleImage: true,
        listStylePosition: true,
        listStyleType: true,

        // CSS Masking
        clip: true,
        clipPath: true,
        mask: true,
        maskClip: true,
        maskComposite: true,
        maskImage: true,
        maskMode: true,
        maskOrigin: true,
        maskPosition: true,
        maskRepeat: true,
        maskSize: true,
        maskType: true,
        maskBorder: true,
        maskBorderMode: true,
        maskBorderOutset: true,
        maskBorderRepeat: true,
        maskBorderSlice: true,
        maskBorderSource: true,
        maskBorderWidth: true,

        // CSS Miscellaneous
        all: true, // avoid!
        textRendering: true,
        zoom: true,

        // CSS Motion Path
        offset: true,
        offsetAnchor: true,
        offsetDistance: true,
        offsetPath: true,
        // offsetPosition: true,
        offsetRotate: true,

        // CSS Overflow
        // WebkitBoxOrient: true,
        // WebkitLineClamp: true,
        lineClamp: true,
        maxLines: true,
        blockOverflow: true,
        overflow: true,
        overflowBlock: true,
        overflowY: true,
        overflowInline: true,
        overflowX: true,
        overflowClipMargin: true,
        // scrollGutter: true,
        scrollBehavior: true,

        // CSS Pages
        // page: true,
        pageBreakAfter: true,
        pageBreakBefore: true,
        pageBreakInside: true,

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
        // overlay: true,
        position: true,
        zIndex: true,

        // CSS Ruby
        rubyAlign: true,
        rubyMerge: true,
        rubyPosition: true,

        // CSS Scroll Anchoring
        overflowAnchor: true,

        // CSS Scroll Snap
        scrollMargin: true,
        scrollMarginBlock: true,
        scrollMarginBlockStart: true,
        scrollMarginTop: true,
        scrollMarginBlockEnd: true,
        scrollMarginBottom: true,
        scrollMarginInline: true,
        scrollMarginInlineStart: true,
        scrollMarginLeft: true,
        scrollMarginInlineEnd: true,
        scrollMarginRight: true,
        scrollPadding: true,
        scrollPaddingBlock: true,
        scrollPaddingBlockStart: true,
        scrollPaddingTop: true,
        scrollPaddingBlockEnd: true,
        scrollPaddingBottom: true,
        scrollPaddingInline: true,
        scrollPaddingInlineStart: true,
        scrollPaddingLeft: true,
        scrollPaddingInlineEnd: true,
        scrollPaddingRight: true,
        scrollSnapAlign: true,
        // scrollSnapCoordinat: true,
        // scrollSnapDestinatio: true,
        // scrollSnapPoints: true,
        // scrollSnapPoints: true,
        scrollSnapStop: true,
        scrollSnapType: true,
        // scrollSnapType: true,
        // scrollSnapType: true,

        // CSS Scrollbars
        scrollbarColor: true,
        scrollbarWidth: true,

        // CSS Shapes
        shapeImageThreshold: true,
        shapeMargin: true,
        shapeOutside: true,

        // CSS Speech
        // azimuth: true,

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
        textDecorationSkip: true,
        textDecorationSkipInk: true,
        textDecorationStyle: true,
        textDecorationThickness: true,
        // WebkitTextStroke: true,
        // WebkitTextStrokeColor: true,
        // WebkitTextStrokeWidth: true,
        // WebkitTextFillColor: true,
        textEmphasis: true,
        textEmphasisColor: true,
        textEmphasisPosition: true,
        textEmphasisStyle: true,
        textShadow: true,
        textUnderlineOffset: true,
        textUnderlinePosition: true,

        // CSS Text
        hangingPunctuation: true,
        // hyphenateCharacter: true,
        // hyphenateLimitChars: true,
        hyphens: true,
        letterSpacing: true,
        lineBreak: true,
        overflowWrap: true,
        paintOrder: true,
        tabSize: true,
        textAlign: true,
        textAlignLast: true,
        textIndent: true,
        textJustify: true,
        textSizeAdjust: true,
        textTransform: true,
        // textWrap: true,
        // textWrapMode: true,
        // textWrapStyle: true,
        whiteSpace: true,
        // whiteSpaceCollapse: true,
        // whiteSpaceTrim: true,
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
        transformBox: true,
        transformOrigin: true,
        transformStyle: true,
        translate: true,

        // CSS Transitions
        transition: true,
        // transitionBehavior: true,
        transitionDelay: true,
        transitionDuration: true,
        transitionProperty: true,
        transitionTimingFunction: true,

        // CSS View Transitions
        // viewTransitionName: true,

        // CSS Will Change
        willChange: true,

        // CSS Writing Modes
        direction: true,
        textCombineUpright: true,
        textOrientation: true,
        unicodeBidi: true,
        writingMode: true,

        // CSS Filter Effects
        backdropFilter: true,
        filter: true,

        // MathML
        // mathDepth: true,
        // mathShift: true,
        // mathStyle: true,

        // CSS Pointer Events
        touchAction: true,

        // // Layout
        // position: true,
        // display: true,

        // // Flexbox
        // alignItems: true,
        // justifyContent: true,
        // flexDirection: true,
        // gap: spaceTokens,

        // // Alignment
        // alignContent: true,

        // // Spacing
        // padding: spaceTokens,
        // paddingTop: spaceTokens,
        // paddingBottom: spaceTokens,
        // paddingLeft: spaceTokens,
        // paddingRight: spaceTokens,
        // margin: marginTokens,
        // marginTop: marginTokens,
        // marginBottom: marginTokens,
        // marginLeft: marginTokens,
        // marginRight: marginTokens,

        // // Dimensions
        // width: dimensionTokens,
        // height: dimensionTokens,
        // minWidth: dimensionTokens,
        // minHeight: dimensionTokens,
        // maxWidth: dimensionTokens,
        // maxHeight: dimensionTokens,

        // // Visual
        // border: true,
        // borderColor: borderColorTokens,
        // borderRadius: borderRadiusTokens,
        // backgroundColor: backgroundColorTokens,
        // color: colorTokens,
        // opacity: true,

        // // Behavior
        // pointerEvents: true,
        // overflow: true,
        // textAlign: true,
    },

    // shorthands: {
    //     paddingX: ['paddingLeft', 'paddingRight'],
    //     paddingY: ['paddingTop', 'paddingBottom'],
    //     marginX: ['marginLeft', 'marginRight'],
    //     marginY: ['marginTop', 'marginBottom'],
    // },
});

export const sprinkles = createRainbowSprinkles(sprinkleProperties);
export type Sprinkles = Parameters<typeof sprinkles>[0];
