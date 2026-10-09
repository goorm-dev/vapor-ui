export const propertyToTokenAxis = {
    color: 'color',
    caretColor: 'color',
    backgroundColor: 'backgroundColor',
    borderColor: 'borderColor',
    borderTopColor: 'borderColor',
    borderRightColor: 'borderColor',
    borderBottomColor: 'borderColor',
    borderLeftColor: 'borderColor',
    outlineColor: 'borderColor',

    padding: 'space',
    paddingTop: 'space',
    paddingRight: 'space',
    paddingBottom: 'space',
    paddingLeft: 'space',
    paddingInline: 'space',
    paddingBlock: 'space',
    paddingInlineStart: 'space',
    paddingInlineEnd: 'space',
    paddingBlockStart: 'space',
    paddingBlockEnd: 'space',
    gap: 'space',
    rowGap: 'space',
    columnGap: 'space',
    top: 'space',
    right: 'space',
    bottom: 'space',
    left: 'space',
    inset: 'space',
    insetInline: 'space',
    insetBlock: 'space',
    scrollPadding: 'space',
    scrollPaddingTop: 'space',
    scrollPaddingRight: 'space',
    scrollPaddingBottom: 'space',
    scrollPaddingLeft: 'space',

    margin: 'margin',
    marginTop: 'margin',
    marginRight: 'margin',
    marginBottom: 'margin',
    marginLeft: 'margin',
    marginInline: 'margin',
    marginBlock: 'margin',
    marginInlineStart: 'margin',
    marginInlineEnd: 'margin',
    marginBlockStart: 'margin',
    marginBlockEnd: 'margin',
    scrollMargin: 'margin',
    scrollMarginTop: 'margin',
    scrollMarginRight: 'margin',
    scrollMarginBottom: 'margin',
    scrollMarginLeft: 'margin',

    width: 'dimension',
    height: 'dimension',
    minWidth: 'dimension',
    minHeight: 'dimension',
    maxWidth: 'dimension',
    maxHeight: 'dimension',
    inlineSize: 'dimension',
    blockSize: 'dimension',
    minInlineSize: 'dimension',
    minBlockSize: 'dimension',
    maxInlineSize: 'dimension',
    maxBlockSize: 'dimension',

    borderRadius: 'radius',
    borderTopLeftRadius: 'radius',
    borderTopRightRadius: 'radius',
    borderBottomLeftRadius: 'radius',
    borderBottomRightRadius: 'radius',
    borderStartStartRadius: 'radius',
    borderStartEndRadius: 'radius',
    borderEndStartRadius: 'radius',
    borderEndEndRadius: 'radius',

    boxShadow: 'shadow',

    fontSize: 'fontSize',
    lineHeight: 'lineHeight',
    letterSpacing: 'letterSpacing',
    fontWeight: 'fontWeight',
    fontFamily: 'fontFamily',
} as const;

export type PropertyToTokenAxis = typeof propertyToTokenAxis;

