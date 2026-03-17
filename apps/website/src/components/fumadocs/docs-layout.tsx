import { type ComponentProps, type FC, type ReactNode, useMemo } from 'react';

import { IconButton } from '@vapor-ui/core';
import { CloseOutlineIcon, MenuOutlineIcon } from '@vapor-ui/icons';
import clsx from 'clsx';
import Link from 'fumadocs-core/link';
import type * as PageTree from 'fumadocs-core/page-tree';
import type { SidebarPageTreeComponents } from 'fumadocs-ui/components/sidebar/page-tree';
import type { SidebarTabWithProps } from 'fumadocs-ui/components/sidebar/tabs/dropdown';
import type { GetSidebarTabsOptions } from 'fumadocs-ui/components/sidebar/tabs/index';
import { getSidebarTabs } from 'fumadocs-ui/components/sidebar/tabs/index';
import { buttonVariants } from 'fumadocs-ui/components/ui/button';
import { TreeContextProvider } from 'fumadocs-ui/contexts/tree';
import type { LinkItemType } from 'fumadocs-ui/layouts/shared';
import { type BaseLayoutProps, resolveLinkItems } from 'fumadocs-ui/layouts/shared';

import { ThemeToggle } from '../theme-toggle';
import { VersionSelector } from '../version-selector';
import {
    FilteredSidebarTabsDropdown,
    LayoutBody,
    LayoutContextProvider,
    LayoutHeader,
    LayoutHeaderTabs,
    LinkItem,
    NavbarLinkItem,
} from './docs-layout-client';
import type { LayoutHeaderTabsProps } from './docs-layout-client';
import { LargeSearchToggle, SearchToggle } from './search-toggle';
import {
    Sidebar,
    SidebarContent,
    SidebarDrawer,
    SidebarLinkItem,
    SidebarPageTree,
    SidebarTrigger,
    SidebarViewport,
} from './sidebar';

interface SidebarOptions extends ComponentProps<'aside'> {
    components?: Partial<SidebarPageTreeComponents>;

    /**
     * Root Toggle options
     */
    tabs?: SidebarTabWithProps[] | GetSidebarTabsOptions | false;

    headerTabsProps?: LayoutHeaderTabsProps;

    banner?: ReactNode | FC<ComponentProps<'div'>>;
    footer?: ReactNode | FC<ComponentProps<'div'>>;
}

export interface DocsLayoutProps extends BaseLayoutProps {
    tree: PageTree.Root;
    tabMode?: 'sidebar' | 'navbar';

    nav?: BaseLayoutProps['nav'] & {
        mode?: 'top' | 'auto';
    };

    sidebar?: SidebarOptions;

    containerProps?: ComponentProps<'div'>;

    versionSelector?: {
        enabled?: boolean;
        component?: ReactNode;
    };
}

