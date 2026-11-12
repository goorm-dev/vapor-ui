'use client';

import type * as React from 'react';

import { usePathname } from 'fumadocs-core/framework';
import type * as PageTree from 'fumadocs-core/page-tree';
import type { SidebarPageTreeComponents } from 'fumadocs-ui/components/sidebar/page-tree';
import { useTreePath } from 'fumadocs-ui/contexts/tree';

import {
    SidebarFolder,
    SidebarFolderContent,
    SidebarFolderLink,
    SidebarFolderTrigger,
    SidebarItem,
} from './sidebar';

/**
 * Pages flagged `subpage: true` in frontmatter are hidden from the sidebar but
 * stay in the page tree so `useTreePath` resolves them. The folder/item
 * renderers below collapse single-subpage folders into one link and treat the
 * subpage URL as "active on the parent" so the sibling entry stays highlighted.
 */
const normalizeUrl = (url: string): string =>
    url.length > 1 && url.endsWith('/') ? url.slice(0, -1) : url;

const isSubpageNode = (node: PageTree.Node): boolean =>
    (node as { subpage?: boolean }).subpage === true;

/** Parent URL of a tree path currently resolving to a subpage leaf, else null. */
const useActiveSubpageParentUrl = (): string | null => {
    const treePath = useTreePath();
    const leaf = treePath.at(-1);
    if (!leaf || leaf.type !== 'page' || !isSubpageNode(leaf)) return null;
    const url = normalizeUrl(leaf.url);
    const slash = url.lastIndexOf('/');
    return slash > 0 ? url.slice(0, slash) : null;
};

const isActiveForSubpages = (
    url: string,
    pathname: string,
    subpageParent: string | null,
): boolean => {
    const href = normalizeUrl(url);
    const path = normalizeUrl(pathname);
    if (href === path) return true;
    return !!subpageParent && href === subpageParent;
};

const hasOnlySubpageChildren = (folder: PageTree.Folder): boolean => {
    if (folder.children.length === 0) return false;
    return folder.children.every((child) => child.type === 'page' && isSubpageNode(child));
};

export const SubpageAwareSidebarItem: SidebarPageTreeComponents['Item'] = ({
    item,
}: {
    item: PageTree.Item;
}) => {
    const pathname = usePathname();
    const subpageParent = useActiveSubpageParentUrl();
    if (isSubpageNode(item)) return null;
    return (
        <SidebarItem
            href={item.url}
            external={item.external}
            icon={item.icon}
            active={isActiveForSubpages(item.url, pathname, subpageParent)}
        >
            {item.name}
        </SidebarItem>
    );
};

/**
 * When a folder only hosts hidden subpages, collapse it back to a single
 * sidebar link so the in-page tabs are the only navigation surface — no stray
 * chevron, no empty folder content.
 */
export const SubpageAwareSidebarFolder: SidebarPageTreeComponents['Folder'] = ({
    item,
    children,
}: {
    item: PageTree.Folder;
    children: React.ReactNode;
}) => {
    const pathname = usePathname();
    const treePath = useTreePath();
    const subpageParent = useActiveSubpageParentUrl();

    if (hasOnlySubpageChildren(item) && item.index) {
        return (
            <SidebarItem
                href={item.index.url}
                external={item.index.external}
                icon={item.icon ?? item.index.icon}
                active={isActiveForSubpages(item.index.url, pathname, subpageParent)}
            >
                {item.index.name ?? item.name}
            </SidebarItem>
        );
    }

    const active = treePath.includes(item);
    return (
        <SidebarFolder collapsible={item.collapsible} defaultOpen={item.defaultOpen || active}>
            {item.index ? (
                <SidebarFolderLink
                    href={item.index.url}
                    external={item.index.external}
                    active={isActiveForSubpages(item.index.url, pathname, subpageParent)}
                >
                    {item.icon}
                    {item.name}
                </SidebarFolderLink>
            ) : (
                <SidebarFolderTrigger>
                    {item.icon}
                    {item.name}
                </SidebarFolderTrigger>
            )}
            <SidebarFolderContent>{children}</SidebarFolderContent>
        </SidebarFolder>
    );
};
