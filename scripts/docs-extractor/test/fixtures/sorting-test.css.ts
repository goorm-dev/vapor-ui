// @ts-nocheck
import { recipe } from '@vanilla-extract/recipes';

export const root = recipe({
    base: {
        display: 'block',
    },
    defaultVariants: { size: 'md', variant: 'fill' },
    variants: {
        size: {
            sm: {},
            md: {},
            lg: {},
        },
        variant: {
            fill: {},
            outline: {},
        },
    },
});

export interface SortingTestVariants {
    size?: 'sm' | 'md' | 'lg';
    variant?: 'fill' | 'outline';
}
