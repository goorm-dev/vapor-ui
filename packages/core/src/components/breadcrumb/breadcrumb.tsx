'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react';
import { MoreCommonOutlineIcon, SlashOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

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

type BreadcrumbPrimitiveProps = VComponentProps<'nav'>;
interface BreadcrumbRootProps extends BreadcrumbPrimitiveProps, BreadcrumbVariants {}

const Root = forwardRef<HTMLElement, BreadcrumbRootProps>(
    ({ render, className, ...props }, ref) => {
        const [variantProps, otherProps] = createSplitProps<BreadcrumbVariants>()(props, ['size']);

        const element = useRender({
            ref,
            render: render || <nav />,
            props: {
                'aria-label': 'Breadcrumb',
                ...otherProps,
            },
        });

        return <BreadcrumbProvider value={variantProps}>{element}</BreadcrumbProvider>;
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.List
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbListPrimitiveProps = VComponentProps<'ol'>;
interface BreadcrumbListProps extends BreadcrumbListPrimitiveProps {}

const List = forwardRef<HTMLOListElement, BreadcrumbListProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <ol />,
            props: {
                className: clsx(styles.list, className),
                ...props,
            },
        });
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Item
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbItemProps extends VComponentProps<'li'> {}

const Item = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
    ({ render, className, ...props }, ref) => {
        return useRender({
            ref,
            render: render || <li />,
            props: {
                className: clsx(styles.item, className),
                ...props,
            },
        });
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Link
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbLinkPrimitiveProps = VComponentProps<'a'>;
interface BreadcrumbLinkProps extends BreadcrumbLinkPrimitiveProps {
    current?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
    ({ render, current, className, ...props }, ref) => {
        const Component = current ? 'span' : 'a';

        const { size } = useBreadcrumbContext();

        return useRender({
            ref,
            render: render || <Component />,
            props: {
                role: current ? 'link' : undefined,
                'aria-disabled': current ? 'true' : undefined,
                'aria-current': current ? 'page' : undefined,
                className: clsx(styles.link({ size, current }), className),
                ...props,
            },
        });
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbSeparatorProps extends VComponentProps<'li'> {}

const Separator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
    ({ render, className, children, ...props }, ref) => {
        const { size } = useBreadcrumbContext();
        const Icon = createSlot(children || <SlashOutlineIcon size="auto" />);

        return useRender({
            ref,
            render: render || <li />,
            props: {
                role: 'presentation',
                'aria-hidden': 'true',
                className: clsx(styles.icon({ size }), className),
                children: <Icon />,
                ...props,
            },
        });
    },
);

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Ellipsis
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbEllipsisPrimitiveProps = VComponentProps<'span'>;
interface BreadcrumbEllipsisProps extends BreadcrumbEllipsisPrimitiveProps {}

const Ellipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
    ({ render, className, children, ...props }, ref) => {
        const { size } = useBreadcrumbContext();
        const Icon = createSlot(children || <MoreCommonOutlineIcon size="auto" />);

        return useRender({
            ref,
            render: render || <span />,
            props: {
                role: 'presentation',
                'aria-hidden': 'true',
                className: clsx(styles.icon({ size }), className),
                children: <Icon />,
                ...props,
            },
        });
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
