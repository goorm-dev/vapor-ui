'use client';

import type { ReactElement } from 'react';
import { forwardRef, useMemo } from 'react';

import { useRender } from '@base-ui-components/react';
import { Avatar as BaseAvatar } from '@base-ui-components/react/avatar';
import { assignInlineVars } from '@vanilla-extract/dynamic';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { vars } from '~/styles/themes.css';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { Assign, VComponentProps } from '~/utils/types';

import type { FallbackVariants, RootVariants } from './avatar.css';
import * as styles from './avatar.css';

const [AvatarProvider, useAvatarContext] = createContext<AvatarContext>({
    name: 'AvatarContext',
    providerName: 'AvatarProvider',
    hookName: 'useAvatarContext',
});

/* -----------------------------------------------------------------------------------------------*/

export const AvatarRoot = forwardRef<HTMLSpanElement, AvatarRoot.Props>((props, ref) => {
    const { imageElement, fallbackElement, className, children, ...componentProps } =
        resolveStyles(props);

    const [variantProps, otherProps] = createSplitProps<AvatarContext>()(componentProps, [
        'src',
        'alt',
        'size',
        'shape',
        'delay',
        'crossOrigin',
        'decoding',
        'fetchPriority',
        'height',
        'loading',
        'onLoadingStatusChange',
        'referrerPolicy',
        'sizes',
        'srcSet',
        'width',
        'useMap',
    ]);

    const { shape, size } = variantProps;
    const contextValue = useMemo(() => variantProps, [variantProps]);

    const image = useRender({
        render: createRender(imageElement, <AvatarImagePrimitive />),
    });

    const fallback = useRender({
        render: createRender(fallbackElement, <AvatarFallbackPrimitive />),
        props: { children },
    });

    return (
        <AvatarProvider value={contextValue}>
            <BaseAvatar.Root
                ref={ref}
                className={clsx(styles.root({ shape, size }), className)}
                {...otherProps}
            >
                {image}
                {fallback}
            </BaseAvatar.Root>
        </AvatarProvider>
    );
});
AvatarRoot.displayName = 'Avatar.Root';

/* -------------------------------------------------------------------------------------------------
 * Avatar.ImagePrimitive
 * -----------------------------------------------------------------------------------------------*/

export const AvatarImagePrimitive = forwardRef<HTMLImageElement, AvatarImagePrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);
        const context = useAvatarContext();

        const [imageProps] = createSplitProps<ImageProps>()(context, [
            'alt',
            'src',
            'crossOrigin',
            'decoding',
            'fetchPriority',
            'height',
            'loading',
            'onLoadingStatusChange',
            'referrerPolicy',
            'sizes',
            'srcSet',
            'width',
            'useMap',
        ]);

        return (
            <BaseAvatar.Image
                ref={ref}
                className={clsx(styles.image, className)}
                {...imageProps}
                {...componentProps}
            />
        );
    },
);
AvatarImagePrimitive.displayName = 'Avatar.ImagePrimitive';

/* -------------------------------------------------------------------------------------------------
 * Avatar.FallbackPrimitive
 * -----------------------------------------------------------------------------------------------*/

export const AvatarFallbackPrimitive = forwardRef<HTMLSpanElement, AvatarFallbackPrimitive.Props>(
    (props, ref) => {
        const { className, style, children, ...componentProps } = resolveStyles(props);
        const { size, alt, delay } = useAvatarContext();
        const background = getRandomColor(alt ?? '');

        const mergedStyle = {
            ...assignInlineVars({ [styles.fallbackBgVar]: background }),
            ...style,
        };

        return (
            <BaseAvatar.Fallback
                ref={ref}
                delay={delay}
                style={mergedStyle}
                className={clsx(styles.fallback({ size }), className)}
                {...componentProps}
            >
                {children ?? getAvatarInitials(alt)}
            </BaseAvatar.Fallback>
        );
    },
);
AvatarFallbackPrimitive.displayName = 'Avatar.FallbackPrimitive';

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

type ImageProps = Omit<BaseAvatar.Image.Props, keyof BaseAvatar.Root.Props>;

type AvatarVariants = RootVariants & FallbackVariants;
type AvatarContext = AvatarVariants & ImageProps & Pick<BaseAvatar.Fallback.Props, 'delay'>;

export namespace AvatarRoot {
    type RootPrimitiveProps = VComponentProps<typeof BaseAvatar.Root>;
    type SubElementProps = {
        imageElement?: ReactElement<AvatarImagePrimitive.Props>;
        fallbackElement?: ReactElement<AvatarFallbackPrimitive.Props>;
    };

    export interface Props extends Assign<RootPrimitiveProps, AvatarContext>, SubElementProps {}
    export interface State extends BaseAvatar.Root.State {}
}

export namespace AvatarImagePrimitive {
    type ImagePrimitiveProps = VComponentProps<typeof BaseAvatar.Image>;

    export interface Props extends Omit<ImagePrimitiveProps, keyof AvatarContext> {}
}

export namespace AvatarFallbackPrimitive {
    type FallbackPrimitiveProps = VComponentProps<typeof BaseAvatar.Fallback>;

    export interface Props extends Omit<FallbackPrimitiveProps, keyof AvatarContext> {}
}
