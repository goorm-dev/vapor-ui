'use client';

import type { ComponentProps } from 'react';
import { useContext, useRef } from 'react';
import type * as React from 'react';

import { ArrowUpOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';
import * as Base from 'fumadocs-ui/components/sidebar/base';
import { createLinkItemRenderer } from 'fumadocs-ui/components/sidebar/link-item';
import { createPageTreeRenderer } from 'fumadocs-ui/components/sidebar/page-tree';

import { LayoutContext } from './docs-layout-client';

export function mergeRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
    return (value) => {
        refs.forEach((ref) => {
            if (typeof ref === 'function') {
                ref(value);
            } else if (ref) {
                ref.current = value;
            }
        });
    };
}

function getItemOffset(depth: number) {
    return `calc(${2 + 3 * depth} * var(--spacing))`;
}

function shouldShowExternalIndicator(href: unknown, external?: boolean) {
    if (external) return true;
    if (typeof href !== 'string') return false;

    return href.startsWith('/theme');
}

export const {
    SidebarCollapseTrigger,
    SidebarFolder,
    SidebarProvider: Sidebar,
    SidebarTrigger,
    SidebarViewport,
} = Base;

export function SidebarContent({
    children,
    className,
    ref: refProp,
    ...props
}: ComponentProps<'aside'>) {
    const context = useContext(LayoutContext);
    const navMode = context?.navMode ?? 'auto';

    const ref = useRef<HTMLElement>(null);

    return (
        <Base.SidebarContent>
            {({ collapsed, hovered, ref: asideRef, ...rest }) => (
                <div
                    data-sidebar-placeholder=""
                    className={clsx(
                        'md:layout:[--fd-sidebar-width:240px] pointer-events-none sticky z-20 [grid-area:sidebar] *:pointer-events-auto max-md:hidden',
                        navMode === 'auto'
                            ? 'top-(--fd-docs-row-1) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-1))]'
                            : 'top-(--fd-docs-row-2) h-[calc(var(--fd-docs-height)-var(--fd-docs-row-2))]',
                    )}
                >
                    {!!collapsed && <div className="absolute inset-y-0 start-0 w-4" {...rest} />}
                    <aside
                        ref={mergeRefs(ref, refProp, asideRef)}
                        data-collapsed={collapsed}
                        data-hovered={!!collapsed && hovered}
                        id="nd-sidebar"
                        className={clsx(
                            'absolute inset-y-0 start-0 flex w-full flex-col items-end text-sm duration-250 *:w-(--fd-sidebar-width)',
                            navMode === 'auto' && 'bg-fd-card border-e',
                            collapsed && [
                                'bg-fd-card inset-y-2 w-(--fd-sidebar-width) rounded-xl border transition-transform',
                                hovered
                                    ? 'translate-x-2 shadow-lg rtl:-translate-x-2'
                                    : '-translate-x-(--fd-sidebar-width) rtl:translate-x-full',
                            ],
                            ref.current &&
                                (ref.current.getAttribute('data-collapsed') === 'true') !==
                                    collapsed &&
                                'transition-[width,inset-block,translate,background-color]',
                            className,
                        )}
                        {...props}
                        {...rest}
                    >
                        {children}
                    </aside>
                </div>
            )}
        </Base.SidebarContent>
    );
}

export function SidebarDrawer({
    children,
    className,
    ...props
}: ComponentProps<typeof Base.SidebarDrawerContent>) {
    return (
        <>
            <Base.SidebarDrawerOverlay className="data-[state=open]:animate-fd-fade-in data-[state=closed]:animate-fd-fade-out fixed inset-0 z-40 backdrop-blur-xs" />
            <Base.SidebarDrawerContent
                className={clsx(
                    'bg-fd-background data-[state=open]:animate-fd-sidebar-in data-[state=closed]:animate-fd-sidebar-out fixed inset-y-0 end-0 z-40 flex w-[85%] max-w-[380px] flex-col text-[0.9375rem] shadow-lg',
                    className,
                )}
                {...props}
            >
                {children}
            </Base.SidebarDrawerContent>
        </>
    );
}

export function SidebarSeparator({ children, className, style, ...props }: ComponentProps<'p'>) {
    const depth = Base.useFolderDepth();

    return (
        <Base.SidebarSeparator
            className={clsx('font-semibold [&_svg]:size-4 [&_svg]:shrink-0', className)}
            style={{
                paddingInlineStart: getItemOffset(depth),
                ...style,
            }}
            {...props}
        >
            {children}
        </Base.SidebarSeparator>
    );
}