export const tokens = {
    color: {
        /** `var(--vapor-color-foreground-primary)` */
        'fg-primary': 'var(--vapor-color-foreground-primary)',
        /** `var(--vapor-color-foreground-primary-100)` */
        'fg-primary-100': 'var(--vapor-color-foreground-primary-100)',
        /** `var(--vapor-color-foreground-primary-200)` */
        'fg-primary-200': 'var(--vapor-color-foreground-primary-200)',
        /** `var(--vapor-color-foreground-primary-strong)` */
        'fg-primary-strong': 'var(--vapor-color-foreground-primary-strong)',
        /** `var(--vapor-color-foreground-secondary)` */
        'fg-secondary': 'var(--vapor-color-foreground-secondary)',
        /** `var(--vapor-color-foreground-secondary-100)` */
        'fg-secondary-100': 'var(--vapor-color-foreground-secondary-100)',
        /** `var(--vapor-color-foreground-secondary-200)` */
        'fg-secondary-200': 'var(--vapor-color-foreground-secondary-200)',
        /** `var(--vapor-color-foreground-success)` */
        'fg-success': 'var(--vapor-color-foreground-success)',
        /** `var(--vapor-color-foreground-success-100)` */
        'fg-success-100': 'var(--vapor-color-foreground-success-100)',
        /** `var(--vapor-color-foreground-success-200)` */
        'fg-success-200': 'var(--vapor-color-foreground-success-200)',
        /** `var(--vapor-color-foreground-success-strong)` */
        'fg-success-strong': 'var(--vapor-color-foreground-success-strong)',
        /** `var(--vapor-color-foreground-warning)` */
        'fg-warning': 'var(--vapor-color-foreground-warning)',
        /** `var(--vapor-color-foreground-warning-100)` */
        'fg-warning-100': 'var(--vapor-color-foreground-warning-100)',
        /** `var(--vapor-color-foreground-warning-200)` */
        'fg-warning-200': 'var(--vapor-color-foreground-warning-200)',
        /** `var(--vapor-color-foreground-warning-strong)` */
        'fg-warning-strong': 'var(--vapor-color-foreground-warning-strong)',
        /** `var(--vapor-color-foreground-danger)` */
        'fg-danger': 'var(--vapor-color-foreground-danger)',
        /** `var(--vapor-color-foreground-danger-100)` */
        'fg-danger-100': 'var(--vapor-color-foreground-danger-100)',
        /** `var(--vapor-color-foreground-danger-200)` */
        'fg-danger-200': 'var(--vapor-color-foreground-danger-200)',
        /** `var(--vapor-color-foreground-danger-strong)` */
        'fg-danger-strong': 'var(--vapor-color-foreground-danger-strong)',
        /** `var(--vapor-color-foreground-hint)` */
        'fg-hint': 'var(--vapor-color-foreground-hint)',
        /** `var(--vapor-color-foreground-hint-100)` */
        'fg-hint-100': 'var(--vapor-color-foreground-hint-100)',
        /** `var(--vapor-color-foreground-hint-200)` */
        'fg-hint-200': 'var(--vapor-color-foreground-hint-200)',
        /** `var(--vapor-color-foreground-contrast)` */
        'fg-contrast': 'var(--vapor-color-foreground-contrast)',
        /** `var(--vapor-color-foreground-contrast-100)` */
        'fg-contrast-100': 'var(--vapor-color-foreground-contrast-100)',
        /** `var(--vapor-color-foreground-contrast-200)` */
        'fg-contrast-200': 'var(--vapor-color-foreground-contrast-200)',
        /** `var(--vapor-color-foreground-normal)` */
        'fg-normal': 'var(--vapor-color-foreground-normal)',
        /** `var(--vapor-color-foreground-normal-100)` */
        'fg-normal-100': 'var(--vapor-color-foreground-normal-100)',
        /** `var(--vapor-color-foreground-normal-200)` */
        'fg-normal-200': 'var(--vapor-color-foreground-normal-200)',
        /** `var(--vapor-color-foreground-inverse)` */
        'fg-inverse': 'var(--vapor-color-foreground-inverse)',
        /** `var(--vapor-color-foreground-staticWhite)` */
        'fg-staticWhite': 'var(--vapor-color-foreground-staticWhite)',
        /** `var(--vapor-color-foreground-staticBlack)` */
        'fg-staticBlack': 'var(--vapor-color-foreground-staticBlack)',

        /** `var(--vapor-color-black)` */
        'basic-black': 'var(--vapor-color-black)',
        /** `var(--vapor-color-white)` */
        'basic-white': 'var(--vapor-color-white)',
        /** `var(--vapor-color-canvas)` */
        'basic-canvas': 'var(--vapor-color-canvas)',
        /** `var(--vapor-color-red-050)` */
        'basic-red-050': 'var(--vapor-color-red-050)',
        /** `var(--vapor-color-red-100)` */
        'basic-red-100': 'var(--vapor-color-red-100)',
        /** `var(--vapor-color-red-200)` */
        'basic-red-200': 'var(--vapor-color-red-200)',
        /** `var(--vapor-color-red-300)` */
        'basic-red-300': 'var(--vapor-color-red-300)',
        /** `var(--vapor-color-red-400)` */
        'basic-red-400': 'var(--vapor-color-red-400)',
        /** `var(--vapor-color-red-500)` */
        'basic-red-500': 'var(--vapor-color-red-500)',
        /** `var(--vapor-color-red-600)` */
        'basic-red-600': 'var(--vapor-color-red-600)',
        /** `var(--vapor-color-red-700)` */
        'basic-red-700': 'var(--vapor-color-red-700)',
        /** `var(--vapor-color-red-800)` */
        'basic-red-800': 'var(--vapor-color-red-800)',
        /** `var(--vapor-color-red-900)` */
        'basic-red-900': 'var(--vapor-color-red-900)',
        /** `var(--vapor-color-pink-050)` */
        'basic-pink-050': 'var(--vapor-color-pink-050)',
        /** `var(--vapor-color-pink-100)` */
        'basic-pink-100': 'var(--vapor-color-pink-100)',
        /** `var(--vapor-color-pink-200)` */
        'basic-pink-200': 'var(--vapor-color-pink-200)',
        /** `var(--vapor-color-pink-300)` */
        'basic-pink-300': 'var(--vapor-color-pink-300)',
        /** `var(--vapor-color-pink-400)` */
        'basic-pink-400': 'var(--vapor-color-pink-400)',
        /** `var(--vapor-color-pink-500)` */
        'basic-pink-500': 'var(--vapor-color-pink-500)',
        /** `var(--vapor-color-pink-600)` */
        'basic-pink-600': 'var(--vapor-color-pink-600)',
        /** `var(--vapor-color-pink-700)` */
        'basic-pink-700': 'var(--vapor-color-pink-700)',
        /** `var(--vapor-color-pink-800)` */
        'basic-pink-800': 'var(--vapor-color-pink-800)',
        /** `var(--vapor-color-pink-900)` */
        'basic-pink-900': 'var(--vapor-color-pink-900)',
        /** `var(--vapor-color-grape-050)` */
        'basic-grape-050': 'var(--vapor-color-grape-050)',
        /** `var(--vapor-color-grape-100)` */
        'basic-grape-100': 'var(--vapor-color-grape-100)',
        /** `var(--vapor-color-grape-200)` */
        'basic-grape-200': 'var(--vapor-color-grape-200)',
        /** `var(--vapor-color-grape-300)` */
        'basic-grape-300': 'var(--vapor-color-grape-300)',
        /** `var(--vapor-color-grape-400)` */
        'basic-grape-400': 'var(--vapor-color-grape-400)',
        /** `var(--vapor-color-grape-500)` */
        'basic-grape-500': 'var(--vapor-color-grape-500)',
        /** `var(--vapor-color-grape-600)` */
        'basic-grape-600': 'var(--vapor-color-grape-600)',
        /** `var(--vapor-color-grape-700)` */
        'basic-grape-700': 'var(--vapor-color-grape-700)',
        /** `var(--vapor-color-grape-800)` */
        'basic-grape-800': 'var(--vapor-color-grape-800)',
        /** `var(--vapor-color-grape-900)` */
        'basic-grape-900': 'var(--vapor-color-grape-900)',
        /** `var(--vapor-color-violet-050)` */
        'basic-violet-050': 'var(--vapor-color-violet-050)',
        /** `var(--vapor-color-violet-100)` */
        'basic-violet-100': 'var(--vapor-color-violet-100)',
        /** `var(--vapor-color-violet-200)` */
        'basic-violet-200': 'var(--vapor-color-violet-200)',
        /** `var(--vapor-color-violet-300)` */
        'basic-violet-300': 'var(--vapor-color-violet-300)',
        /** `var(--vapor-color-violet-400)` */
        'basic-violet-400': 'var(--vapor-color-violet-400)',
        /** `var(--vapor-color-violet-500)` */
        'basic-violet-500': 'var(--vapor-color-violet-500)',
        /** `var(--vapor-color-violet-600)` */
        'basic-violet-600': 'var(--vapor-color-violet-600)',
        /** `var(--vapor-color-violet-700)` */
        'basic-violet-700': 'var(--vapor-color-violet-700)',
        /** `var(--vapor-color-violet-800)` */
        'basic-violet-800': 'var(--vapor-color-violet-800)',
        /** `var(--vapor-color-violet-900)` */
        'basic-violet-900': 'var(--vapor-color-violet-900)',
        /** `var(--vapor-color-blue-050)` */
        'basic-blue-050': 'var(--vapor-color-blue-050)',
        /** `var(--vapor-color-blue-100)` */
        'basic-blue-100': 'var(--vapor-color-blue-100)',
        /** `var(--vapor-color-blue-200)` */
        'basic-blue-200': 'var(--vapor-color-blue-200)',
        /** `var(--vapor-color-blue-300)` */
        'basic-blue-300': 'var(--vapor-color-blue-300)',
        /** `var(--vapor-color-blue-400)` */
        'basic-blue-400': 'var(--vapor-color-blue-400)',
        /** `var(--vapor-color-blue-500)` */
        'basic-blue-500': 'var(--vapor-color-blue-500)',
        /** `var(--vapor-color-blue-600)` */
        'basic-blue-600': 'var(--vapor-color-blue-600)',
        /** `var(--vapor-color-blue-700)` */
        'basic-blue-700': 'var(--vapor-color-blue-700)',
        /** `var(--vapor-color-blue-800)` */
        'basic-blue-800': 'var(--vapor-color-blue-800)',
        /** `var(--vapor-color-blue-900)` */
        'basic-blue-900': 'var(--vapor-color-blue-900)',
        /** `var(--vapor-color-cyan-050)` */
        'basic-cyan-050': 'var(--vapor-color-cyan-050)',
        /** `var(--vapor-color-cyan-100)` */
        'basic-cyan-100': 'var(--vapor-color-cyan-100)',
        /** `var(--vapor-color-cyan-200)` */
        'basic-cyan-200': 'var(--vapor-color-cyan-200)',
        /** `var(--vapor-color-cyan-300)` */
        'basic-cyan-300': 'var(--vapor-color-cyan-300)',
        /** `var(--vapor-color-cyan-400)` */
        'basic-cyan-400': 'var(--vapor-color-cyan-400)',
        /** `var(--vapor-color-cyan-500)` */
        'basic-cyan-500': 'var(--vapor-color-cyan-500)',
        /** `var(--vapor-color-cyan-600)` */
        'basic-cyan-600': 'var(--vapor-color-cyan-600)',
        /** `var(--vapor-color-cyan-700)` */
        'basic-cyan-700': 'var(--vapor-color-cyan-700)',
        /** `var(--vapor-color-cyan-800)` */
        'basic-cyan-800': 'var(--vapor-color-cyan-800)',
        /** `var(--vapor-color-cyan-900)` */
        'basic-cyan-900': 'var(--vapor-color-cyan-900)',
        /** `var(--vapor-color-green-050)` */
        'basic-green-050': 'var(--vapor-color-green-050)',
        /** `var(--vapor-color-green-100)` */
        'basic-green-100': 'var(--vapor-color-green-100)',
        /** `var(--vapor-color-green-200)` */
        'basic-green-200': 'var(--vapor-color-green-200)',
        /** `var(--vapor-color-green-300)` */
        'basic-green-300': 'var(--vapor-color-green-300)',
        /** `var(--vapor-color-green-400)` */
        'basic-green-400': 'var(--vapor-color-green-400)',
        /** `var(--vapor-color-green-500)` */
        'basic-green-500': 'var(--vapor-color-green-500)',
        /** `var(--vapor-color-green-600)` */
        'basic-green-600': 'var(--vapor-color-green-600)',
        /** `var(--vapor-color-green-700)` */
        'basic-green-700': 'var(--vapor-color-green-700)',
        /** `var(--vapor-color-green-800)` */
        'basic-green-800': 'var(--vapor-color-green-800)',
        /** `var(--vapor-color-green-900)` */
        'basic-green-900': 'var(--vapor-color-green-900)',
        /** `var(--vapor-color-lime-050)` */
        'basic-lime-050': 'var(--vapor-color-lime-050)',
        /** `var(--vapor-color-lime-100)` */
        'basic-lime-100': 'var(--vapor-color-lime-100)',
        /** `var(--vapor-color-lime-200)` */
        'basic-lime-200': 'var(--vapor-color-lime-200)',
        /** `var(--vapor-color-lime-300)` */
        'basic-lime-300': 'var(--vapor-color-lime-300)',
        /** `var(--vapor-color-lime-400)` */
        'basic-lime-400': 'var(--vapor-color-lime-400)',
        /** `var(--vapor-color-lime-500)` */
        'basic-lime-500': 'var(--vapor-color-lime-500)',
        /** `var(--vapor-color-lime-600)` */
        'basic-lime-600': 'var(--vapor-color-lime-600)',
        /** `var(--vapor-color-lime-700)` */
        'basic-lime-700': 'var(--vapor-color-lime-700)',
        /** `var(--vapor-color-lime-800)` */
        'basic-lime-800': 'var(--vapor-color-lime-800)',
        /** `var(--vapor-color-lime-900)` */
        'basic-lime-900': 'var(--vapor-color-lime-900)',
        /** `var(--vapor-color-yellow-050)` */
        'basic-yellow-050': 'var(--vapor-color-yellow-050)',
        /** `var(--vapor-color-yellow-100)` */
        'basic-yellow-100': 'var(--vapor-color-yellow-100)',
        /** `var(--vapor-color-yellow-200)` */
        'basic-yellow-200': 'var(--vapor-color-yellow-200)',
        /** `var(--vapor-color-yellow-300)` */
        'basic-yellow-300': 'var(--vapor-color-yellow-300)',
        /** `var(--vapor-color-yellow-400)` */
        'basic-yellow-400': 'var(--vapor-color-yellow-400)',
        /** `var(--vapor-color-yellow-500)` */
        'basic-yellow-500': 'var(--vapor-color-yellow-500)',
        /** `var(--vapor-color-yellow-600)` */
        'basic-yellow-600': 'var(--vapor-color-yellow-600)',
        /** `var(--vapor-color-yellow-700)` */
        'basic-yellow-700': 'var(--vapor-color-yellow-700)',
        /** `var(--vapor-color-yellow-800)` */
        'basic-yellow-800': 'var(--vapor-color-yellow-800)',
        /** `var(--vapor-color-yellow-900)` */
        'basic-yellow-900': 'var(--vapor-color-yellow-900)',
        /** `var(--vapor-color-orange-050)` */
        'basic-orange-050': 'var(--vapor-color-orange-050)',
        /** `var(--vapor-color-orange-100)` */
        'basic-orange-100': 'var(--vapor-color-orange-100)',
        /** `var(--vapor-color-orange-200)` */
        'basic-orange-200': 'var(--vapor-color-orange-200)',
        /** `var(--vapor-color-orange-300)` */
        'basic-orange-300': 'var(--vapor-color-orange-300)',
        /** `var(--vapor-color-orange-400)` */
        'basic-orange-400': 'var(--vapor-color-orange-400)',
        /** `var(--vapor-color-orange-500)` */
        'basic-orange-500': 'var(--vapor-color-orange-500)',
        /** `var(--vapor-color-orange-600)` */
        'basic-orange-600': 'var(--vapor-color-orange-600)',
        /** `var(--vapor-color-orange-700)` */
        'basic-orange-700': 'var(--vapor-color-orange-700)',
        /** `var(--vapor-color-orange-800)` */
        'basic-orange-800': 'var(--vapor-color-orange-800)',
        /** `var(--vapor-color-orange-900)` */
        'basic-orange-900': 'var(--vapor-color-orange-900)',
        /** `var(--vapor-color-gray-050)` */
        'basic-gray-050': 'var(--vapor-color-gray-050)',
        /** `var(--vapor-color-gray-100)` */
        'basic-gray-100': 'var(--vapor-color-gray-100)',
        /** `var(--vapor-color-gray-200)` */
        'basic-gray-200': 'var(--vapor-color-gray-200)',
        /** `var(--vapor-color-gray-300)` */
        'basic-gray-300': 'var(--vapor-color-gray-300)',
        /** `var(--vapor-color-gray-400)` */
        'basic-gray-400': 'var(--vapor-color-gray-400)',
        /** `var(--vapor-color-gray-500)` */
        'basic-gray-500': 'var(--vapor-color-gray-500)',
        /** `var(--vapor-color-gray-600)` */
        'basic-gray-600': 'var(--vapor-color-gray-600)',
        /** `var(--vapor-color-gray-700)` */
        'basic-gray-700': 'var(--vapor-color-gray-700)',
        /** `var(--vapor-color-gray-800)` */
        'basic-gray-800': 'var(--vapor-color-gray-800)',
        /** `var(--vapor-color-gray-900)` */
        'basic-gray-900': 'var(--vapor-color-gray-900)',
    },

    backgroundColor: {
        /** `var(--vapor-color-background-primary)` */
        'bg-primary': 'var(--vapor-color-background-primary)',
        /** `var(--vapor-color-background-primary-100)` */
        'bg-primary-100': 'var(--vapor-color-background-primary-100)',
        /** `var(--vapor-color-background-primary-200)` */
        'bg-primary-200': 'var(--vapor-color-background-primary-200)',
        /** `var(--vapor-color-background-primary-weak)` */
        'bg-primary-weak': 'var(--vapor-color-background-primary-weak)',
        /** `var(--vapor-color-background-secondary)` */
        'bg-secondary': 'var(--vapor-color-background-secondary)',
        /** `var(--vapor-color-background-secondary-100)` */
        'bg-secondary-100': 'var(--vapor-color-background-secondary-100)',
        /** `var(--vapor-color-background-secondary-200)` */
        'bg-secondary-200': 'var(--vapor-color-background-secondary-200)',
        /** `var(--vapor-color-background-secondary-weak)` */
        'bg-secondary-weak': 'var(--vapor-color-background-secondary-weak)',
        /** `var(--vapor-color-background-success)` */
        'bg-success': 'var(--vapor-color-background-success)',
        /** `var(--vapor-color-background-success-100)` */
        'bg-success-100': 'var(--vapor-color-background-success-100)',
        /** `var(--vapor-color-background-success-200)` */
        'bg-success-200': 'var(--vapor-color-background-success-200)',
        /** `var(--vapor-color-background-success-weak)` */
        'bg-success-weak': 'var(--vapor-color-background-success-weak)',
        /** `var(--vapor-color-background-warning)` */
        'bg-warning': 'var(--vapor-color-background-warning)',
        /** `var(--vapor-color-background-warning-100)` */
        'bg-warning-100': 'var(--vapor-color-background-warning-100)',
        /** `var(--vapor-color-background-warning-200)` */
        'bg-warning-200': 'var(--vapor-color-background-warning-200)',
        /** `var(--vapor-color-background-warning-weak)` */
        'bg-warning-weak': 'var(--vapor-color-background-warning-weak)',
        /** `var(--vapor-color-background-danger)` */
        'bg-danger': 'var(--vapor-color-background-danger)',
        /** `var(--vapor-color-background-danger-100)` */
        'bg-danger-100': 'var(--vapor-color-background-danger-100)',
        /** `var(--vapor-color-background-danger-200)` */
        'bg-danger-200': 'var(--vapor-color-background-danger-200)',
        /** `var(--vapor-color-background-danger-weak)` */
        'bg-danger-weak': 'var(--vapor-color-background-danger-weak)',
        /** `var(--vapor-color-background-hint)` */
        'bg-hint': 'var(--vapor-color-background-hint)',
        /** `var(--vapor-color-background-hint-100)` */
        'bg-hint-100': 'var(--vapor-color-background-hint-100)',
        /** `var(--vapor-color-background-hint-200)` */
        'bg-hint-200': 'var(--vapor-color-background-hint-200)',
        /** `var(--vapor-color-background-hint-weak)` */
        'bg-hint-weak': 'var(--vapor-color-background-hint-weak)',
        /** `var(--vapor-color-background-contrast)` */
        'bg-contrast': 'var(--vapor-color-background-contrast)',
        /** `var(--vapor-color-background-contrast-100)` */
        'bg-contrast-100': 'var(--vapor-color-background-contrast-100)',
        /** `var(--vapor-color-background-contrast-200)` */
        'bg-contrast-200': 'var(--vapor-color-background-contrast-200)',
        /** `var(--vapor-color-background-contrast-weak)` */
        'bg-contrast-weak': 'var(--vapor-color-background-contrast-weak)',
        /** `var(--vapor-color-background-canvas-100)` */
        'bg-canvas-100': 'var(--vapor-color-background-canvas-100)',
        /** `var(--vapor-color-background-canvas-200)` */
        'bg-canvas-200': 'var(--vapor-color-background-canvas-200)',
        /** `var(--vapor-color-background-overlay-100)` */
        'bg-overlay-100': 'var(--vapor-color-background-overlay-100)',
        /** `var(--vapor-color-background-canvas-base)` */
        'bg-canvas-base': 'var(--vapor-color-background-canvas-base)',
        /** `var(--vapor-color-background-canvas-sunken)` */
        'bg-canvas-sunken': 'var(--vapor-color-background-canvas-sunken)',
        /** `var(--vapor-color-background-canvas-raised)` */
        'bg-canvas-raised': 'var(--vapor-color-background-canvas-raised)',
        /** `var(--vapor-color-background-canvas-dim)` */
        'bg-canvas-dim': 'var(--vapor-color-background-canvas-dim)',
        /** `var(--vapor-color-background-canvas-overlay)` */
        'bg-canvas-overlay': 'var(--vapor-color-background-canvas-overlay)',

        /** `var(--vapor-color-black)` */
        'basic-black': 'var(--vapor-color-black)',
        /** `var(--vapor-color-white)` */
        'basic-white': 'var(--vapor-color-white)',
        /** `var(--vapor-color-canvas)` */
        'basic-canvas': 'var(--vapor-color-canvas)',
        /** `var(--vapor-color-red-050)` */
        'basic-red-050': 'var(--vapor-color-red-050)',
        /** `var(--vapor-color-red-100)` */
        'basic-red-100': 'var(--vapor-color-red-100)',
        /** `var(--vapor-color-red-200)` */
        'basic-red-200': 'var(--vapor-color-red-200)',
        /** `var(--vapor-color-red-300)` */
        'basic-red-300': 'var(--vapor-color-red-300)',
        /** `var(--vapor-color-red-400)` */
        'basic-red-400': 'var(--vapor-color-red-400)',
        /** `var(--vapor-color-red-500)` */
        'basic-red-500': 'var(--vapor-color-red-500)',
        /** `var(--vapor-color-red-600)` */
        'basic-red-600': 'var(--vapor-color-red-600)',
        /** `var(--vapor-color-red-700)` */
        'basic-red-700': 'var(--vapor-color-red-700)',
        /** `var(--vapor-color-red-800)` */
        'basic-red-800': 'var(--vapor-color-red-800)',
        /** `var(--vapor-color-red-900)` */
        'basic-red-900': 'var(--vapor-color-red-900)',
        /** `var(--vapor-color-pink-050)` */
        'basic-pink-050': 'var(--vapor-color-pink-050)',
        /** `var(--vapor-color-pink-100)` */
        'basic-pink-100': 'var(--vapor-color-pink-100)',
        /** `var(--vapor-color-pink-200)` */
        'basic-pink-200': 'var(--vapor-color-pink-200)',
        /** `var(--vapor-color-pink-300)` */
        'basic-pink-300': 'var(--vapor-color-pink-300)',
        /** `var(--vapor-color-pink-400)` */
        'basic-pink-400': 'var(--vapor-color-pink-400)',
        /** `var(--vapor-color-pink-500)` */
        'basic-pink-500': 'var(--vapor-color-pink-500)',
        /** `var(--vapor-color-pink-600)` */
        'basic-pink-600': 'var(--vapor-color-pink-600)',
        /** `var(--vapor-color-pink-700)` */
        'basic-pink-700': 'var(--vapor-color-pink-700)',
        /** `var(--vapor-color-pink-800)` */
        'basic-pink-800': 'var(--vapor-color-pink-800)',
        /** `var(--vapor-color-pink-900)` */
        'basic-pink-900': 'var(--vapor-color-pink-900)',
        /** `var(--vapor-color-grape-050)` */
        'basic-grape-050': 'var(--vapor-color-grape-050)',
        /** `var(--vapor-color-grape-100)` */
        'basic-grape-100': 'var(--vapor-color-grape-100)',
        /** `var(--vapor-color-grape-200)` */
        'basic-grape-200': 'var(--vapor-color-grape-200)',
        /** `var(--vapor-color-grape-300)` */
        'basic-grape-300': 'var(--vapor-color-grape-300)',
        /** `var(--vapor-color-grape-400)` */
        'basic-grape-400': 'var(--vapor-color-grape-400)',
        /** `var(--vapor-color-grape-500)` */
        'basic-grape-500': 'var(--vapor-color-grape-500)',
        /** `var(--vapor-color-grape-600)` */
        'basic-grape-600': 'var(--vapor-color-grape-600)',
        /** `var(--vapor-color-grape-700)` */
        'basic-grape-700': 'var(--vapor-color-grape-700)',
        /** `var(--vapor-color-grape-800)` */
        'basic-grape-800': 'var(--vapor-color-grape-800)',
        /** `var(--vapor-color-grape-900)` */
        'basic-grape-900': 'var(--vapor-color-grape-900)',
        /** `var(--vapor-color-violet-050)` */
        'basic-violet-050': 'var(--vapor-color-violet-050)',
        /** `var(--vapor-color-violet-100)` */
        'basic-violet-100': 'var(--vapor-color-violet-100)',
        /** `var(--vapor-color-violet-200)` */
        'basic-violet-200': 'var(--vapor-color-violet-200)',
        /** `var(--vapor-color-violet-300)` */
        'basic-violet-300': 'var(--vapor-color-violet-300)',
        /** `var(--vapor-color-violet-400)` */
        'basic-violet-400': 'var(--vapor-color-violet-400)',
        /** `var(--vapor-color-violet-500)` */
        'basic-violet-500': 'var(--vapor-color-violet-500)',
        /** `var(--vapor-color-violet-600)` */
        'basic-violet-600': 'var(--vapor-color-violet-600)',
        /** `var(--vapor-color-violet-700)` */
        'basic-violet-700': 'var(--vapor-color-violet-700)',
        /** `var(--vapor-color-violet-800)` */
        'basic-violet-800': 'var(--vapor-color-violet-800)',
        /** `var(--vapor-color-violet-900)` */
        'basic-violet-900': 'var(--vapor-color-violet-900)',
        /** `var(--vapor-color-blue-050)` */
        'basic-blue-050': 'var(--vapor-color-blue-050)',
        /** `var(--vapor-color-blue-100)` */
        'basic-blue-100': 'var(--vapor-color-blue-100)',
        /** `var(--vapor-color-blue-200)` */
        'basic-blue-200': 'var(--vapor-color-blue-200)',
        /** `var(--vapor-color-blue-300)` */
        'basic-blue-300': 'var(--vapor-color-blue-300)',
        /** `var(--vapor-color-blue-400)` */
        'basic-blue-400': 'var(--vapor-color-blue-400)',
        /** `var(--vapor-color-blue-500)` */
        'basic-blue-500': 'var(--vapor-color-blue-500)',
        /** `var(--vapor-color-blue-600)` */
        'basic-blue-600': 'var(--vapor-color-blue-600)',
        /** `var(--vapor-color-blue-700)` */
        'basic-blue-700': 'var(--vapor-color-blue-700)',
        /** `var(--vapor-color-blue-800)` */
        'basic-blue-800': 'var(--vapor-color-blue-800)',
        /** `var(--vapor-color-blue-900)` */
        'basic-blue-900': 'var(--vapor-color-blue-900)',
        /** `var(--vapor-color-cyan-050)` */
        'basic-cyan-050': 'var(--vapor-color-cyan-050)',
        /** `var(--vapor-color-cyan-100)` */
        'basic-cyan-100': 'var(--vapor-color-cyan-100)',
        /** `var(--vapor-color-cyan-200)` */
        'basic-cyan-200': 'var(--vapor-color-cyan-200)',
        /** `var(--vapor-color-cyan-300)` */
        'basic-cyan-300': 'var(--vapor-color-cyan-300)',
        /** `var(--vapor-color-cyan-400)` */
        'basic-cyan-400': 'var(--vapor-color-cyan-400)',
        /** `var(--vapor-color-cyan-500)` */
        'basic-cyan-500': 'var(--vapor-color-cyan-500)',
        /** `var(--vapor-color-cyan-600)` */
        'basic-cyan-600': 'var(--vapor-color-cyan-600)',
        /** `var(--vapor-color-cyan-700)` */
        'basic-cyan-700': 'var(--vapor-color-cyan-700)',
        /** `var(--vapor-color-cyan-800)` */
        'basic-cyan-800': 'var(--vapor-color-cyan-800)',
        /** `var(--vapor-color-cyan-900)` */
        'basic-cyan-900': 'var(--vapor-color-cyan-900)',
        /** `var(--vapor-color-green-050)` */
        'basic-green-050': 'var(--vapor-color-green-050)',
        /** `var(--vapor-color-green-100)` */
        'basic-green-100': 'var(--vapor-color-green-100)',
        /** `var(--vapor-color-green-200)` */
        'basic-green-200': 'var(--vapor-color-green-200)',
        /** `var(--vapor-color-green-300)` */
        'basic-green-300': 'var(--vapor-color-green-300)',
        /** `var(--vapor-color-green-400)` */
        'basic-green-400': 'var(--vapor-color-green-400)',
        /** `var(--vapor-color-green-500)` */
        'basic-green-500': 'var(--vapor-color-green-500)',
        /** `var(--vapor-color-green-600)` */
        'basic-green-600': 'var(--vapor-color-green-600)',
        /** `var(--vapor-color-green-700)` */
        'basic-green-700': 'var(--vapor-color-green-700)',
        /** `var(--vapor-color-green-800)` */
        'basic-green-800': 'var(--vapor-color-green-800)',
        /** `var(--vapor-color-green-900)` */
        'basic-green-900': 'var(--vapor-color-green-900)',
        /** `var(--vapor-color-lime-050)` */
        'basic-lime-050': 'var(--vapor-color-lime-050)',
        /** `var(--vapor-color-lime-100)` */
        'basic-lime-100': 'var(--vapor-color-lime-100)',
        /** `var(--vapor-color-lime-200)` */
        'basic-lime-200': 'var(--vapor-color-lime-200)',
        /** `var(--vapor-color-lime-300)` */
        'basic-lime-300': 'var(--vapor-color-lime-300)',
        /** `var(--vapor-color-lime-400)` */
        'basic-lime-400': 'var(--vapor-color-lime-400)',
        /** `var(--vapor-color-lime-500)` */
        'basic-lime-500': 'var(--vapor-color-lime-500)',
        /** `var(--vapor-color-lime-600)` */
        'basic-lime-600': 'var(--vapor-color-lime-600)',
        /** `var(--vapor-color-lime-700)` */
        'basic-lime-700': 'var(--vapor-color-lime-700)',
        /** `var(--vapor-color-lime-800)` */
        'basic-lime-800': 'var(--vapor-color-lime-800)',
        /** `var(--vapor-color-lime-900)` */
        'basic-lime-900': 'var(--vapor-color-lime-900)',
        /** `var(--vapor-color-yellow-050)` */
        'basic-yellow-050': 'var(--vapor-color-yellow-050)',
        /** `var(--vapor-color-yellow-100)` */
        'basic-yellow-100': 'var(--vapor-color-yellow-100)',
        /** `var(--vapor-color-yellow-200)` */
        'basic-yellow-200': 'var(--vapor-color-yellow-200)',
        /** `var(--vapor-color-yellow-300)` */
        'basic-yellow-300': 'var(--vapor-color-yellow-300)',
        /** `var(--vapor-color-yellow-400)` */
        'basic-yellow-400': 'var(--vapor-color-yellow-400)',
        /** `var(--vapor-color-yellow-500)` */
        'basic-yellow-500': 'var(--vapor-color-yellow-500)',
        /** `var(--vapor-color-yellow-600)` */
        'basic-yellow-600': 'var(--vapor-color-yellow-600)',
        /** `var(--vapor-color-yellow-700)` */
        'basic-yellow-700': 'var(--vapor-color-yellow-700)',
        /** `var(--vapor-color-yellow-800)` */
        'basic-yellow-800': 'var(--vapor-color-yellow-800)',
        /** `var(--vapor-color-yellow-900)` */
        'basic-yellow-900': 'var(--vapor-color-yellow-900)',
        /** `var(--vapor-color-orange-050)` */
        'basic-orange-050': 'var(--vapor-color-orange-050)',
        /** `var(--vapor-color-orange-100)` */
        'basic-orange-100': 'var(--vapor-color-orange-100)',
        /** `var(--vapor-color-orange-200)` */
        'basic-orange-200': 'var(--vapor-color-orange-200)',
        /** `var(--vapor-color-orange-300)` */
        'basic-orange-300': 'var(--vapor-color-orange-300)',
        /** `var(--vapor-color-orange-400)` */
        'basic-orange-400': 'var(--vapor-color-orange-400)',
        /** `var(--vapor-color-orange-500)` */
        'basic-orange-500': 'var(--vapor-color-orange-500)',
        /** `var(--vapor-color-orange-600)` */
        'basic-orange-600': 'var(--vapor-color-orange-600)',
        /** `var(--vapor-color-orange-700)` */
        'basic-orange-700': 'var(--vapor-color-orange-700)',
        /** `var(--vapor-color-orange-800)` */
        'basic-orange-800': 'var(--vapor-color-orange-800)',
        /** `var(--vapor-color-orange-900)` */
        'basic-orange-900': 'var(--vapor-color-orange-900)',
        /** `var(--vapor-color-gray-050)` */
        'basic-gray-050': 'var(--vapor-color-gray-050)',
        /** `var(--vapor-color-gray-100)` */
        'basic-gray-100': 'var(--vapor-color-gray-100)',
        /** `var(--vapor-color-gray-200)` */
        'basic-gray-200': 'var(--vapor-color-gray-200)',
        /** `var(--vapor-color-gray-300)` */
        'basic-gray-300': 'var(--vapor-color-gray-300)',
        /** `var(--vapor-color-gray-400)` */
        'basic-gray-400': 'var(--vapor-color-gray-400)',
        /** `var(--vapor-color-gray-500)` */
        'basic-gray-500': 'var(--vapor-color-gray-500)',
        /** `var(--vapor-color-gray-600)` */
        'basic-gray-600': 'var(--vapor-color-gray-600)',
        /** `var(--vapor-color-gray-700)` */
        'basic-gray-700': 'var(--vapor-color-gray-700)',
        /** `var(--vapor-color-gray-800)` */
        'basic-gray-800': 'var(--vapor-color-gray-800)',
        /** `var(--vapor-color-gray-900)` */
        'basic-gray-900': 'var(--vapor-color-gray-900)',
    },

    borderColor: {
        /** `var(--vapor-color-border-normal)` */
        'border-normal': 'var(--vapor-color-border-normal)',
        /** `var(--vapor-color-border-primary)` */
        'border-primary': 'var(--vapor-color-border-primary)',
        /** `var(--vapor-color-border-secondary)` */
        'border-secondary': 'var(--vapor-color-border-secondary)',
        /** `var(--vapor-color-border-success)` */
        'border-success': 'var(--vapor-color-border-success)',
        /** `var(--vapor-color-border-warning)` */
        'border-warning': 'var(--vapor-color-border-warning)',
        /** `var(--vapor-color-border-danger)` */
        'border-danger': 'var(--vapor-color-border-danger)',
        /** `var(--vapor-color-border-hint)` */
        'border-hint': 'var(--vapor-color-border-hint)',
        /** `var(--vapor-color-border-contrast)` */
        'border-contrast': 'var(--vapor-color-border-contrast)',

        /** `var(--vapor-color-black)` */
        'basic-black': 'var(--vapor-color-black)',
        /** `var(--vapor-color-white)` */
        'basic-white': 'var(--vapor-color-white)',
        /** `var(--vapor-color-canvas)` */
        'basic-canvas': 'var(--vapor-color-canvas)',
        /** `var(--vapor-color-red-050)` */
        'basic-red-050': 'var(--vapor-color-red-050)',
        /** `var(--vapor-color-red-100)` */
        'basic-red-100': 'var(--vapor-color-red-100)',
        /** `var(--vapor-color-red-200)` */
        'basic-red-200': 'var(--vapor-color-red-200)',
        /** `var(--vapor-color-red-300)` */
        'basic-red-300': 'var(--vapor-color-red-300)',
        /** `var(--vapor-color-red-400)` */
        'basic-red-400': 'var(--vapor-color-red-400)',
        /** `var(--vapor-color-red-500)` */
        'basic-red-500': 'var(--vapor-color-red-500)',
        /** `var(--vapor-color-red-600)` */
        'basic-red-600': 'var(--vapor-color-red-600)',
        /** `var(--vapor-color-red-700)` */
        'basic-red-700': 'var(--vapor-color-red-700)',
        /** `var(--vapor-color-red-800)` */
        'basic-red-800': 'var(--vapor-color-red-800)',
        /** `var(--vapor-color-red-900)` */
        'basic-red-900': 'var(--vapor-color-red-900)',
        /** `var(--vapor-color-pink-050)` */
        'basic-pink-050': 'var(--vapor-color-pink-050)',
        /** `var(--vapor-color-pink-100)` */
        'basic-pink-100': 'var(--vapor-color-pink-100)',
        /** `var(--vapor-color-pink-200)` */
        'basic-pink-200': 'var(--vapor-color-pink-200)',
        /** `var(--vapor-color-pink-300)` */
        'basic-pink-300': 'var(--vapor-color-pink-300)',
        /** `var(--vapor-color-pink-400)` */
        'basic-pink-400': 'var(--vapor-color-pink-400)',
        /** `var(--vapor-color-pink-500)` */
        'basic-pink-500': 'var(--vapor-color-pink-500)',
        /** `var(--vapor-color-pink-600)` */
        'basic-pink-600': 'var(--vapor-color-pink-600)',
        /** `var(--vapor-color-pink-700)` */
        'basic-pink-700': 'var(--vapor-color-pink-700)',
        /** `var(--vapor-color-pink-800)` */
        'basic-pink-800': 'var(--vapor-color-pink-800)',
        /** `var(--vapor-color-pink-900)` */
        'basic-pink-900': 'var(--vapor-color-pink-900)',
        /** `var(--vapor-color-grape-050)` */
        'basic-grape-050': 'var(--vapor-color-grape-050)',
        /** `var(--vapor-color-grape-100)` */
        'basic-grape-100': 'var(--vapor-color-grape-100)',
        /** `var(--vapor-color-grape-200)` */
        'basic-grape-200': 'var(--vapor-color-grape-200)',
        /** `var(--vapor-color-grape-300)` */
        'basic-grape-300': 'var(--vapor-color-grape-300)',
        /** `var(--vapor-color-grape-400)` */
        'basic-grape-400': 'var(--vapor-color-grape-400)',
        /** `var(--vapor-color-grape-500)` */
        'basic-grape-500': 'var(--vapor-color-grape-500)',
        /** `var(--vapor-color-grape-600)` */
        'basic-grape-600': 'var(--vapor-color-grape-600)',
        /** `var(--vapor-color-grape-700)` */
        'basic-grape-700': 'var(--vapor-color-grape-700)',
        /** `var(--vapor-color-grape-800)` */
        'basic-grape-800': 'var(--vapor-color-grape-800)',
        /** `var(--vapor-color-grape-900)` */
        'basic-grape-900': 'var(--vapor-color-grape-900)',
        /** `var(--vapor-color-violet-050)` */
        'basic-violet-050': 'var(--vapor-color-violet-050)',
        /** `var(--vapor-color-violet-100)` */
        'basic-violet-100': 'var(--vapor-color-violet-100)',
        /** `var(--vapor-color-violet-200)` */
        'basic-violet-200': 'var(--vapor-color-violet-200)',
        /** `var(--vapor-color-violet-300)` */
        'basic-violet-300': 'var(--vapor-color-violet-300)',
        /** `var(--vapor-color-violet-400)` */
        'basic-violet-400': 'var(--vapor-color-violet-400)',
        /** `var(--vapor-color-violet-500)` */
        'basic-violet-500': 'var(--vapor-color-violet-500)',
        /** `var(--vapor-color-violet-600)` */
        'basic-violet-600': 'var(--vapor-color-violet-600)',
        /** `var(--vapor-color-violet-700)` */
        'basic-violet-700': 'var(--vapor-color-violet-700)',
        /** `var(--vapor-color-violet-800)` */
        'basic-violet-800': 'var(--vapor-color-violet-800)',
        /** `var(--vapor-color-violet-900)` */
        'basic-violet-900': 'var(--vapor-color-violet-900)',
        /** `var(--vapor-color-blue-050)` */
        'basic-blue-050': 'var(--vapor-color-blue-050)',
        /** `var(--vapor-color-blue-100)` */
        'basic-blue-100': 'var(--vapor-color-blue-100)',
        /** `var(--vapor-color-blue-200)` */
        'basic-blue-200': 'var(--vapor-color-blue-200)',
        /** `var(--vapor-color-blue-300)` */
        'basic-blue-300': 'var(--vapor-color-blue-300)',
        /** `var(--vapor-color-blue-400)` */
        'basic-blue-400': 'var(--vapor-color-blue-400)',
        /** `var(--vapor-color-blue-500)` */
        'basic-blue-500': 'var(--vapor-color-blue-500)',
        /** `var(--vapor-color-blue-600)` */
        'basic-blue-600': 'var(--vapor-color-blue-600)',
        /** `var(--vapor-color-blue-700)` */
        'basic-blue-700': 'var(--vapor-color-blue-700)',
        /** `var(--vapor-color-blue-800)` */
        'basic-blue-800': 'var(--vapor-color-blue-800)',
        /** `var(--vapor-color-blue-900)` */
        'basic-blue-900': 'var(--vapor-color-blue-900)',
        /** `var(--vapor-color-cyan-050)` */
        'basic-cyan-050': 'var(--vapor-color-cyan-050)',
        /** `var(--vapor-color-cyan-100)` */
        'basic-cyan-100': 'var(--vapor-color-cyan-100)',
        /** `var(--vapor-color-cyan-200)` */
        'basic-cyan-200': 'var(--vapor-color-cyan-200)',
        /** `var(--vapor-color-cyan-300)` */
        'basic-cyan-300': 'var(--vapor-color-cyan-300)',
        /** `var(--vapor-color-cyan-400)` */
        'basic-cyan-400': 'var(--vapor-color-cyan-400)',
        /** `var(--vapor-color-cyan-500)` */
        'basic-cyan-500': 'var(--vapor-color-cyan-500)',
        /** `var(--vapor-color-cyan-600)` */
        'basic-cyan-600': 'var(--vapor-color-cyan-600)',
        /** `var(--vapor-color-cyan-700)` */
        'basic-cyan-700': 'var(--vapor-color-cyan-700)',
        /** `var(--vapor-color-cyan-800)` */
        'basic-cyan-800': 'var(--vapor-color-cyan-800)',
        /** `var(--vapor-color-cyan-900)` */
        'basic-cyan-900': 'var(--vapor-color-cyan-900)',
        /** `var(--vapor-color-green-050)` */
        'basic-green-050': 'var(--vapor-color-green-050)',
        /** `var(--vapor-color-green-100)` */
        'basic-green-100': 'var(--vapor-color-green-100)',
        /** `var(--vapor-color-green-200)` */
        'basic-green-200': 'var(--vapor-color-green-200)',
        /** `var(--vapor-color-green-300)` */
        'basic-green-300': 'var(--vapor-color-green-300)',
        /** `var(--vapor-color-green-400)` */
        'basic-green-400': 'var(--vapor-color-green-400)',
        /** `var(--vapor-color-green-500)` */
        'basic-green-500': 'var(--vapor-color-green-500)',
        /** `var(--vapor-color-green-600)` */
        'basic-green-600': 'var(--vapor-color-green-600)',
        /** `var(--vapor-color-green-700)` */
        'basic-green-700': 'var(--vapor-color-green-700)',
        /** `var(--vapor-color-green-800)` */
        'basic-green-800': 'var(--vapor-color-green-800)',
        /** `var(--vapor-color-green-900)` */
        'basic-green-900': 'var(--vapor-color-green-900)',
        /** `var(--vapor-color-lime-050)` */
        'basic-lime-050': 'var(--vapor-color-lime-050)',
        /** `var(--vapor-color-lime-100)` */
        'basic-lime-100': 'var(--vapor-color-lime-100)',
        /** `var(--vapor-color-lime-200)` */
        'basic-lime-200': 'var(--vapor-color-lime-200)',
        /** `var(--vapor-color-lime-300)` */
        'basic-lime-300': 'var(--vapor-color-lime-300)',
        /** `var(--vapor-color-lime-400)` */
        'basic-lime-400': 'var(--vapor-color-lime-400)',
        /** `var(--vapor-color-lime-500)` */
        'basic-lime-500': 'var(--vapor-color-lime-500)',
        /** `var(--vapor-color-lime-600)` */
        'basic-lime-600': 'var(--vapor-color-lime-600)',
        /** `var(--vapor-color-lime-700)` */
        'basic-lime-700': 'var(--vapor-color-lime-700)',
        /** `var(--vapor-color-lime-800)` */
        'basic-lime-800': 'var(--vapor-color-lime-800)',
        /** `var(--vapor-color-lime-900)` */
        'basic-lime-900': 'var(--vapor-color-lime-900)',
        /** `var(--vapor-color-yellow-050)` */
        'basic-yellow-050': 'var(--vapor-color-yellow-050)',
        /** `var(--vapor-color-yellow-100)` */
        'basic-yellow-100': 'var(--vapor-color-yellow-100)',
        /** `var(--vapor-color-yellow-200)` */
        'basic-yellow-200': 'var(--vapor-color-yellow-200)',
        /** `var(--vapor-color-yellow-300)` */
        'basic-yellow-300': 'var(--vapor-color-yellow-300)',
        /** `var(--vapor-color-yellow-400)` */
        'basic-yellow-400': 'var(--vapor-color-yellow-400)',
        /** `var(--vapor-color-yellow-500)` */
        'basic-yellow-500': 'var(--vapor-color-yellow-500)',
        /** `var(--vapor-color-yellow-600)` */
        'basic-yellow-600': 'var(--vapor-color-yellow-600)',
        /** `var(--vapor-color-yellow-700)` */
        'basic-yellow-700': 'var(--vapor-color-yellow-700)',
        /** `var(--vapor-color-yellow-800)` */
        'basic-yellow-800': 'var(--vapor-color-yellow-800)',
        /** `var(--vapor-color-yellow-900)` */
        'basic-yellow-900': 'var(--vapor-color-yellow-900)',
        /** `var(--vapor-color-orange-050)` */
        'basic-orange-050': 'var(--vapor-color-orange-050)',
        /** `var(--vapor-color-orange-100)` */
        'basic-orange-100': 'var(--vapor-color-orange-100)',
        /** `var(--vapor-color-orange-200)` */
        'basic-orange-200': 'var(--vapor-color-orange-200)',
        /** `var(--vapor-color-orange-300)` */
        'basic-orange-300': 'var(--vapor-color-orange-300)',
        /** `var(--vapor-color-orange-400)` */
        'basic-orange-400': 'var(--vapor-color-orange-400)',
        /** `var(--vapor-color-orange-500)` */
        'basic-orange-500': 'var(--vapor-color-orange-500)',
        /** `var(--vapor-color-orange-600)` */
        'basic-orange-600': 'var(--vapor-color-orange-600)',
        /** `var(--vapor-color-orange-700)` */
        'basic-orange-700': 'var(--vapor-color-orange-700)',
        /** `var(--vapor-color-orange-800)` */
        'basic-orange-800': 'var(--vapor-color-orange-800)',
        /** `var(--vapor-color-orange-900)` */
        'basic-orange-900': 'var(--vapor-color-orange-900)',
        /** `var(--vapor-color-gray-050)` */
        'basic-gray-050': 'var(--vapor-color-gray-050)',
        /** `var(--vapor-color-gray-100)` */
        'basic-gray-100': 'var(--vapor-color-gray-100)',
        /** `var(--vapor-color-gray-200)` */
        'basic-gray-200': 'var(--vapor-color-gray-200)',
        /** `var(--vapor-color-gray-300)` */
        'basic-gray-300': 'var(--vapor-color-gray-300)',
        /** `var(--vapor-color-gray-400)` */
        'basic-gray-400': 'var(--vapor-color-gray-400)',
        /** `var(--vapor-color-gray-500)` */
        'basic-gray-500': 'var(--vapor-color-gray-500)',
        /** `var(--vapor-color-gray-600)` */
        'basic-gray-600': 'var(--vapor-color-gray-600)',
        /** `var(--vapor-color-gray-700)` */
        'basic-gray-700': 'var(--vapor-color-gray-700)',
        /** `var(--vapor-color-gray-800)` */
        'basic-gray-800': 'var(--vapor-color-gray-800)',
        /** `var(--vapor-color-gray-900)` */
        'basic-gray-900': 'var(--vapor-color-gray-900)',
    },

    space: {
        /** `var(--vapor-size-space-000)` */
        'space-000': 'var(--vapor-size-space-000)',
        /** `var(--vapor-size-space-025)` */
        'space-025': 'var(--vapor-size-space-025)',
        /** `var(--vapor-size-space-050)` */
        'space-050': 'var(--vapor-size-space-050)',
        /** `var(--vapor-size-space-075)` */
        'space-075': 'var(--vapor-size-space-075)',
        /** `var(--vapor-size-space-100)` */
        'space-100': 'var(--vapor-size-space-100)',
        /** `var(--vapor-size-space-150)` */
        'space-150': 'var(--vapor-size-space-150)',
        /** `var(--vapor-size-space-175)` */
        'space-175': 'var(--vapor-size-space-175)',
        /** `var(--vapor-size-space-200)` */
        'space-200': 'var(--vapor-size-space-200)',
        /** `var(--vapor-size-space-225)` */
        'space-225': 'var(--vapor-size-space-225)',
        /** `var(--vapor-size-space-250)` */
        'space-250': 'var(--vapor-size-space-250)',
        /** `var(--vapor-size-space-300)` */
        'space-300': 'var(--vapor-size-space-300)',
        /** `var(--vapor-size-space-400)` */
        'space-400': 'var(--vapor-size-space-400)',
        /** `var(--vapor-size-space-500)` */
        'space-500': 'var(--vapor-size-space-500)',
        /** `var(--vapor-size-space-600)` */
        'space-600': 'var(--vapor-size-space-600)',
        /** `var(--vapor-size-space-700)` */
        'space-700': 'var(--vapor-size-space-700)',
        /** `var(--vapor-size-space-800)` */
        'space-800': 'var(--vapor-size-space-800)',
        /** `var(--vapor-size-space-900)` */
        'space-900': 'var(--vapor-size-space-900)',
    },

    margin: {
        /** `var(--vapor-size-space-000)` */
        'space-000': 'var(--vapor-size-space-000)',
        /** `var(--vapor-size-space-025)` */
        'space-025': 'var(--vapor-size-space-025)',
        /** `var(--vapor-size-space-050)` */
        'space-050': 'var(--vapor-size-space-050)',
        /** `var(--vapor-size-space-075)` */
        'space-075': 'var(--vapor-size-space-075)',
        /** `var(--vapor-size-space-100)` */
        'space-100': 'var(--vapor-size-space-100)',
        /** `var(--vapor-size-space-150)` */
        'space-150': 'var(--vapor-size-space-150)',
        /** `var(--vapor-size-space-175)` */
        'space-175': 'var(--vapor-size-space-175)',
        /** `var(--vapor-size-space-200)` */
        'space-200': 'var(--vapor-size-space-200)',
        /** `var(--vapor-size-space-225)` */
        'space-225': 'var(--vapor-size-space-225)',
        /** `var(--vapor-size-space-250)` */
        'space-250': 'var(--vapor-size-space-250)',
        /** `var(--vapor-size-space-300)` */
        'space-300': 'var(--vapor-size-space-300)',
        /** `var(--vapor-size-space-400)` */
        'space-400': 'var(--vapor-size-space-400)',
        /** `var(--vapor-size-space-500)` */
        'space-500': 'var(--vapor-size-space-500)',
        /** `var(--vapor-size-space-600)` */
        'space-600': 'var(--vapor-size-space-600)',
        /** `var(--vapor-size-space-700)` */
        'space-700': 'var(--vapor-size-space-700)',
        /** `var(--vapor-size-space-800)` */
        'space-800': 'var(--vapor-size-space-800)',
        /** `var(--vapor-size-space-900)` */
        'space-900': 'var(--vapor-size-space-900)',
        /** `calc(var(--vapor-size-space-025) * -1)` */
        '-space-025': 'calc(var(--vapor-size-space-025) * -1)',
        /** `calc(var(--vapor-size-space-050) * -1)` */
        '-space-050': 'calc(var(--vapor-size-space-050) * -1)',
        /** `calc(var(--vapor-size-space-075) * -1)` */
        '-space-075': 'calc(var(--vapor-size-space-075) * -1)',
        /** `calc(var(--vapor-size-space-100) * -1)` */
        '-space-100': 'calc(var(--vapor-size-space-100) * -1)',
        /** `calc(var(--vapor-size-space-150) * -1)` */
        '-space-150': 'calc(var(--vapor-size-space-150) * -1)',
        /** `calc(var(--vapor-size-space-175) * -1)` */
        '-space-175': 'calc(var(--vapor-size-space-175) * -1)',
        /** `calc(var(--vapor-size-space-200) * -1)` */
        '-space-200': 'calc(var(--vapor-size-space-200) * -1)',
        /** `calc(var(--vapor-size-space-225) * -1)` */
        '-space-225': 'calc(var(--vapor-size-space-225) * -1)',
        /** `calc(var(--vapor-size-space-250) * -1)` */
        '-space-250': 'calc(var(--vapor-size-space-250) * -1)',
        /** `calc(var(--vapor-size-space-300) * -1)` */
        '-space-300': 'calc(var(--vapor-size-space-300) * -1)',
        /** `calc(var(--vapor-size-space-400) * -1)` */
        '-space-400': 'calc(var(--vapor-size-space-400) * -1)',
        /** `calc(var(--vapor-size-space-500) * -1)` */
        '-space-500': 'calc(var(--vapor-size-space-500) * -1)',
        /** `calc(var(--vapor-size-space-600) * -1)` */
        '-space-600': 'calc(var(--vapor-size-space-600) * -1)',
        /** `calc(var(--vapor-size-space-700) * -1)` */
        '-space-700': 'calc(var(--vapor-size-space-700) * -1)',
        /** `calc(var(--vapor-size-space-800) * -1)` */
        '-space-800': 'calc(var(--vapor-size-space-800) * -1)',
        /** `calc(var(--vapor-size-space-900) * -1)` */
        '-space-900': 'calc(var(--vapor-size-space-900) * -1)',
    },

    dimension: {
        /** `var(--vapor-size-dimension-025)` */
        'dimension-025': 'var(--vapor-size-dimension-025)',
        /** `var(--vapor-size-dimension-050)` */
        'dimension-050': 'var(--vapor-size-dimension-050)',
        /** `var(--vapor-size-dimension-075)` */
        'dimension-075': 'var(--vapor-size-dimension-075)',
        /** `var(--vapor-size-dimension-100)` */
        'dimension-100': 'var(--vapor-size-dimension-100)',
        /** `var(--vapor-size-dimension-150)` */
        'dimension-150': 'var(--vapor-size-dimension-150)',
        /** `var(--vapor-size-dimension-175)` */
        'dimension-175': 'var(--vapor-size-dimension-175)',
        /** `var(--vapor-size-dimension-200)` */
        'dimension-200': 'var(--vapor-size-dimension-200)',
        /** `var(--vapor-size-dimension-225)` */
        'dimension-225': 'var(--vapor-size-dimension-225)',
        /** `var(--vapor-size-dimension-250)` */
        'dimension-250': 'var(--vapor-size-dimension-250)',
        /** `var(--vapor-size-dimension-300)` */
        'dimension-300': 'var(--vapor-size-dimension-300)',
        /** `var(--vapor-size-dimension-400)` */
        'dimension-400': 'var(--vapor-size-dimension-400)',
        /** `var(--vapor-size-dimension-500)` */
        'dimension-500': 'var(--vapor-size-dimension-500)',
        /** `var(--vapor-size-dimension-600)` */
        'dimension-600': 'var(--vapor-size-dimension-600)',
        /** `var(--vapor-size-dimension-700)` */
        'dimension-700': 'var(--vapor-size-dimension-700)',
        /** `var(--vapor-size-dimension-800)` */
        'dimension-800': 'var(--vapor-size-dimension-800)',
    },

    radius: {
        /** `var(--vapor-size-borderRadius-000)` */
        'radius-000': 'var(--vapor-size-borderRadius-000)',
        /** `var(--vapor-size-borderRadius-050)` */
        'radius-050': 'var(--vapor-size-borderRadius-050)',
        /** `var(--vapor-size-borderRadius-100)` */
        'radius-100': 'var(--vapor-size-borderRadius-100)',
        /** `var(--vapor-size-borderRadius-200)` */
        'radius-200': 'var(--vapor-size-borderRadius-200)',
        /** `var(--vapor-size-borderRadius-300)` */
        'radius-300': 'var(--vapor-size-borderRadius-300)',
        /** `var(--vapor-size-borderRadius-400)` */
        'radius-400': 'var(--vapor-size-borderRadius-400)',
        /** `var(--vapor-size-borderRadius-500)` */
        'radius-500': 'var(--vapor-size-borderRadius-500)',
        /** `var(--vapor-size-borderRadius-600)` */
        'radius-600': 'var(--vapor-size-borderRadius-600)',
        /** `var(--vapor-size-borderRadius-700)` */
        'radius-700': 'var(--vapor-size-borderRadius-700)',
        /** `var(--vapor-size-borderRadius-800)` */
        'radius-800': 'var(--vapor-size-borderRadius-800)',
        /** `var(--vapor-size-borderRadius-900)` */
        'radius-900': 'var(--vapor-size-borderRadius-900)',
    },

    shadow: {
        /** `var(--vapor-shadow-sm)` */
        'shadow-sm': 'var(--vapor-shadow-sm)',
        /** `var(--vapor-shadow-md)` */
        'shadow-md': 'var(--vapor-shadow-md)',
        /** `var(--vapor-shadow-lg)` */
        'shadow-lg': 'var(--vapor-shadow-lg)',
        /** `var(--vapor-shadow-xl)` */
        'shadow-xl': 'var(--vapor-shadow-xl)',
    },

    fontSize: {
        /** `var(--vapor-typography-fontSize-025)` */
        'fontSize-025': 'var(--vapor-typography-fontSize-025)',
        /** `var(--vapor-typography-fontSize-050)` */
        'fontSize-050': 'var(--vapor-typography-fontSize-050)',
        /** `var(--vapor-typography-fontSize-075)` */
        'fontSize-075': 'var(--vapor-typography-fontSize-075)',
        /** `var(--vapor-typography-fontSize-100)` */
        'fontSize-100': 'var(--vapor-typography-fontSize-100)',
        /** `var(--vapor-typography-fontSize-200)` */
        'fontSize-200': 'var(--vapor-typography-fontSize-200)',
        /** `var(--vapor-typography-fontSize-300)` */
        'fontSize-300': 'var(--vapor-typography-fontSize-300)',
        /** `var(--vapor-typography-fontSize-400)` */
        'fontSize-400': 'var(--vapor-typography-fontSize-400)',
        /** `var(--vapor-typography-fontSize-500)` */
        'fontSize-500': 'var(--vapor-typography-fontSize-500)',
        /** `var(--vapor-typography-fontSize-600)` */
        'fontSize-600': 'var(--vapor-typography-fontSize-600)',
        /** `var(--vapor-typography-fontSize-700)` */
        'fontSize-700': 'var(--vapor-typography-fontSize-700)',
        /** `var(--vapor-typography-fontSize-800)` */
        'fontSize-800': 'var(--vapor-typography-fontSize-800)',
        /** `var(--vapor-typography-fontSize-900)` */
        'fontSize-900': 'var(--vapor-typography-fontSize-900)',
        /** `var(--vapor-typography-fontSize-1000)` */
        'fontSize-1000': 'var(--vapor-typography-fontSize-1000)',
    },

    lineHeight: {
        /** `var(--vapor-typography-lineHeight-025)` */
        'lineHeight-025': 'var(--vapor-typography-lineHeight-025)',
        /** `var(--vapor-typography-lineHeight-050)` */
        'lineHeight-050': 'var(--vapor-typography-lineHeight-050)',
        /** `var(--vapor-typography-lineHeight-075)` */
        'lineHeight-075': 'var(--vapor-typography-lineHeight-075)',
        /** `var(--vapor-typography-lineHeight-100)` */
        'lineHeight-100': 'var(--vapor-typography-lineHeight-100)',
        /** `var(--vapor-typography-lineHeight-200)` */
        'lineHeight-200': 'var(--vapor-typography-lineHeight-200)',
        /** `var(--vapor-typography-lineHeight-300)` */
        'lineHeight-300': 'var(--vapor-typography-lineHeight-300)',
        /** `var(--vapor-typography-lineHeight-400)` */
        'lineHeight-400': 'var(--vapor-typography-lineHeight-400)',
        /** `var(--vapor-typography-lineHeight-500)` */
        'lineHeight-500': 'var(--vapor-typography-lineHeight-500)',
        /** `var(--vapor-typography-lineHeight-600)` */
        'lineHeight-600': 'var(--vapor-typography-lineHeight-600)',
        /** `var(--vapor-typography-lineHeight-700)` */
        'lineHeight-700': 'var(--vapor-typography-lineHeight-700)',
        /** `var(--vapor-typography-lineHeight-800)` */
        'lineHeight-800': 'var(--vapor-typography-lineHeight-800)',
        /** `var(--vapor-typography-lineHeight-900)` */
        'lineHeight-900': 'var(--vapor-typography-lineHeight-900)',
        /** `var(--vapor-typography-lineHeight-1000)` */
        'lineHeight-1000': 'var(--vapor-typography-lineHeight-1000)',
    },

    letterSpacing: {
        /** `var(--vapor-typography-letterSpacing-000)` */
        'letterSpacing-000': 'var(--vapor-typography-letterSpacing-000)',
        /** `var(--vapor-typography-letterSpacing-100)` */
        'letterSpacing-100': 'var(--vapor-typography-letterSpacing-100)',
        /** `var(--vapor-typography-letterSpacing-200)` */
        'letterSpacing-200': 'var(--vapor-typography-letterSpacing-200)',
        /** `var(--vapor-typography-letterSpacing-300)` */
        'letterSpacing-300': 'var(--vapor-typography-letterSpacing-300)',
        /** `var(--vapor-typography-letterSpacing-400)` */
        'letterSpacing-400': 'var(--vapor-typography-letterSpacing-400)',
    },

    fontWeight: {
        /** `var(--vapor-typography-fontWeight-400)` */
        'fontWeight-400': 'var(--vapor-typography-fontWeight-400)',
        /** `var(--vapor-typography-fontWeight-500)` */
        'fontWeight-500': 'var(--vapor-typography-fontWeight-500)',
        /** `var(--vapor-typography-fontWeight-700)` */
        'fontWeight-700': 'var(--vapor-typography-fontWeight-700)',
        /** `var(--vapor-typography-fontWeight-800)` */
        'fontWeight-800': 'var(--vapor-typography-fontWeight-800)',
    },

    fontFamily: {
        /** `var(--vapor-typography-fontFamily-sans)` */
        'fontFamily-sans': 'var(--vapor-typography-fontFamily-sans)',
        /** `var(--vapor-typography-fontFamily-code)` */
        'fontFamily-code': 'var(--vapor-typography-fontFamily-code)',
    },
} as const;

export type Tokens = typeof tokens;
