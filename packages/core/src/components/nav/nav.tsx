import type { ComponentPropsWithoutRef } from 'react';
import { forwardRef } from 'react';

import * as styles from './nav.css';
import {
    Item as RadixItem,
    Link as RadixLink,
    List as RadixList,
    Root as RadixRoot,
} from '@radix-ui/react-navigation-menu';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import type { MergeRecipeVariants } from '~/libs/recipe';
import { createSplitProps } from '~/utils/create-split-props';

type NavContextType = NavVariants;
const [NavProvider, useNavContext] = createContext<NavContextType>({
    name: 'NavContext',
    providerName: 'NavProvider',
    hookName: 'useNavContext',
});

/* -------------------------------------------------------------------------------------------------
 * Nav.Root
 * -----------------------------------------------------------------------------------------------*/

type NavVariants = MergeRecipeVariants<
    typeof styles.list | typeof styles.item | typeof styles.link
>;

type NavPrimitiveProps = ComponentPropsWithoutRef<typeof RadixRoot>;
interface NavProps extends NavPrimitiveProps, NavVariants {
    label: string;
}

const Root = forwardRef<HTMLElement, NavProps>(({ label: ariaLabel, ...props }, ref) => {
    const [variantProps, otherProps] = createSplitProps<NavVariants>()(props, [
        'direction',
        'size',
        'shape',
        'stretch',
        'align',
        'disabled',
    ]);

    const { direction } = variantProps;

    return (
        <NavProvider value={variantProps}>
            <RadixRoot
                ref={ref}
                orientation={direction}
                aria-label={ariaLabel || undefined}
                {...otherProps}
            />
        </NavProvider>
    );
});
Root.displayName = 'Nav.Root';

/* -------------------------------------------------------------------------------------------------
 * Nav.List
 * -----------------------------------------------------------------------------------------------*/

type ListPrimitiveProps = ComponentPropsWithoutRef<typeof RadixList>;
interface NavMenuList extends ListPrimitiveProps {}

const List = forwardRef<HTMLUListElement, NavMenuList>(({ className, ...props }, ref) => {
    const { direction, stretch } = useNavContext();

    return (
        <RadixList
            ref={ref}
            className={clsx(styles.list({ direction, stretch }), className)}
            {...props}
        />
    );
});
List.displayName = 'Nav.List';

/* -------------------------------------------------------------------------------------------------
 * Nav.Item
 * -----------------------------------------------------------------------------------------------*/

type ItemPrimitiveProps = ComponentPropsWithoutRef<typeof RadixItem>;
interface NavItemProps extends ItemPrimitiveProps {}

const Item = forwardRef<HTMLLIElement, NavItemProps>(({ className, ...props }, ref) => {
    const { stretch } = useNavContext();

    return <RadixItem ref={ref} className={clsx(styles.item({ stretch }), className)} {...props} />;
});
Item.displayName = 'Nav.Item';

/* -------------------------------------------------------------------------------------------------
 * Nav.Link
 * -----------------------------------------------------------------------------------------------*/

type LinkPrimitiveProps = Omit<ComponentPropsWithoutRef<typeof RadixLink>, 'active'>;
interface NavLinkProps extends LinkPrimitiveProps {
    selected?: boolean;
    disabled?: boolean;
}

const Link = forwardRef<HTMLAnchorElement, NavLinkProps>(
    ({ selected, disabled, href, className, ...props }, ref) => {
        const { shape, size, align } = useNavContext();

        return (
            <RadixLink
                ref={ref}
                href={disabled ? undefined : href}
                active={selected}
                data-active={undefined}
                data-selected={selected ? 'true' : undefined}
                aria-disabled={disabled ? 'true' : undefined}
                className={clsx(styles.link({ shape, size, align, disabled }), className)}
                {...props}
            />
        );
    },
);
Link.displayName = 'Nav.Link';

/* -------------------------------------------------------------------------------------------------
 * Nav.LinkItem
 * -----------------------------------------------------------------------------------------------*/

interface NavLinkItemProps extends ComponentPropsWithoutRef<typeof RadixLink> {}

const LinkItem = forwardRef<HTMLAnchorElement, NavLinkProps>((props, ref) => {
    return (
        <Nav.Item>
            <Nav.Link ref={ref} {...props} />
        </Nav.Item>
    );
});
LinkItem.displayName = 'Nav.LinkItem';

/* -----------------------------------------------------------------------------------------------*/

export {
    Root as NavRoot,
    List as NavList,
    Item as NavItem,
    Link as NavLink,
    LinkItem as NavLinkItem,
};
export type { NavProps, NavMenuList, NavItemProps, NavLinkProps, NavLinkItemProps };

export const Nav = { Root, List, Item, Link, LinkItem };
