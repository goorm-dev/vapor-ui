import { vars } from '~/styles/vars.css';

export type Offset = keyof typeof vars.size.space;

const getScaleFactor = () => {
    if (typeof window !== 'undefined') {
        const computedStyle = getComputedStyle(document.documentElement);
        const scaleFactor = parseFloat(computedStyle.getPropertyValue('--vapor-scale-factor'));

        return scaleFactor;
    }

    return 1;
};

const createOffsets = () => {
    const scaleFactor = getScaleFactor();

    return {
        '000': scaleFactor * 0,
        '025': scaleFactor * 2,
        '050': scaleFactor * 4,
        '075': scaleFactor * 6,
        '100': scaleFactor * 8,
        '150': scaleFactor * 12,
        '175': scaleFactor * 14,
        '200': scaleFactor * 16,
        '225': scaleFactor * 18,
        '250': scaleFactor * 20,
        '300': scaleFactor * 24,
        '400': scaleFactor * 32,
        '500': scaleFactor * 40,
        '600': scaleFactor * 48,
        '700': scaleFactor * 56,
        '800': scaleFactor * 64,
        '900': scaleFactor * 72,
    };
};

export const offsets = createOffsets();

const spaceKeys = Object.keys(vars.size.space);
const isSpaceToken = (value?: Offset | number): value is Offset => {
    return typeof value === 'string' && spaceKeys.includes(value);
};

export const calculateOffset = (value?: Offset | number) => {
    if (!value) return;
    if (isSpaceToken(value)) return offsets[value];

    return value;
};
