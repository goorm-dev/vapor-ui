'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import clsx from 'clsx';

import { vapor } from '~/libs/factory';
import { type Sprinkles, sprinkles } from '~/styles/sprinkles.css';
import { splitLayoutProps } from '~/utils/split-layout-props';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

interface CardRootProps extends ComponentPropsWithoutRef<typeof vapor.div>, Sprinkles {}

const Root = forwardRef<HTMLDivElement, CardRootProps>(({ className, children, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <vapor.div
            ref={ref}
            className={clsx(styles.root, sprinkles(layoutProps), className)}
            {...otherProps}
        >
            {children}
        </vapor.div>
    );
});
Root.displayName = 'Card';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

interface CardHeaderProps extends ComponentPropsWithoutRef<typeof vapor.div>, Sprinkles {}

const Header = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => {
        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <vapor.div
                ref={ref}
                className={clsx(styles.header, className, sprinkles(layoutProps))}
                {...otherProps}
            >
                {children}
            </vapor.div>
        );
    },
);
Header.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

interface CardBodyProps extends ComponentPropsWithoutRef<typeof vapor.div>, Sprinkles {}

const Body = forwardRef<HTMLDivElement, CardBodyProps>(({ className, children, ...props }, ref) => {
    const [layoutProps, otherProps] = splitLayoutProps(props);

    return (
        <vapor.div
            ref={ref}
            className={clsx(styles.body, className, sprinkles(layoutProps))}
            {...otherProps}
        >
            {children}
        </vapor.div>
    );
});
Body.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

interface CardFooterProps extends ComponentPropsWithoutRef<typeof vapor.div>, Sprinkles {}

const Footer = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, children, ...props }, ref) => {
        const [layoutProps, otherProps] = splitLayoutProps(props);

        return (
            <vapor.div
                ref={ref}
                className={clsx(styles.footer, className, sprinkles(layoutProps))}
                {...otherProps}
            >
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
