import { createSprinkles, defineProperties } from '@vanilla-extract/sprinkles';

import { vars } from '~/styles/vars.css';

const typographies = {
    display1: {
        fontSize: vars.typography.fontSize['1000'],
        fontWeight: vars.typography.fontWeight[800],
        lineHeight: vars.typography.lineHeight['1000'],
        letterSpacing: vars.typography.letterSpacing['400'],
    },
    display2: {
        fontSize: vars.typography.fontSize['900'],
        fontWeight: vars.typography.fontWeight[800],
        lineHeight: vars.typography.lineHeight['900'],
        letterSpacing: vars.typography.letterSpacing['400'],
    },
    display3: {
        fontSize: vars.typography.fontSize['800'],
        fontWeight: vars.typography.fontWeight[800],
        lineHeight: vars.typography.lineHeight['800'],
        letterSpacing: vars.typography.letterSpacing['400'],
    },
    display4: {
        fontSize: vars.typography.fontSize['700'],
        fontWeight: vars.typography.fontWeight[800],
        lineHeight: vars.typography.lineHeight['700'],
        letterSpacing: vars.typography.letterSpacing['400'],
    },
    heading1: {
        fontSize: vars.typography.fontSize['600'],
        fontWeight: vars.typography.fontWeight[700],
        lineHeight: vars.typography.lineHeight['600'],
        letterSpacing: vars.typography.letterSpacing['400'],
    },
    heading2: {
        fontSize: vars.typography.fontSize['500'],
        fontWeight: vars.typography.fontWeight[700],
        lineHeight: vars.typography.lineHeight['500'],
        letterSpacing: vars.typography.letterSpacing['400'],
    },
    heading3: {
        fontSize: vars.typography.fontSize['400'],
        fontWeight: vars.typography.fontWeight[700],
        lineHeight: vars.typography.lineHeight['400'],
        letterSpacing: vars.typography.letterSpacing['300'],
    },
    heading4: {
        fontSize: vars.typography.fontSize['300'],
        fontWeight: vars.typography.fontWeight[700],
        lineHeight: vars.typography.lineHeight['300'],
        letterSpacing: vars.typography.letterSpacing['200'],
    },
    heading5: {
        fontSize: vars.typography.fontSize['200'],
        fontWeight: vars.typography.fontWeight[700],
        lineHeight: vars.typography.lineHeight['200'],
        letterSpacing: vars.typography.letterSpacing['100'],
    },
    heading6: {
        fontSize: vars.typography.fontSize['100'],
        fontWeight: vars.typography.fontWeight[500],
        lineHeight: vars.typography.lineHeight['100'],
        letterSpacing: vars.typography.letterSpacing['100'],
    },
    subtitle1: {
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight[500],
        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing['100'],
    },
    subtitle2: {
        fontSize: vars.typography.fontSize['050'],
        fontWeight: vars.typography.fontWeight[500],
        lineHeight: vars.typography.lineHeight['050'],
        letterSpacing: vars.typography.letterSpacing['000'],
    },
    body1: {
        fontSize: vars.typography.fontSize['100'],
        fontWeight: vars.typography.fontWeight[400],
        lineHeight: vars.typography.lineHeight['100'],
        letterSpacing: vars.typography.letterSpacing['100'],
    },
    body2: {
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight[400],
        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing['100'],
    },
    body3: {
        fontSize: vars.typography.fontSize['050'],
        fontWeight: vars.typography.fontWeight[400],
        lineHeight: vars.typography.lineHeight['050'],
        letterSpacing: vars.typography.letterSpacing['100'],
    },
    body4: {
        fontSize: vars.typography.fontSize['025'],
        fontWeight: vars.typography.fontWeight[400],
        lineHeight: vars.typography.lineHeight['025'],
        letterSpacing: vars.typography.letterSpacing['000'],
    },
    code1: {
        fontSize: vars.typography.fontSize['075'],
        fontWeight: vars.typography.fontWeight[400],
        lineHeight: vars.typography.lineHeight['075'],
        letterSpacing: vars.typography.letterSpacing['000'],
    },
    code2: {
        fontSize: vars.typography.fontSize['050'],
        fontWeight: vars.typography.fontWeight[400],
        lineHeight: vars.typography.lineHeight['050'],
        letterSpacing: vars.typography.letterSpacing['000'],
    },
};

const typographyProperties = defineProperties({
    properties: { typography: typographies },
});

export const typographySprinkles = createSprinkles(typographyProperties);
export type Typography = keyof typeof typographies;
