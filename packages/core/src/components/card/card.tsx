'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

export const CardRoot = forwardRef<HTMLDivElement, CardRoot.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.root, className),
            ...componentProps,
        },
    });
});
CardRoot.displayName = 'Card.Root';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

export const CardHeader = forwardRef<HTMLDivElement, CardHeader.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.header, className),
            ...componentProps,
        },
    });
});
CardHeader.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

export const CardBody = forwardRef<HTMLDivElement, CardBody.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.body, className),
            ...componentProps,
        },
    });
});
CardBody.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

export const CardFooter = forwardRef<HTMLDivElement, CardFooter.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.footer, className),
            ...componentProps,
        },
    });
});
CardFooter.displayName = 'Card.Footer';

/* -----------------------------------------------------------------------------------------------*/

export namespace CardRoot {
    type RootPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends RootPrimitiveProps {}
}

export namespace CardHeader {
    type HeaderPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends HeaderPrimitiveProps {}
}

export namespace CardBody {
    type BodyPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends BodyPrimitiveProps {}
}

export namespace CardFooter {
    type FooterPrimitiveProps = VComponentProps<'div'>;

    export interface Props extends FooterPrimitiveProps {}
}
