// @ts-nocheck
import { recipe } from '@vanilla-extract/recipes';

export const root = recipe({
    base: { display: 'flex' },
    defaultVariants: { orientation: 'horizontal' },
    variants: {
        orientation: {
            horizontal: { flexDirection: 'column' },
            vertical: { flexDirection: 'row' },
        },
    },
});

export const list = recipe({
    base: { position: 'relative', gap: '8px' },
    defaultVariants: { variant: 'line', orientation: 'horizontal' },
    variants: {
        orientation: {
            horizontal: { display: 'flex' },
            vertical: { display: 'inline-flex', flexDirection: 'column' },
        },
        variant: {
            line: {},
            fill: {},
        },
    },
});

export const button = recipe({
    base: { display: 'inline-flex', alignItems: 'center' },
    defaultVariants: { size: 'md', variant: 'line', orientation: 'horizontal' },
    variants: {
        size: {
            sm: { height: '32px' },
            md: { height: '40px' },
            lg: { height: '48px' },
        },
        orientation: {
            horizontal: {},
            vertical: {},
        },
        variant: {
            line: {},
            fill: {},
        },
    },
});

export const indicator = recipe({
    base: { position: 'absolute' },
    defaultVariants: { orientation: 'horizontal', variant: 'line' },
    variants: {
        orientation: {
            horizontal: { bottom: 0, left: 0 },
            vertical: { top: 0, right: 0 },
        },
        variant: {
            line: { backgroundColor: 'blue' },
            fill: { backgroundColor: 'gray' },
        },
    },
});

// Non-recipe export (plain style)
export const icon = { display: 'flex', flexShrink: 0 };