export const CustomDocsLayout = (props: DocsLayoutProps) => {
    const {
        nav = {},
        sidebar: { tabs: tabOptions, headerTabsProps, ...sidebarProps } = {},
        tabMode = 'sidebar',
        themeSwitch = {},
        versionSelector = {},
        tree,
        containerProps,
        children,
    } = props;

    const navMode = nav.mode ?? 'auto';
    const links = resolveLinkItems(props);
    const tabs = useMemo(() => {
        if (Array.isArray(tabOptions)) {
            return tabOptions;
        }

        if (typeof tabOptions === 'object') {
            return getSidebarTabs(tree, tabOptions);
        }

        if (tabOptions !== false) {
            return getSidebarTabs(tree);
        }

        return [];
    }, [tabOptions, tree]);

    function sidebar() {
        const { banner, components, footer, ...rest } = sidebarProps;

        const iconLinks = links.filter((item) => item.type === 'icon');
        const Header =
            typeof banner === 'function'
                ? banner
                : ({ className, ...props }: ComponentProps<'div'>) => (
                      <div
                          className={clsx(
                              'flex flex-col gap-3 p-4 pb-2 empty:hidden sm:hidden',
                              className,
                          )}
                          {...props}
                      >
                          {props.children}
                          {banner}
                      </div>
                  );
        const Footer =
            typeof footer === 'function'
                ? footer
                : ({ className, ...props }: ComponentProps<'div'>) => (
                      <div
                          className={clsx(
                              'text-fd-muted-foreground hidden flex-row items-center border-t p-4 pt-2',
                              iconLinks.length > 0 && 'max-md:flex',
                              className,
                          )}
                          {...props}
                      >
                          {props.children}
                          {footer}
                      </div>
                  );

        // Normalize nav.title to ReactNode
        const titleNode: ReactNode =
            typeof nav.title === 'function' ? nav.title({} as ComponentProps<'a'>) : nav.title;

        const viewport = (
            <SidebarViewport>
                {links
                    .filter((item) => item.type !== 'icon')
                    .map((item, i, arr) => (
                        <SidebarLinkItem
                            key={i}
                            className={clsx('lg:hidden', i === arr.length - 1 && 'mb-4')}
                            item={item}
                        />
                    ))}

                <SidebarPageTree {...components} />
            </SidebarViewport>
        );

        return (
            <>
                <SidebarContent {...rest}>
                    <Header>
                        {navMode === 'auto' && (
                            <div className="flex justify-between">
                                <Link
                                    className="inline-flex items-center gap-2.5 font-medium"
                                    href={nav.url ?? '/'}
                                >
                                    {titleNode}
                                </Link>
                            </div>
                        )}
                        {nav.children}
                        {tabs.length > 0 && (
                            <FilteredSidebarTabsDropdown
                                className={clsx(tabMode === 'navbar' && 'lg:hidden')}
                                options={tabs}
                            />
                        )}
                    </Header>
                    {viewport}
                    <Footer>
                        {iconLinks.map((item, i) => (
                            <LinkItem
                                key={i}
                                aria-label={item.label}
                                item={item}
                                className={clsx(
                                    buttonVariants({
                                        className: 'lg:hidden',
                                        color: 'ghost',
                                        size: 'icon-sm',
                                    }),
                                )}
                            >
                                {item.icon}
                            </LinkItem>
                        ))}
                    </Footer>
                </SidebarContent>
                <SidebarDrawer {...rest}>
                    <Header>
                        <SidebarTrigger
                            className={clsx(
                                buttonVariants({
                                    className: 'text-fd-muted-foreground ms-auto',
                                    color: 'ghost',
                                    size: 'icon-sm',
                                }),
                            )}
                        >
                            <CloseOutlineIcon />
                        </SidebarTrigger>
                        {tabs.length > 0 && <FilteredSidebarTabsDropdown options={tabs} />}
                    </Header>
                    {viewport}
                    <Footer
                        className={clsx(
                            'hidden flex-row items-center justify-end',
                            themeSwitch.enabled !== false && 'flex',
                            iconLinks.length > 0 && 'max-md:flex',
                        )}
                    >
                        {iconLinks.map((item, i) => (
                            <LinkItem
                                key={i}
                                aria-label={item.label}
                                item={item}
                                className={clsx(
                                    buttonVariants({
                                        color: 'ghost',
                                        size: 'icon-sm',
                                    }),
                                    'text-fd-muted-foreground lg:hidden',
                                    i === iconLinks.length - 1 && 'me-auto',
                                )}
                            >
                                {item.icon}
                            </LinkItem>
                        ))}
                        {themeSwitch.enabled !== false &&
                            (themeSwitch.component ?? <ThemeToggle />)}
                    </Footer>
                </SidebarDrawer>
            </>
        );
    }

    return (
        <TreeContextProvider tree={tree}>
            <LayoutContextProvider
                navMode={nav.mode ?? 'auto'}
                navTransparentMode={nav.transparentMode}
                tabMode={tabMode}
            >
                <Sidebar>
                    <LayoutBody {...containerProps}>
                        {sidebar()}
                        <DocsNavbar
                            {...props}
                            versionSelector={versionSelector}
                            headerTabsProps={headerTabsProps}
                            links={links}
                            tabs={tabs}
                        />
                        {children}
                    </LayoutBody>
                </Sidebar>
            </LayoutContextProvider>
        </TreeContextProvider>
    );
};

