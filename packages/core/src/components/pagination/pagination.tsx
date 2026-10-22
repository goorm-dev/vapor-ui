'use client';

import type { ComponentPropsWithoutRef, Fragment, MouseEvent } from 'react';
import { forwardRef, useMemo } from 'react';

import { useControlled } from '@base-ui/utils/useControlled';
import { useStableCallback } from '@base-ui/utils/useStableCallback';
import {
    ChevronLeftOutlineIcon,
    ChevronRightOutlineIcon,
    MoreCommonOutlineIcon,
} from '@vapor-ui/icons';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import type { MakeChangeEventDetails } from '~/utils/create-event-details';
import { createChangeEventDetails } from '~/utils/create-event-details';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './pagination.css';
import type { ButtonVariants } from './pagination.css';

type PaginationVariants = ButtonVariants;

const [PaginationProvider, usePaginationContext] = createContext<PaginationContext>({
    name: 'Pagination',
    hookName: 'usePaginationContext',
    providerName: 'PaginationProvider',
});

/* -------------------------------------------------------------------------------------------------
 * Pagination.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Pagination.RootPrimitive` and `Pagination.ListPrimitive` into a single part, the root of a pagination control that lets users move between pages of content. Renders a `<nav>` element.
 */
export const PaginationRoot = forwardRef<HTMLElement, PaginationRoot.Props>((props, ref) => {
    const { children, ...componentProps } = props;

    return (
        <PaginationRootPrimitive ref={ref} {...componentProps}>
            <PaginationListPrimitive>{children}</PaginationListPrimitive>
        </PaginationRootPrimitive>
    );
});
PaginationRoot.displayName = 'Pagination.Root';

/* -------------------------------------------------------------------------------------------------
 * Pagination.RootPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Navigation landmark labeled "Pagination" that manages the selected page and shares `size` and `disabled` with the parts inside it. Renders a `<nav>` element.
 */
export const PaginationRootPrimitive = forwardRef<HTMLElement, PaginationRootPrimitive.Props>(
    (props, ref) => {
        const {
            render,
            page: pageProp,
            defaultPage = 1,
            onPageChange: onPageChangeProp,

            totalPages,
            siblingCount = 2,
            boundaryCount = 1,
            disabled = false,
            ...componentProps
        } = props;

        const [variantProps, otherProps] = createSplitProps<PaginationVariants>()(componentProps, [
            'size',
        ]);

        const [page, setPageUnwrapped] = useControlled({
            controlled: pageProp,
            default: defaultPage,
            name: 'Pagination',
            state: 'page',
        });

        const onPageChange = useStableCallback(onPageChangeProp);

        const setPage = useStableCallback(
            (newPage: number, eventDetails: PaginationRootPrimitive.ChangeEventDetails) => {
                onPageChange?.(newPage, eventDetails);

                if (eventDetails.isCanceled) {
                    return;
                }

                setPageUnwrapped(newPage);
            },
        );

        const state: PaginationRootPrimitive.State = useMemo(() => ({ disabled }), [disabled]);

        const element = useRenderElement({
            ref,
            render,
            defaultTagName: 'nav',
            state,
            props: {
                'aria-label': 'Pagination',
                ...otherProps,
            },
        });

        const context: PaginationContext = useMemo(
            () => ({
                ...variantProps,
                totalPages,
                siblingCount,
                boundaryCount,
                page,
                setPage,
                disabled,
            }),
            [totalPages, page, setPage, siblingCount, boundaryCount, disabled, variantProps],
        );

        return <PaginationProvider value={context}>{element}</PaginationProvider>;
    },
);
PaginationRootPrimitive.displayName = 'Pagination.RootPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.ListPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Ordered list that lays out the pagination items in a row. Renders an `<ol>` element.
 */
export const PaginationListPrimitive = forwardRef<HTMLOListElement, PaginationListPrimitive.Props>(
    ({ render, className, ...props }, ref) => {
        return useRenderElement({
            ref,
            render,
            defaultTagName: 'ol',
            props: {
                className: cn(styles.list, className),
                ...props,
            },
        });
    },
);
PaginationListPrimitive.displayName = 'Pagination.ListPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.ItemPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * List item that holds one pagination control, such as a page button or an ellipsis. Renders an `<li>` element.
 */
