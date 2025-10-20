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

interface CardRootProps extends VComponentProps<'div'> {}

const Root = forwardRef<HTMLDivElement, CardRootProps>((props, ref) => {
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
Root.displayName = 'Card';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

interface CardHeaderProps extends VComponentProps<'div'> {}

const Header = forwardRef<HTMLDivElement, CardHeaderProps>((props, ref) => {
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
Header.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

interface CardBodyProps extends VComponentProps<'div'> {}

const Body = forwardRef<HTMLDivElement, CardBodyProps>((props, ref) => {
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
Body.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

interface CardFooterProps extends VComponentProps<'div'> {}

const Footer = forwardRef<HTMLDivElement, CardFooterProps>((props, ref) => {
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
Footer.displayName = 'Card.Footer';

/* -----------------------------------------------------------------------------------------------*/

export { Root as CardRoot, Header as CardHeader, Body as CardBody, Footer as CardFooter };
export type { CardRootProps, CardHeaderProps, CardBodyProps, CardFooterProps };

export const Card = { Root, Header, Body, Footer };
