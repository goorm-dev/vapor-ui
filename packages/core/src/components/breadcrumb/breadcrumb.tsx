import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import { Primitive } from '@radix-ui/react-primitive';
import { MoreCommonOutlineIcon, SlashOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';

import * as styles from './breadcrumb.css';
import type { BreadcrumbItemVariants } from './breadcrumb.css';

type BreadcrumbVariants = Omit<BreadcrumbItemVariants, 'current'>;

const [BreadcrumbProvider, useBreadcrumbContext] = createContext<BreadcrumbVariants>({
    name: 'Breadcrumb',
    hookName: 'useBreadcrumbContext',
    providerName: 'BreadcrumbProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Root
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbPrimitiveProps = ComponentPropsWithoutRef<typeof Primitive.nav>;
interface BreadcrumbRootProps extends BreadcrumbPrimitiveProps, BreadcrumbVariants {}

const Root = forwardRef<HTMLElement, BreadcrumbRootProps>(
    ({ className, children, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<BreadcrumbVariants>()(props, ['size']);

        return (
            <BreadcrumbProvider value={variantProps}>
                <Primitive.nav ref={ref} aria-label="Breadcrumb" {...otherProps}>
                    {children}
                </Primitive.nav>
            </BreadcrumbProvider>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.List
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbListPrimitiveProps = ComponentPropsWithoutRef<typeof Primitive.ol>;
interface BreadcrumbListProps extends BreadcrumbListPrimitiveProps {}

const List = forwardRef<HTMLOListElement, BreadcrumbListProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <Primitive.ol ref={ref} className={clsx(styles.list, className)} {...props}>
                {children}
            </Primitive.ol>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Item
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbItemProps extends ComponentPropsWithoutRef<typeof Primitive.li> {}

const Item = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <Primitive.li ref={ref} className={clsx(styles.item, className)} {...props}>
                {children}
            </Primitive.li>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Link
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbLinkPrimitiveProps = ComponentPropsWithoutRef<typeof Primitive.a>;
interface BreadcrumbLinkProps extends BreadcrumbLinkPrimitiveProps {
    current?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
    ({ current, className, children, ...props }, ref) => {
        const { a, span } = Primitive;
        const Component = current ? span : a;

        const { size } = useBreadcrumbContext();

        return (
            <Component
                ref={ref}
                role={current ? 'link' : undefined}
                aria-disabled={current ? 'true' : undefined}
                aria-current={current ? 'page' : undefined}
                className={clsx(styles.link({ size, current }), className)}
                {...props}
            >
                {children}
            </Component>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbSeparatorProps extends ComponentPropsWithoutRef<typeof Primitive.li> {}

const Separator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
    ({ className, children, ...props }, ref) => {
        const { size } = useBreadcrumbContext();
        const Icon = createSlot(children || <SlashOutlineIcon size="auto" />);

        return (
            <Primitive.li
                ref={ref}
                role="presentation"
                aria-hidden="true"
                className={clsx(styles.icon({ size }), className)}
                {...props}
            >
                <Icon />
            </Primitive.li>
        );
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Ellipsis
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbEllipsisPrimitiveProps = ComponentPropsWithoutRef<typeof Primitive.span>;
interface BreadcrumbEllipsisProps extends BreadcrumbEllipsisPrimitiveProps {}

const Ellipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
    ({ className, children, ...props }, ref) => {
        const { size } = useBreadcrumbContext();
        const Icon = createSlot(children || <MoreCommonOutlineIcon size="auto" />);

        return (
            <Primitive.span
                ref={ref}
                role="presentation"
                aria-hidden="true"
                className={clsx(styles.icon({ size }), className)}
                {...props}
            >
                <Icon />
            </Primitive.span>
        );
    },
);

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as BreadcrumbRoot,
    List as BreadcrumbList,
    Item as BreadcrumbItem,
    Link as BreadcrumbLink,
    Separator as BreadcrumbSeparator,
    Ellipsis as BreadcrumbEllipsis,
};

export type {
    BreadcrumbRootProps,
    BreadcrumbListProps,
    BreadcrumbItemProps,
    BreadcrumbLinkProps,
    BreadcrumbSeparatorProps,
    BreadcrumbEllipsisProps,
};

export const Breadcrumb = {
    Root,
    List,
    Item,
    Link,
    Separator,
    Ellipsis,
};