// const LinkOutlineIcon = (props: ComponentProps<'svg'>) => {
//     return (
//         <svg
//             width="15"
//             height="15"
//             viewBox="0 0 15 15"
//             fill="none"
//             xmlns="http://www.w3.org/2000/svg"
//             {...props}
//         >
//             <path
//                 d="M3.64645 11.3536C3.45118 11.1583 3.45118 10.8417 3.64645 10.6465L10.2929 4L6 4C5.72386 4 5.5 3.77614 5.5 3.5C5.5 3.22386 5.72386 3 6 3L11.5 3C11.6326 3 11.7598 3.05268 11.8536 3.14645C11.9473 3.24022 12 3.36739 12 3.5L12 9.00001C12 9.27615 11.7761 9.50001 11.5 9.50001C11.2239 9.50001 11 9.27615 11 9.00001V4.70711L4.35355 11.3536C4.15829 11.5488 3.84171 11.5488 3.64645 11.3536Z"
//                 fill="currentColor"
//                 fill-rule="evenodd"
//                 clip-rule="evenodd"
//             ></path>
//         </svg>
//     );
// };

export function SidebarItem({
    children,
    className,
    style,
    ...props
}: ComponentProps<typeof Base.SidebarItem>) {
    const depth = Base.useFolderDepth();
    const isExternalLink = shouldShowExternalIndicator(props.href, props.external);

    return (
        <Base.SidebarItem
            className={clsx(
                'text-fd-muted-foreground relative flex flex-row items-center gap-2 rounded-lg p-2 text-start [&_svg]:size-4 [&_svg]:shrink-0',
                'hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary transition-colors hover:transition-none data-[active=true]:hover:transition-colors',
                depth >= 1 &&
                    "data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5 data-[active=true]:before:w-px data-[active=true]:before:content-['']",
                className,
            )}
            style={{
                paddingInlineStart: getItemOffset(depth),
                ...style,
            }}
            {...props}
        >
            {children}
            {isExternalLink && (
                <ArrowUpOutlineIcon aria-hidden="true" className="size-3.5 scale-110 rotate-45" />
            )}
        </Base.SidebarItem>
    );
}

export function SidebarFolderTrigger({
    className,
    style,
    ...props
}: ComponentProps<typeof Base.SidebarFolderTrigger>) {
    const { collapsible, depth } = Base.useFolder()!;

    return (
        <Base.SidebarFolderTrigger
            className={clsx(
                'w-full text-fd-muted-foreground relative flex flex-row items-center gap-2 rounded-lg p-2 text-start [&_svg]:size-4 [&_svg]:shrink-0',
                collapsible
                    ? 'hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 transition-colors hover:transition-none'
                    : '',
                className,
            )}
            style={{
                paddingInlineStart: getItemOffset(depth - 1),
                ...style,
            }}
            {...props}
        >
            {props.children}
        </Base.SidebarFolderTrigger>
    );
}

export function SidebarFolderLink({
    className,
    style,
    ...props
}: ComponentProps<typeof Base.SidebarFolderLink>) {
    const depth = Base.useFolderDepth();

    return (
        <Base.SidebarFolderLink
            className={clsx(
                'w-full text-fd-muted-foreground relative flex flex-row items-center gap rounded-lg p-2 text-start [&_svg]:size-4 [&_svg]:shrink-0',
                'hover:bg-fd-accent/50 hover:text-fd-accent-foreground/80 data-[active=true]:bg-fd-primary/10 data-[active=true]:text-fd-primary transition-colors hover:transition-none data-[active=true]:hover:transition-colors',
                depth > 1
                    ? 'data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5 data-[active=true]:before:w-px data-[active=true]:before:content-[""]'
                    : '',
                className,
            )}
            style={{
                paddingInlineStart: getItemOffset(depth - 1),
                ...style,
            }}
            {...props}
        >
            {props.children}
        </Base.SidebarFolderLink>
    );
}

export function SidebarFolderContent({
    children,
    className,
    ...props
}: ComponentProps<typeof Base.SidebarFolderContent>) {
    const depth = Base.useFolderDepth();

    return (
        <Base.SidebarFolderContent
            className={clsx(
                'text-fd-muted-foreground relative data-[state=open]:animate-fd-accordion-down data-[state=closed]:animate-fd-accordion-up flex flex-col overflow-hidden data-[state=closed]:animate-fd-collapsible-up data-[state=open]:animate-fd-collapsible-down before:content before:absolute before:w-px before:inset-y-1 before:bg-fd-border before:start-2.5',
                depth === 1
                    ? "data-[active=true]:before:bg-fd-primary data-[active=true]:before:absolute data-[active=true]:before:inset-y-2.5 data-[active=true]:before:start-2.5 data-[active=true]:before:w-px data-[active=true]:before:content-['']"
                    : '',
                className,
            )}
            {...props}
        >
            {children}
        </Base.SidebarFolderContent>
    );
}
export const SidebarPageTree = createPageTreeRenderer({
    SidebarFolder,
    SidebarFolderContent,
    SidebarFolderLink,
    SidebarFolderTrigger,
    SidebarItem,
    SidebarSeparator,
});

export const SidebarLinkItem = createLinkItemRenderer({
    SidebarFolder,
    SidebarFolderContent,
    SidebarFolderLink,
    SidebarFolderTrigger,
    SidebarItem,
});