function DocsNavbar({
    headerTabsProps,
    links,
    nav = {},
    searchToggle = {},
    tabMode = 'sidebar',
    tabs,
    themeSwitch = {},
    versionSelector = {},
}: DocsLayoutProps & {
    headerTabsProps?: LayoutHeaderTabsProps;
    links: LinkItemType[];
    tabs: SidebarTabWithProps[];
}) {
    const navMode = nav.mode ?? 'auto';
    const showLayoutTabs = tabMode === 'navbar' && tabs.length > 0;

    // Normalize nav.title to ReactNode
    const titleNode: ReactNode =
        typeof nav.title === 'function' ? nav.title({} as ComponentProps<'a'>) : nav.title;

    return (
        <LayoutHeader
            id="nd-subnav"
            className={clsx(
                'data-[transparent=false]:bg-fd-background/80 layout:[--fd-header-height:--spacing(23)] sticky top-(--fd-docs-row-1) z-100 flex flex-col backdrop-blur-sm transition-colors [grid-area:header]',
                showLayoutTabs && 'md:layout:[--fd-header-height:--spacing(25)]',
            )}
        >
            <div className="flex h-14 gap-2 border-b px-4 md:px-6" data-header-body="">
                <div
                    className={clsx(
                        'items-center',
                        navMode === 'top' && 'flex flex-1',
                        navMode === 'auto' &&
                            'hidden max-md:flex has-data-[collapsed=true]:md:flex',
                    )}
                >
                    <Link
                        href={nav.url ?? '/'}
                        className={clsx(
                            'inline-flex items-center gap-2.5 font-semibold',
                            navMode === 'auto' && 'md:hidden',
                        )}
                    >
                        {titleNode}
                    </Link>
                </div>
                {searchToggle.enabled !== false && (
                    <LargeSearchToggle
                        hideIfDisabled
                        className={clsx(
                            'my-auto w-full max-md:hidden',
                            navMode === 'top'
                                ? 'max-w-[240px] xl:max-w-sm rounded-xl ps-2.5'
                                : 'max-w-[240px]',
                        )}
                    />
                )}
                <div className="flex flex-1 items-center justify-end md:gap-2">
                    {versionSelector.enabled !== false &&
                        (versionSelector.component ?? <VersionSelector />)}
                    {links
                        .filter((item) => item.type !== 'icon')
                        .map((item, i) => (
                            <NavbarLinkItem
                                key={i}
                                item={item}
                                className="px-3 font-medium max-md:hidden"
                            />
                        ))}

                    {nav.children}
                    {links
                        .filter((item) => item.type === 'icon')
                        .map((item, i) => (
                            <IconButton
                                key={i}
                                size="md"
                                colorPalette="secondary"
                                variant="ghost"
                                nativeButton={false}
                                render={
                                    <LinkItem
                                        aria-label={item.label}
                                        item={item}
                                        className={clsx('text-fd-muted-foreground max-md:hidden')}
                                    >
                                        {item.icon}
                                    </LinkItem>
                                }
                            />
                        ))}

                    <div className="flex items-center md:hidden">
                        <SearchToggle hideIfDisabled className="p-2" />

                        <SidebarTrigger
                            className={clsx(
                                buttonVariants({
                                    className: '-me-1.5 p-2',
                                    color: 'ghost',
                                    size: 'icon-sm',
                                }),
                            )}
                        >
                            <MenuOutlineIcon />
                        </SidebarTrigger>
                    </div>

                    <div className="flex items-center gap-2 max-md:hidden">
                        {themeSwitch.enabled !== false &&
                            (themeSwitch.component ?? <ThemeToggle />)}
                    </div>
                </div>
            </div>
            {!!showLayoutTabs && (
                <LayoutHeaderTabs
                    className={clsx(
                        'h-10 overflow-x-auto border-b px-6',
                        headerTabsProps?.className,
                    )}
                    data-header-tabs=""
                    {...headerTabsProps}
                    options={tabs}
                />
            )}
        </LayoutHeader>
    );
}
