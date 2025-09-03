'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react/use-render';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

interface CardRootProps extends VComponentProps<'div'> {}

const Root = forwardRef<HTMLDivElement, CardRootProps>(({ render, className, ...props }, ref) => {
    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.root, className),
            ...props,
        },
    });
});
Root.displayName = 'Card';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

interface CardHeaderProps extends VComponentProps<'div'> {}

const Header = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.header, className),
                ...props,
            },
        });
    },
);
Header.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

interface CardBodyProps extends VComponentProps<'div'> {}

const Body = forwardRef<HTMLDivElement, CardBodyProps>(({ render, className, ...props }, ref) => {
    return useRender({
        ref,
        render: render || <div />,
        props: {
            className: clsx(styles.body, className),
            ...props,
        },
    });
});
Body.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

interface CardFooterProps extends VComponentProps<'div'> {}

const Footer = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <div />,
            props: {
                className: clsx(styles.footer, className),
                ...props,
            },
        });
    },
);
Footer.displayName = 'Card.Footer';

/* -----------------------------------------------------------------------------------------------*/

export { Root as CardRoot, Header as CardHeader, Body as CardBody, Footer as CardFooter };
export type { CardRootProps, CardHeaderProps, CardBodyProps, CardFooterProps };

export const Card = { Root, Header, Body, Footer };
