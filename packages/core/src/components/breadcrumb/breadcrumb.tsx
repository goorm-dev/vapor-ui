'use client';

import { forwardRef } from 'react';

import { useRender } from '@base-ui-components/react';
import { MoreCommonOutlineIcon, SlashOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createSlot } from '~/libs/create-slot';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
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

const Root = forwardRef<HTMLElement, BreadcrumbRootProps>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);
    const [variantProps, otherProps] = createSplitProps<BreadcrumbVariants>()(componentProps, [
        'size',
    ]);

    const element = useRender({
        ref,
        render: render || <nav />,
        props: {
            'aria-label': 'Breadcrumb',
            ...otherProps,
        },
    });

    return <BreadcrumbProvider value={variantProps}>{element}</BreadcrumbProvider>;
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.List
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbListPrimitiveProps = VComponentProps<'ol'>;
interface BreadcrumbListProps extends BreadcrumbListPrimitiveProps {}

const List = forwardRef<HTMLOListElement, BreadcrumbListProps>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <ol />,
        props: {
            className: clsx(styles.list, className),
            ...componentProps,
        },
    });
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Item
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbItemProps extends VComponentProps<'li'> {}

const Item = forwardRef<HTMLLIElement, BreadcrumbItemProps>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRender({
        ref,
        render: render || <li />,
        props: {
            className: clsx(styles.item, className),
            ...componentProps,
        },
    });
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Link
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbLinkPrimitiveProps = VComponentProps<'a'>;
interface BreadcrumbLinkProps extends BreadcrumbLinkPrimitiveProps {
    current?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>((props, ref) => {
    const { render, current, className, ...componentProps } = resolveStyles(props);
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
            ...componentProps,
        },
    });
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbSeparatorProps extends VComponentProps<'li'> {}

const Separator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>((props, ref) => {
    const { render, className, children, ...componentProps } = resolveStyles(props);

    const { size } = useBreadcrumbContext();
    const IconElement = createSlot(children || <SlashOutlineIcon size="100%" />);

    return useRender({
        ref,
        render: render || <li />,
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: clsx(styles.icon({ size }), className),
            children: <IconElement />,
            ...componentProps,
        },
    });
});

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Ellipsis
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbEllipsisPrimitiveProps = VComponentProps<'span'>;
interface BreadcrumbEllipsisProps extends BreadcrumbEllipsisPrimitiveProps {}

const Ellipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>((props, ref) => {
    const { render, className, children, ...componentProps } = resolveStyles(props);

    const { size } = useBreadcrumbContext();
    const IconElement = createSlot(children || <MoreCommonOutlineIcon size="100%" />);

    return useRender({
        ref,
        render: render || <span />,
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: clsx(styles.icon({ size }), className),
            children: <IconElement />,
            ...componentProps,
        },
    });
});

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
