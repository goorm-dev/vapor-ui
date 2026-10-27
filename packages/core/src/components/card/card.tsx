'use client';

import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the Card compound component, a bordered container that groups related content and actions. Renders a `<div>` element.
 */
export const CardRoot = forwardRef<HTMLDivElement, CardRoot.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.root, className),
            ...componentProps,
        },
    });
});
CardRoot.displayName = 'Card.Root';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

/**
 * Top section of the card, typically containing a title, separated from the body by a border. Renders a `<div>` element.
 */
export const CardHeader = forwardRef<HTMLDivElement, CardHeader.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.header, className),
            ...componentProps,
        },
    });
});
CardHeader.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

/**
 * Main content area of the card. Renders a `<div>` element.
 */
export const CardBody = forwardRef<HTMLDivElement, CardBody.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.body, className),
            ...componentProps,
        },
    });
});
CardBody.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

/**
 * Bottom section of the card, typically containing action buttons, separated from the body by a border. Renders a `<div>` element.
 */
export const CardFooter = forwardRef<HTMLDivElement, CardFooter.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: cn(styles.footer, className),
            ...componentProps,
        },
    });
});
CardFooter.displayName = 'Card.Footer';

/* -----------------------------------------------------------------------------------------------*/

export namespace CardRoot {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}

export namespace CardHeader {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}

export namespace CardBody {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}

export namespace CardFooter {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}
