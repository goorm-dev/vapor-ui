'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import clsx from 'clsx';

import * as styles from './card.css';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

interface CardRootProps extends ComponentPropsWithoutRef<typeof Primitive.div> {}

const Root = forwardRef<HTMLDivElement, CardRootProps>(({ className, children, ...props }, ref) => {
    return (
        <Primitive.div ref={ref} className={clsx(styles.root, className)} {...props}>
            {children}
        </Primitive.div>
    );
});
Root.displayName = 'Card';

/* -------------------------------------------------------------------------------------------------
 * Card.Header
 * -----------------------------------------------------------------------------------------------*/

interface CardHeaderProps extends ComponentPropsWithoutRef<typeof Primitive.div> {}

const Header = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <Primitive.div ref={ref} className={clsx(styles.header, className)} {...props}>
                {children}
            </Primitive.div>
        );
    },
);
Header.displayName = 'Card.Header';

/* -------------------------------------------------------------------------------------------------
 * Card.Body
 * -----------------------------------------------------------------------------------------------*/

interface CardBodyProps extends ComponentPropsWithoutRef<typeof Primitive.div> {}

const Body = forwardRef<HTMLDivElement, CardBodyProps>(({ className, children, ...props }, ref) => {
    return (
        <Primitive.div ref={ref} className={clsx(styles.body, className)} {...props}>
            {children}
        </Primitive.div>
    );
});
Body.displayName = 'Card.Body';

/* -------------------------------------------------------------------------------------------------
 * Card.Footer
 * -----------------------------------------------------------------------------------------------*/

interface CardFooterProps extends ComponentPropsWithoutRef<typeof Primitive.div> {}

const Footer = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <Primitive.div ref={ref} className={clsx(styles.footer, className)} {...props}>
                {children}
            </Primitive.div>
        );
    },
);
Footer.displayName = 'Card.Footer';

/* -----------------------------------------------------------------------------------------------*/

export { Root as CardRoot, Header as CardHeader, Body as CardBody, Footer as CardFooter };
export type { CardRootProps, CardHeaderProps, CardBodyProps, CardFooterProps };

export const Card = { Root, Header, Body, Footer };
