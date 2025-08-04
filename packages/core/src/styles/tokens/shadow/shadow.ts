import { LIGHT_BASIC_COLORS } from '../color/basic-color';

export const BOX_SHADOW = {
    shadow: {
        sm: `0 0.0625rem 0.1875rem color-mix(in srgb, ${LIGHT_BASIC_COLORS.black} 20%, transparent)`,
        md: `0 0.125rem 0.625rem color-mix(in srgb, ${LIGHT_BASIC_COLORS.black} 20%, transparent)`,
        lg: `0 0.25rem 1rem color-mix(in srgb, ${LIGHT_BASIC_COLORS.black} 20%, transparent)`,
        xl: `0 1rem 2rem color-mix(in srgb, ${LIGHT_BASIC_COLORS.black} 20%, transparent)`,
    },
};