export const PaginationItemPrimitive = forwardRef<HTMLLIElement, PaginationItemPrimitive.Props>(
    ({ render, className, ...props }, ref) => {
        return useRenderElement({
            ref,
            render,
            defaultTagName: 'li',
            props: {
                className: cn(styles.item, className),
                ...props,
            },
        });
    },
);
PaginationItemPrimitive.displayName = 'Pagination.ItemPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.ButtonPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that selects the page set in `page` when clicked, highlighted while that page is selected. Renders a `<button>` element.
 */
export const PaginationButtonPrimitive = forwardRef<
    HTMLButtonElement,
    PaginationButtonPrimitive.Props
>(({ page, render, disabled: disabledProp, className, ...props }, ref) => {
    const { page: contextPage, setPage, size, disabled: contextDisabled } = usePaginationContext();

    const handleClick = useStableCallback((event: MouseEvent) => {
        const details = createChangeEventDetails('item-press', event.nativeEvent);

        setPage(page, details);
    });

    const disabled = disabledProp || contextDisabled;
    const current = page === contextPage;

    const state: PaginationButtonPrimitive.State = useMemo(
        () => ({ disabled, current }),
        [disabled, current],
    );

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'button',
        state,
        props: {
            'aria-label': `Page ${page}`,
            'aria-current': current ? 'page' : undefined,
            disabled,
            onClick: handleClick,
            className: cn(styles.button({ size }), className),
            ...props,
        },
    });
});
PaginationButtonPrimitive.displayName = 'Pagination.ButtonPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.PreviousPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that moves to the previous page when clicked, disabled on the first page. Renders a `<button>` element.
 */
export const PaginationPreviousPrimitive = forwardRef<
    HTMLButtonElement,
    PaginationPreviousPrimitive.Props
