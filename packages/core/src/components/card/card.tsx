'use client';

import { forwardRef } from 'react';

import clsx from 'clsx';

import type { VaporComponentProps } from '~/libs/factory';
import { vapor } from '~/libs/factory';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

type CardRootProps = VaporComponentProps<'div'>;

const Root = forwardRef<HTMLDivElement, CardRootProps>(({ className, children, ...props }, ref) => {
    return (
        <vapor.div ref={ref} className={clsx(styles.root, className)} {...props}>
            {children}
        </vapor.div>
    );
});
Root.displayName = 'Card';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

type CardHeaderProps = VaporComponentProps<'div'>;

const Header = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <vapor.div ref={ref} className={clsx(styles.header, className)} {...props}>
                {children}
            </vapor.div>
        );
    },
);
Header.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

type CardBodyProps = VaporComponentProps<'div'>;

const Body = forwardRef<HTMLDivElement, CardBodyProps>(({ className, children, ...props }, ref) => {
    return (
        <vapor.div ref={ref} className={clsx(styles.body, className)} {...props}>
            {children}
        </vapor.div>
    );
});
Body.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

type CardFooterProps = VaporComponentProps<'div'>;

const Footer = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <vapor.div ref={ref} className={clsx(styles.footer, className)} {...props}>
                {children}
            </vapor.div>
        );
    },
);
Footer.displayName = 'Card.Footer';

/* -----------------------------------------------------------------------------------------------*/

export { Root as CardRoot, Header as CardHeader, Body as CardBody, Footer as CardFooter };
export type { CardRootProps, CardHeaderProps, CardBodyProps, CardFooterProps };

export const Card = { Root, Header, Body, Footer };
