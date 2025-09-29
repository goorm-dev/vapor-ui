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

/**
 * 사용자의 현재 위치를 계층적으로 표시하는 탐색 도구입니다.
 *
 * `<nav>` 요소를 렌더링합니다.
 *
 * {@see https://vapor-ui.goorm.io/docs/components/breadcrumb Breadcrumb Documentation}
 */
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

Root.displayName = 'Breadcrumb.Root';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.List
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbListPrimitiveProps = VComponentProps<'ol'>;
interface BreadcrumbListProps extends BreadcrumbListPrimitiveProps {}

/**
 * 브레드크럼 항목들을 감싸는 목록 컨테이너입니다.
 *
 * `<ol>` 요소를 렌더링합니다.
 */
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

List.displayName = 'Breadcrumb.List';
/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Item
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbItemProps extends VComponentProps<'li'> {}

/**
 * 개별 브레드크럼 항목을 나타냅니다.
 *
 * `<li>` 요소를 렌더링합니다.
 */
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

Item.displayName = 'Breadcrumb.Item';

/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Link
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbLinkPrimitiveProps = VComponentProps<'a'>;
interface BreadcrumbLinkProps extends BreadcrumbLinkPrimitiveProps {
    current?: boolean;
}

/**
 * 브레드크럼 항목의 클릭 가능한 링크 또는 현재 페이지 표시를 담당합니다.
 *
 * `<a>` 또는 `<span>` 요소를 렌더링합니다.
 */
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

Link.displayName = 'Breadcrumb.Link';
/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Separator
 * -----------------------------------------------------------------------------------------------*/

interface BreadcrumbSeparatorProps extends VComponentProps<'li'> {}

/**
 * 브레드크럼 항목들 사이의 구분자를 표시합니다.
 *
 * `<li>` 요소를 렌더링합니다.
 */
const Separator = forwardRef<HTMLLIElement, BreadcrumbSeparatorProps>(
    ({ render, className, children, ...props }, ref) => {
        const { size } = useBreadcrumbContext();
        const Icon = createSlot(children || <SlashOutlineIcon size="100%" />);

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

Separator.displayName = 'Breadcrumb.Separator';
/* -------------------------------------------------------------------------------------------------
 * Breadcrumb.Ellipsis
 * -----------------------------------------------------------------------------------------------*/

type BreadcrumbEllipsisPrimitiveProps = VComponentProps<'span'>;
interface BreadcrumbEllipsisProps extends BreadcrumbEllipsisPrimitiveProps {}

/**
 * 생략된 브레드크럼 항목들을 나타내는 줄임표를 표시합니다.
 *
 * `<span>` 요소를 렌더링합니다.
 */
const Ellipsis = forwardRef<HTMLSpanElement, BreadcrumbEllipsisProps>(
    ({ render, className, children, ...props }, ref) => {
        const { size } = useBreadcrumbContext();
        const Icon = createSlot(children || <MoreCommonOutlineIcon size="100%" />);

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

Ellipsis.displayName = 'Breadcrumb.Ellipsis';

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
