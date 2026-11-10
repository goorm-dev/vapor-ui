import { recipe } from '@vanilla-extract/recipes';

export const root = recipe({
    variants: { size: { md: {}, lg: {} } },
    defaultVariants: { size: 'md' },
});
