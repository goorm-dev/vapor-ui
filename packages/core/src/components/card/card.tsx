import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import * as styles from './card.css';
import clsx from 'clsx';

import { vapor } from '~/libs/factory';

/* -------------------------------------------------------------------------------------------------
 * Card.Root
 * -----------------------------------------------------------------------------------------------*/

interface CardProps extends ComponentPropsWithoutRef<typeof vapor.div> {}

const Root = forwardRef<HTMLDivElement, CardProps>(({ className, children, ...props }, ref) => {
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

interface CardHeaderProps extends ComponentPropsWithoutRef<typeof vapor.div> {}

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

interface CardBodyProps extends ComponentPropsWithoutRef<typeof vapor.div> {}

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

interface CardFooterProps extends ComponentPropsWithoutRef<typeof vapor.div> {}

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

export const Card = Object.assign(Root, { Header, Body, Footer });
export type { CardProps, CardHeaderProps, CardBodyProps, CardFooterProps };
