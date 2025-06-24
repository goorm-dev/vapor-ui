import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import * as styles from './avatar.css';
import {
    Root as RadixAvatar,
    Fallback as RadixFallback,
    Image as RadixImage,
} from '@radix-ui/react-avatar';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { vars } from '~/styles/contract.css';
import { createSplitProps } from '~/utils/create-split-props';

type AvatarVariants = MergeRecipeVariants<typeof styles.root | typeof styles.fallback>;
type AvatarSharedProps = AvatarVariants & { src?: string; alt: string; delayMs?: number };

const [AvatarProvider, useAvatarContext] = createContext<AvatarSharedProps>({
    name: 'AvatarContext',
    providerName: 'AvatarProvider',
    hookName: 'useAvatarContext',
});

/* -----------------------------------------------------------------------------------------------*/

type AvatarRootPrimitiveProps = ComponentPropsWithoutRef<typeof RadixAvatar>;
interface AvatarRootProps extends AvatarRootPrimitiveProps, AvatarSharedProps {}

const Root = forwardRef<HTMLSpanElement, AvatarRootProps>(({ className, ...props }, ref) => {
    const [variantProps, otherProps] = createSplitProps<AvatarSharedProps>()(props, [
        'src',
        'alt',
        'size',
        'shape',
        'delayMs',
    ]);

    const { shape, size } = variantProps;

    return (
        <AvatarProvider value={variantProps}>
            <RadixAvatar
                ref={ref}
                className={clsx(styles.root({ shape, size }), className)}
                {...otherProps}
            />
        </AvatarProvider>
    );
});

/* -------------------------------------------------------------------------------------------------
 * Avatar.Image
 * -----------------------------------------------------------------------------------------------*/

type AvatarImagePrimitiveProps = ComponentPropsWithoutRef<typeof RadixImage>;
interface AvatarImageProps extends Omit<AvatarImagePrimitiveProps, keyof AvatarSharedProps> {}

const Image = forwardRef<HTMLImageElement, AvatarImageProps>(({ className, ...props }, ref) => {
    const { src, alt } = useAvatarContext();

    return (
        <RadixImage
            ref={ref}
            src={src}
            alt={alt}
            className={clsx(styles.image, className)}
            {...props}
        />
    );
});

/* -------------------------------------------------------------------------------------------------
 * Avatar.Fallback
 * -----------------------------------------------------------------------------------------------*/

type AvatarFallbackPrimitiveProps = ComponentPropsWithoutRef<typeof RadixFallback>;
interface AvatarFallbackProps extends Omit<AvatarFallbackPrimitiveProps, keyof AvatarSharedProps> {}

const Fallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
    ({ className, style, ...props }, ref) => {
        const { size, alt, delayMs } = useAvatarContext();
        const background = getRandomColor(alt);

        return (
            <RadixFallback
                ref={ref}
                delayMs={delayMs}
                style={{
                    ...assignInlineVars({ [styles.fallbackBgVar]: background }),
                    ...style,
                }}
                className={clsx(styles.fallback({ size }), className)}
                {...props}
            >
                {getAvatarInitials(alt)}
            </RadixFallback>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Avatar.Simple
 * -----------------------------------------------------------------------------------------------*/

type AvatarSimplePrimitiveProps = ComponentPropsWithoutRef<typeof Root>;
interface AvatarProps extends AvatarSimplePrimitiveProps {}

const Simple = forwardRef<HTMLSpanElement, AvatarProps>((props, ref) => {
    return (
        <Root ref={ref} {...props}>
            <Fallback />
            <Image />
        </Root>
    );
});

export const Avatar = Object.assign(Root, { Image, Fallback, Simple });
export type { AvatarProps };

/* -----------------------------------------------------------------------------------------------*/

// get first letter of the name
const getAvatarInitials = (name = 'vapor') => {
    return name.charAt(0).toUpperCase();
};

/**
 * Linear Congruential Generator (LCG)
 * - Recurrence relation: Xn+1 = (a * Xn + c) % m
 * - Reference: https://ko.wikipedia.org/wiki/%EC%84%A0%ED%98%95_%ED%95%A9%EB%8F%99_%EC%83%9D%EC%84%B1%EA%B8%B0
 *
 * The Linear Congruential Generator returns a unique value with the following parameters:
 * - 0 < m (modulus)
 * - 0 < a (multiplier) < m
 * - 0 <= c (increment) < m
 * - 0 <= X0 (seed) < m
 *
 * @param value Alternative text to randomize
 * @param m Number of colors to select through randomization
 * @returns Randomized value of the alternative text (0 <= number < m)
 */
const stringAsciiPRNG = (value: string, m: number) => {
    const charCodes = value.split('').map((letter) => letter.charCodeAt(0));
    const len = charCodes.length;

    const a = (len % (m - 1)) + 1;
    const c = charCodes.reduce((current, next) => current + next) % m;

    const random = charCodes.reduce((acc, cur) => {
        if (!acc) return cur % m;

        return (a * acc + c) % m;
    }, 0);

    return random;
};

const getRandomNumber = (maxNumber: number) => {
    const randomNumber = Math.floor(Math.random() * maxNumber);

    return randomNumber;
};

const DEFAULT_COLORS: string[] = [
    vars.color.red['500'],
    vars.color.pink['500'],
    vars.color.grape['500'],
    vars.color.violet['500'],
    vars.color.blue['500'],
    vars.color.green['500'],
    vars.color.orange['500'],
];

/**
 * Returns a random color if the alternative text is an empty string.
 * Returns a specific color by the Linear Congruential Generator algorithm if the alternative text exists.
 *
 * @param value Alternative text
 * @param colors Types of colors to select from
 * @returns Color CSS Variables
 */
const getRandomColor = (value: string, colors: string[] = DEFAULT_COLORS) => {
    if (!value) return colors[getRandomNumber(colors.length)];

    return colors[stringAsciiPRNG(value, colors.length)];
};
