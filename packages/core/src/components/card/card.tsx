'use client';

import { forwardRef } from 'react';

import { useRenderElement } from '~/hooks/use-render-element';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

export const CardRoot = forwardRef<HTMLDivElement, CardRoot.Props>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: [styles.root, className],
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

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: [styles.header, className],
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

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: [styles.body, className],
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

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: {
            className: [styles.footer, className],
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
