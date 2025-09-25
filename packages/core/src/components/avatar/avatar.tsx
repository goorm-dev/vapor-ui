'use client';

import { forwardRef } from 'react';

import { Avatar as BaseAvatar } from '@base-ui-components/react/avatar';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { vars } from '~/styles/vars.css';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import type { FallbackVariants, RootVariants } from './avatar.css';
import * as styles from './avatar.css';

type AvatarVariants = RootVariants & FallbackVariants;
type AvatarSharedProps = AvatarVariants & { src?: string; alt: string; delay?: number };

const [AvatarProvider, useAvatarContext] = createContext<AvatarSharedProps>({
    name: 'AvatarContext',
    providerName: 'AvatarProvider',
    hookName: 'useAvatarContext',
});

/* -----------------------------------------------------------------------------------------------*/

type AvatarRootPrimitiveProps = VComponentProps<typeof BaseAvatar.Root>;
interface AvatarRootProps {
    /**
     * Callback fired when the loading status changes.
     */
    size: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * ko: 사용자 프로필 사진, 이니셜 또는 대체 아이콘을 표시합니다.
 * en: Displays a user's profile picture, initials, or fallback icon.
 * Renders a `<span>` element.
 *
 * Documentation: [Base UI Avatar](https://base-ui.com/react/components/avatar)
 */
const Root = forwardRef<HTMLSpanElement, AvatarRootProps>(({ className, ...props }, ref) => {
    const [variantProps, otherProps] = createSplitProps<AvatarSharedProps>()(props, [
        'src',
        'alt',
        'size',
        'shape',
        'delay',
    ]);

    const { shape, size } = variantProps;

    return (
        <AvatarProvider value={variantProps}>
            <BaseAvatar.Root
                ref={ref}
                className={clsx(styles.root({ shape, size }), className)}
                {...otherProps}
            />
        </AvatarProvider>
    );
});

Root.displayName = 'Avatar.Root';

/* -------------------------------------------------------------------------------------------------
 * Avatar.Image
 * -----------------------------------------------------------------------------------------------*/

type AvatarImagePrimitiveProps = VComponentProps<typeof BaseAvatar.Image>;
interface AvatarImageProps extends Omit<AvatarImagePrimitiveProps, keyof AvatarSharedProps> {}

const Image = forwardRef<HTMLImageElement, AvatarImageProps>(({ className, ...props }, ref) => {
    const { src, alt } = useAvatarContext();

    return (
        <BaseAvatar.Image
            ref={ref}
            src={src}
            alt={alt}
            className={clsx(styles.image, className)}
            {...props}
        />
    );
});
Image.displayName = 'Avatar.Image';

/* -------------------------------------------------------------------------------------------------
 * Avatar.Fallback
 * -----------------------------------------------------------------------------------------------*/

type AvatarFallbackPrimitiveProps = VComponentProps<typeof BaseAvatar.Fallback>;
interface AvatarFallbackProps extends Omit<AvatarFallbackPrimitiveProps, keyof AvatarSharedProps> {}

const Fallback = forwardRef<HTMLSpanElement, AvatarFallbackProps>(
    ({ className, style, children, ...props }, ref) => {
        const { size, alt, delay } = useAvatarContext();
        const background = getRandomColor(alt);

        return (
            <BaseAvatar.Fallback
                ref={ref}
                delay={delay}
                style={{
                    ...assignInlineVars({ [styles.fallbackBgVar]: background }),
                    ...style,
                }}
                className={clsx(styles.fallback({ size }), className)}
                {...props}
            >
                {children ?? getAvatarInitials(alt)}
            </BaseAvatar.Fallback>
        );
    },
);
Fallback.displayName = 'Avatar.Fallback';

/* -------------------------------------------------------------------------------------------------
 * Avatar.Simple
 * -----------------------------------------------------------------------------------------------*/

interface AvatarSimpleProps extends AvatarRootProps {}

const Simple = forwardRef<HTMLSpanElement, AvatarSimpleProps>((props, ref) => {
    return (
        <Root ref={ref} {...props}>
            <Fallback />
            <Image />
        </Root>
    );
});
Simple.displayName = 'Avatar.Simple';

/* -----------------------------------------------------------------------------------------------*/

// get first letter of the name
const getAvatarInitials = (name = 'vapor') => {
    return name.charAt(0).toUpperCase();
};

/**
 * Linear Congruential Generator (LCG)
 * @link https://ko.wikipedia.org/wiki/%EC%84%A0%ED%98%95_%ED%95%A9%EB%8F%99_%EC%83%9D%EC%84%B1%EA%B8%B0
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

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as AvatarRoot,
    Image as AvatarImage,
    Fallback as AvatarFallback,
    Simple as AvatarSimple,
};
export type { AvatarRootProps, AvatarImageProps, AvatarFallbackProps, AvatarSimpleProps };

export const Avatar = { Root, Image, Fallback, Simple };
