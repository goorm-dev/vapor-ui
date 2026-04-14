'use client';

import type { ReactElement } from 'react';
import { forwardRef, useMemo } from 'react';

import { Avatar as BaseAvatar } from '@base-ui/react/avatar';
import { assignInlineVars } from '@vanilla-extract/dynamic';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { vars } from '~/styles/themes.css';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import { mergeStatefulProps } from '~/utils/stateful-props';
import type { Assign, VaporUIComponentProps } from '~/utils/types';

import type { FallbackVariants, RootVariants } from './avatar.css';
import * as styles from './avatar.css';

const [AvatarProvider, useAvatarContext] = createContext<AvatarContext>({
    name: 'AvatarContext',
    providerName: 'AvatarProvider',
    hookName: 'useAvatarContext',
});

/* -----------------------------------------------------------------------------------------------*/

/**
 * Avatar component for displaying a user's profile image with an automatic initial-based fallback. Renders a `<span>` element.
 *
 * @forwardedProps {AvatarImagePrimitive} src alt crossOrigin decoding fetchPriority height loading referrerPolicy sizes srcSet width useMap onLoadingStatusChange
 * @forwardedProps {AvatarFallbackPrimitive} delay
 */
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

    const imageRender = createRender(imageElement, <AvatarImagePrimitive />);
    const image = useRenderElement({
        render: imageRender,
    });

    const fallbackRender = createRender(fallbackElement, <AvatarFallbackPrimitive />);
    const fallback = useRenderElement({
        render: fallbackRender,
        props: { children },
    });

    return (
        <AvatarProvider value={contextValue}>
            <BaseAvatar.Root
                ref={ref}
                className={cn(styles.root({ shape, size }), className)}
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

/**
 * Image part of the avatar that renders the profile picture. Renders an `<img>` element.
 */
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
                className={cn(styles.image, className)}
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

/**
 * Fallback part of the avatar shown when the image fails to load or is not provided. Displays initials derived from the `alt` text. Renders a `<span>` element.
 */
export const AvatarFallbackPrimitive = forwardRef<HTMLSpanElement, AvatarFallbackPrimitive.Props>(
    (props, ref) => {
        const { className, style, children, ...componentProps } = resolveStyles(props);
        const { size, alt, delay } = useAvatarContext();
        const background = getRandomColor(alt ?? '');

        const { style: mergedStyle } = mergeStatefulProps(
            { style: assignInlineVars({ [styles.fallbackBgVar]: background }) },
            { style },
        );

        return (
            <BaseAvatar.Fallback
                ref={ref}
                delay={delay}
                style={mergedStyle}
                className={cn(styles.fallback({ size }), className)}
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

export interface AvatarRootProps extends Assign<
    VaporUIComponentProps<typeof BaseAvatar.Root, AvatarRoot.State>,
    AvatarContext
> {
    /**
     * A Custom element for Avatar.ImagePrimitive. If not provided, the default Avatar.ImagePrimitive will be rendered.
     */
    imageElement?: ReactElement<AvatarImagePrimitive.Props>;
    /**
     * A Custom element for Avatar.FallbackPrimitive. If not provided, the default Avatar.FallbackPrimitive will be rendered.
     */
    fallbackElement?: ReactElement<AvatarFallbackPrimitive.Props>;
}

export namespace AvatarRoot {
    export type State = BaseAvatar.Root.State;
    export type Props = AvatarRootProps;
}

export namespace AvatarImagePrimitive {
    export type State = BaseAvatar.Image.State;
    export type Props = Omit<
        VaporUIComponentProps<typeof BaseAvatar.Image, State>,
        keyof AvatarContext
    >;
}

export namespace AvatarFallbackPrimitive {
    export type State = BaseAvatar.Fallback.State;
    export type Props = Omit<
        VaporUIComponentProps<typeof BaseAvatar.Fallback, State>,
        keyof AvatarContext
    >;
}