>((props, ref) => {
    const {
        render,
        disabled: disabledProp,
        className,
        children: childrenProp,
        ...componentProps
    } = resolveStyles(props);

    const { page, setPage, size, disabled: contextDisabled } = usePaginationContext();

    const disabled = disabledProp || contextDisabled || page <= 1;

    const onClick = useStableCallback((event: MouseEvent) => {
        if (disabled) return;

        const details = createChangeEventDetails('item-press', event.nativeEvent);
        setPage(page - 1, details);
    });

    const childrenRender = createRender(childrenProp, <ChevronLeftOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: { 'aria-hidden': 'true', className: styles.icon },
    });

    const state: PaginationPreviousPrimitive.State = useMemo(() => ({ disabled }), [disabled]);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'button',
        state,
        props: {
            'aria-label': 'Previous Page',
            disabled,
            className: cn(styles.button({ size }), className),
            onClick,
            children,
            ...componentProps,
        },
    });
});
PaginationPreviousPrimitive.displayName = 'Pagination.PreviousPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Previous
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Pagination.ItemPrimitive` and `Pagination.PreviousPrimitive` into a single part. Renders a `<button>` element inside an `<li>` element.
 */
export const PaginationPrevious = forwardRef<HTMLButtonElement, PaginationPrevious.Props>(
    (props, ref) => {
        return (
            <PaginationItemPrimitive>
                <PaginationPreviousPrimitive ref={ref} {...props} />
            </PaginationItemPrimitive>
        );
    },
);
PaginationPrevious.displayName = 'Pagination.Previous';

/* -------------------------------------------------------------------------------------------------
 * Pagination.NextPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that moves to the next page when clicked, disabled on the last page. Renders a `<button>` element.
 */
export const PaginationNextPrimitive = forwardRef<HTMLButtonElement, PaginationNextPrimitive.Props>(
    (props, ref) => {
        const {
            render,
            disabled: disabledProp,
            className,
            children: childrenProp,
            ...componentProps
        } = resolveStyles(props);

        const {
            totalPages,
            page,
            setPage,
            size,
            disabled: contextDisabled,
        } = usePaginationContext();

        const disabled = disabledProp || contextDisabled || page >= totalPages;

        const onClick = useStableCallback((event: MouseEvent) => {
            if (disabled) return;

            const details = createChangeEventDetails('item-press', event.nativeEvent);
            setPage(page + 1, details);
        });

        const childrenRender = createRender(childrenProp, <ChevronRightOutlineIcon />);
        const children = useRenderElement({
            render: childrenRender,
            props: { 'aria-hidden': 'true', className: styles.icon },
        });

        const state: PaginationNextPrimitive.State = useMemo(() => ({ disabled }), [disabled]);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'button',
            state,
            props: {
                'aria-label': 'Next Page',
                disabled,
                className: cn(styles.button({ size }), className),
                onClick,
                children,
                ...componentProps,
            },
        });
    },
);
PaginationNextPrimitive.displayName = 'Pagination.NextPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Next
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `Pagination.ItemPrimitive` and `Pagination.NextPrimitive` into a single part. Renders a `<button>` element inside an `<li>` element.
 */
export const PaginationNext = forwardRef<HTMLButtonElement, PaginationNext.Props>((props, ref) => {
    return (
        <PaginationItemPrimitive>
            <PaginationNextPrimitive ref={ref} {...props} />
        </PaginationItemPrimitive>
    );
});
PaginationNext.displayName = 'Pagination.Next';

/* -------------------------------------------------------------------------------------------------
 * Pagination.EllipsisPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Icon that stands in for skipped pages, hidden from assistive technologies. Renders a `<span>` element.
 */
export const PaginationEllipsisPrimitive = forwardRef<
    HTMLSpanElement,
    PaginationEllipsisPrimitive.Props
>((props, ref) => {
    const { render, className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const { size, disabled } = usePaginationContext();

    const childrenRender = createRender(childrenProp, <MoreCommonOutlineIcon />);
    const children = useRenderElement({
        render: childrenRender,
        props: { width: 'max(16px, 50%)', height: 'max(16px, 50%)' },
    });

    const state: PaginationEllipsisPrimitive.State = useMemo(() => ({ disabled }), [disabled]);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        state,
        props: {
            role: 'presentation',
            'aria-hidden': 'true',
            className: cn(styles.ellipsis({ size }), className),
            children,
            ...componentProps,
        },
    });
});
PaginationEllipsisPrimitive.displayName = 'Pagination.EllipsisPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Pagination.Items
 * -----------------------------------------------------------------------------------------------*/

/**
 * Generates a page button for each visible page and an ellipsis for each skipped range, based on `totalPages`, `siblingCount`, and `boundaryCount` of the root. Place it between `Pagination.Previous` and `Pagination.Next`. Doesn't render its own HTML element.
 */
export const PaginationItems = ({ children: childrenProp }: PaginationItems.Props) => {
    const { page, totalPages, siblingCount, boundaryCount } = usePaginationContext();

    const pages = createPaginationRange({ totalPages, page, siblingCount, boundaryCount });

    return typeof childrenProp === 'function'
        ? childrenProp(pages)
        : (childrenProp ??
              pages.map(({ type, value }) => {
                  if (type === 'BREAK') {
                      return (
                          <PaginationItemPrimitive key={`${type}-${value}`}>
                              <PaginationEllipsisPrimitive />
                          </PaginationItemPrimitive>
                      );
                  }

                  return (
                      <PaginationItemPrimitive key={`${type}-${value}`}>
                          <PaginationButtonPrimitive page={value}>
                              {value}
                          </PaginationButtonPrimitive>
                      </PaginationItemPrimitive>
                  );
              }));
};
PaginationItems.displayName = 'Pagination.Items';

/* -----------------------------------------------------------------------------------------------*/

export type PageType = { type: string; value: number };

type PaginationRange = {
    page: number;
    totalPages: number;
    siblingCount: number;
    boundaryCount: number;
};

export function createPaginationRange({
    page: currentPage,
    totalPages,
    boundaryCount,
    siblingCount,
}: PaginationRange) {
    const pages: PageType[] = [];

    // number of pages shown on each side of the current page
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // standardGap: 3
    const standardGap = siblingCount + boundaryCount;

    // the maximum number of pages that can be shown at a given time (account for current page, left and right ellipsis)
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // maxVisiblePages: 9
    const maxVisiblePages = standardGap + standardGap + 3;

    // if the number of pages is less than the maximum number of pages that can be shown just return all of them
    if (totalPages <= maxVisiblePages) {
        addPages(1, totalPages);
        return pages;
    }

    // startGap is the number of pages hidden by the start ellipsis
    // startOffset is the number of pages to offset at the start to compensate
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // startGap: 5
    // startOffset: 0
    // when the margin and the surrounding windows overlap.
    // [1, _2_, 3, 4, 5, 6, ..., 15]
    // startGap = 0
    // startOffset: -3 <--
    let startGap = 0;
    let startOffset = 0;

    // When there is overlap
    if (currentPage - standardGap - 1 <= 1) {
        startOffset = currentPage - standardGap - 2;
    } else {
        startGap = currentPage - standardGap - 1;
    }

    // These are equivalent to startGap and startOffset but at the end of the list
    let endGap = 0;
    let endOffset = 0;

    // When there is overlap
    if (totalPages - currentPage - standardGap <= 1) {
        endOffset = totalPages - currentPage - standardGap - 1;
    } else {
        endGap = totalPages - currentPage - standardGap;
    }

    const hasStartEllipsis = startGap > 0;
    const hasEndEllipsis = endGap > 0;

    // add pages "before" the start ellipsis (if any)
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // boundaryCount: 1
    // addPages(1, 1, true)
    addPages(1, boundaryCount);

    if (hasStartEllipsis) {
        addEllipsis(boundaryCount);
    }

    // add middle pages
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // boundaryCount: 1
    // siblingCount: 2
    // startGap: 5
    // startOffset: 0
    // endGap: 3
    // endOffset: 0
    // addPages(7, 11, true)
    addPages(
        boundaryCount + startGap + endOffset + 1,
        totalPages - startOffset - endGap - boundaryCount,
    );

    if (hasEndEllipsis) {
        addEllipsis(totalPages - startOffset - endGap - boundaryCount);
    }

    // add pages "after" the start ellipsis (if any)
    // [1, ..., 7, 8, _9_, 10, 11, ..., 15]
    // boundaryCount: 1
    // siblingCount: 2
    // startGap: 5
    // startOffset: 0
    // endGap: 3
    // endOffset: 0
    // addPages(15, 15)
    addPages(totalPages - boundaryCount + 1, totalPages);

    return pages;

    function addEllipsis(previousPage: number) {
        pages.push({
            type: 'BREAK',
            value: previousPage + 1,
        });
    }

    function addPages(start: number, end: number) {
        for (let i = start; i <= end; i++) {
            pages.push({
                type: 'NUM',
                value: i,
            });
        }
    }
}

/* -----------------------------------------------------------------------------------------------*/

export interface PaginationContext extends PaginationVariants {
    totalPages: number;
    page: number;
    setPage: (page: number, eventDetails: PaginationRootPrimitive.ChangeEventDetails) => void;
    siblingCount: number;
    boundaryCount: number;
    disabled: boolean;
}

export interface PaginationRootPrimitiveProps
    extends PaginationVariants, VaporUIComponentProps<'nav', PaginationRootPrimitive.State> {
    /**
     * Total number of pages. `Pagination.Next` is disabled once this page is selected.
     */
    totalPages: number;
    /**
     * Selected page, counted from `1`. Use when the component is controlled.
     */
    page?: number;
    /**
     * Page selected on first render, counted from `1`. Use when the component is not controlled.
     * @default 1
     */
    defaultPage?: number;
    /**
     * Called when a page button, `Pagination.Previous`, or `Pagination.Next` is clicked, with the new page and the event details. Call `eventDetails.cancel()` to keep the current page.
     */
    onPageChange?: (page: number, eventDetails: PaginationRootPrimitive.ChangeEventDetails) => void;

    /**
     * Number of pages shown on each side of the selected page before the rest collapse into an ellipsis.
     * @default 2
     */
    siblingCount?: number;
    /**
     * Number of pages always shown at the start and the end of the range.
     * @default 1
     */
    boundaryCount?: number;
    /**
     * Disables the pagination, blocking all interactions on its buttons.
     * @default false
     */
    disabled?: boolean;
}

export interface PaginationRootPrimitiveState {
    [key: string]: unknown;
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
}

export namespace PaginationRootPrimitive {
    export type State = PaginationRootPrimitiveState;
    export type Props = PaginationRootPrimitiveProps;

    export type ChangeEventReason = 'item-press';
    export type ChangeEventDetails = MakeChangeEventDetails<PaginationRoot.ChangeEventReason>;
}

export namespace PaginationRoot {
    export type State = PaginationRootPrimitive.State;
    export type Props = PaginationRootPrimitive.Props;

    export type ChangeEventReason = PaginationRootPrimitive.ChangeEventReason;
    export type ChangeEventDetails = PaginationRootPrimitive.ChangeEventDetails;
}

export namespace PaginationListPrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'ol', State>;
}

export namespace PaginationItemPrimitive {
    export type State = {};
    export type Props = VaporUIComponentProps<'li', State>;
}

export interface PaginationButtonPrimitiveState {
    [key: string]: unknown;
    /**
     * Whether the button is the currently active page.
     */
    current: boolean;
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
}

export interface PaginationButtonPrimitiveProps extends VaporUIComponentProps<
    'button',
    PaginationButtonPrimitive.State
> {
    /**
     * Page this button selects when clicked. The button is marked as current while this page is selected.
     */
    page: number;
}

export namespace PaginationButtonPrimitive {
    export type State = PaginationButtonPrimitiveState;
    export type Props = PaginationButtonPrimitiveProps;
}

export namespace PaginationButton {
    export type State = PaginationButtonPrimitive.State;
    export type Props = PaginationButtonPrimitive.Props;
}

export interface PaginationPreviousPrimitiveState {
    [key: string]: unknown;
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
}

export namespace PaginationPreviousPrimitive {
    export type State = PaginationPreviousPrimitiveState;
    export interface Props extends VaporUIComponentProps<'button', State> {
        /**
         * Icon shown inside the button. Replaces the default left chevron icon.
         */
        children?: VaporUIComponentProps<'button', State>['children'];
    }
}

export namespace PaginationPrevious {
    export type State = PaginationPreviousPrimitive.State;
    export type Props = PaginationPreviousPrimitive.Props;
}

export interface PaginationNextPrimitiveState {
    [key: string]: unknown;
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
}

export namespace PaginationNextPrimitive {
    export type State = PaginationNextPrimitiveState;
    export interface Props extends VaporUIComponentProps<'button', State> {
        /**
         * Icon shown inside the button. Replaces the default right chevron icon.
         */
        children?: VaporUIComponentProps<'button', State>['children'];
    }
}

export namespace PaginationNext {
    export type State = PaginationNextPrimitive.State;
    export type Props = PaginationNextPrimitive.Props;
}

export interface PaginationItemsPrimitiveProps extends Omit<
    ComponentPropsWithoutRef<typeof Fragment>,
    'children'
> {
    /**
     * Content shown in place of the generated page buttons. As a function, receives the pages to show, each with a `type` (`NUM` for a page, `BREAK` for an ellipsis) and a page number in `value`.
     */
    children?: React.ReactNode | ((pages: PageType[]) => React.ReactNode);
}

export namespace PaginationItems {
    export type State = {};
    export type Props = PaginationItemsPrimitiveProps;
}

export interface PaginationEllipsisPrimitiveState {
    [key: string]: unknown;
    /**
     * Whether the component should ignore user interaction.
     */
    disabled: boolean;
}

export namespace PaginationEllipsisPrimitive {
    export type State = PaginationEllipsisPrimitiveState;
    export interface Props extends VaporUIComponentProps<'span', State> {
        /**
         * Icon shown for the skipped pages. Replaces the default more icon.
         */
        children?: VaporUIComponentProps<'span', State>['children'];
    }
}

export namespace PaginationEllipsis {
    export type State = PaginationEllipsisPrimitive.State;
    export type Props = PaginationEllipsisPrimitive.Props;
}
