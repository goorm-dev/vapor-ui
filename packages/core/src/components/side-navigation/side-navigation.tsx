'use client';

import type { Ref } from 'react';
import { forwardRef, useMemo } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import { ChevronDownOutlineIcon } from '@vapor-ui/icons';

import { useRenderElement } from '~/hooks/use-render-element';
import { createContext } from '~/libs/create-context';
import { cn } from '~/utils/cn';
import { createRender } from '~/utils/create-renderer';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './side-navigation.css';

type SideNavigationSharedProps = {
    /**
     * Disables every link, sub link, and trigger in the side navigation, blocking all interactions. A `disabled` set on a link, sub link, or trigger takes precedence.
     */
    disabled?: boolean;
};
type SideNavigationContextType = SideNavigationSharedProps;

const [SideNavigationProvider, useSideNavigationContext] = createContext<SideNavigationContextType>(
    {
        name: 'SideNavigationContext',
        providerName: 'SideNavigationProvider',
        hookName: 'useSideNavigationContext',
    },
);

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.Root
 * -----------------------------------------------------------------------------------------------*/

/**
 * Root of the SideNavigation compound component, a vertical menu of page links where some entries open a group of sub links. Shares `disabled` with the parts inside it. Renders a `<nav>` element.
 */
export const SideNavigationRoot = forwardRef<HTMLElement, SideNavigationRoot.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);
        const [contextProps, otherProps] = createSplitProps<SideNavigationContextType>()(
            componentProps,
            ['disabled'],
        );

        const element = useRenderElement({
            ref,
            render,
            defaultTagName: 'nav',
            props: otherProps,
        });

        return <SideNavigationProvider value={contextProps}>{element}</SideNavigationProvider>;
    },
);
SideNavigationRoot.displayName = 'SideNavigation.Root';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.List
 * -----------------------------------------------------------------------------------------------*/

/**
 * List that stacks the top-level entries of the side navigation vertically. Renders a `<ul>` element.
 */
export const SideNavigationList = forwardRef<HTMLUListElement, SideNavigationList.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'ul',
            props: {
                className: cn(styles.list, className),
                ...componentProps,
            },
        });
    },
);
SideNavigationList.displayName = 'SideNavigation.List';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.Item
 * -----------------------------------------------------------------------------------------------*/

/**
 * Holds one entry of a list, such as a link or a sub link. Renders an `<li>` element.
 */
export const SideNavigationItem = forwardRef<HTMLLIElement, SideNavigationItem.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);

        return useRenderElement({
            ref,
            render,
            defaultTagName: 'li',
            props: componentProps,
        });
    },
);
SideNavigationItem.displayName = 'SideNavigation.Item';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.Link
 * -----------------------------------------------------------------------------------------------*/

/**
 * Link to a top-level page. Set `current` on the link for the page the user is on. Renders an `<a>` element.
 */
export const SideNavigationLink = forwardRef<HTMLAnchorElement, SideNavigationLink.Props>(
    (props, ref) => {
        const {
            render,
            current = false,
            href,
            disabled: disabledProp,
            className,
            ...componentProps
        } = resolveStyles(props);
        const { disabled: contextDisabled } = useSideNavigationContext();

        const disabled = disabledProp ?? contextDisabled ?? false;
        const state: SideNavigationLink.State = useMemo(
            () => ({ current, disabled }),
            [current, disabled],
        );

        return useRenderElement({
            ref,
            render,
            state,
            defaultTagName: 'a',
            props: {
                href: disabled ? undefined : href,
                'aria-current': current ? 'page' : undefined,
                'aria-disabled': disabled ? 'true' : undefined,
                className: cn(styles.topLevel, className),
                ...componentProps,
            },
        });
    },
);
SideNavigationLink.displayName = 'SideNavigation.Link';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.Group
 * -----------------------------------------------------------------------------------------------*/

/**
 * Holds a trigger and the panel of sub links it opens, and manages their open state. Each group opens and closes on its own. Renders an `<li>` element.
 */
export const SideNavigationGroup = forwardRef<HTMLLIElement, SideNavigationGroup.Props>(
    (props, ref) => {
        const { render, ...componentProps } = resolveStyles(props);

        return (
            <BaseCollapsible.Root
                ref={ref as Ref<HTMLDivElement>}
                render={render ?? <li />}
                {...componentProps}
            />
        );
    },
);
SideNavigationGroup.displayName = 'SideNavigation.Group';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.TriggerPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Button that opens and closes the panel of its group when clicked. Renders a `<button>` element.
 */
export const SideNavigationTriggerPrimitive = forwardRef<
    HTMLButtonElement,
    SideNavigationTriggerPrimitive.Props
>((props, ref) => {
    const { disabled: disabledProp, className, ...componentProps } = resolveStyles(props);
    const { disabled: contextDisabled } = useSideNavigationContext();

    const disabled = disabledProp ?? contextDisabled;
    const dataAttrs = createDataAttributes({ disabled });

    return (
        <BaseCollapsible.Trigger
            ref={ref}
            disabled={disabled}
            className={cn(styles.topLevel, className)}
            {...dataAttrs}
            {...componentProps}
        />
    );
});
SideNavigationTriggerPrimitive.displayName = 'SideNavigation.TriggerPrimitive';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.TriggerIndicatorPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Chevron icon that turns upside down while the panel of its group is open, hidden from assistive technologies. Renders a `<span>` element.
 */
export const SideNavigationTriggerIndicatorPrimitive = forwardRef<
    HTMLSpanElement,
    SideNavigationTriggerIndicatorPrimitive.Props
>((props, ref) => {
    const { render, className, children: childrenProp, ...componentProps } = resolveStyles(props);

    const childrenRender = createRender(childrenProp, <ChevronDownOutlineIcon size={20} />);
    const children = useRenderElement({
        render: childrenRender,
    });

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'span',
        props: {
            'aria-hidden': 'true',
            className: cn(styles.indicator, className),
            children,
            ...componentProps,
        },
    });
});
SideNavigationTriggerIndicatorPrimitive.displayName = 'SideNavigation.TriggerIndicatorPrimitive';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.Trigger
 * -----------------------------------------------------------------------------------------------*/

/**
 * Combines `SideNavigation.TriggerPrimitive` and `SideNavigation.TriggerIndicatorPrimitive` into a single part, with the chevron after the label. Opens and closes the panel of its group and does not link to a page. Renders a `<button>` element.
 */
export const SideNavigationTrigger = forwardRef<HTMLButtonElement, SideNavigationTrigger.Props>(
    (props, ref) => {
        const { children, ...componentProps } = props;

        return (
            <SideNavigationTriggerPrimitive ref={ref} {...componentProps}>
                {children}

                <SideNavigationTriggerIndicatorPrimitive />
            </SideNavigationTriggerPrimitive>
        );
    },
);
SideNavigationTrigger.displayName = 'SideNavigation.Trigger';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.Panel
 * -----------------------------------------------------------------------------------------------*/

/**
 * List of sub links that expands and collapses with a height animation. Renders a `<ul>` element.
 */
export const SideNavigationPanel = forwardRef<HTMLUListElement, SideNavigationPanel.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return (
            <BaseCollapsible.Panel
                ref={ref as Ref<HTMLDivElement>}
                render={render ?? <ul />}
                className={cn(styles.panel, className)}
                {...componentProps}
            />
        );
    },
);
SideNavigationPanel.displayName = 'SideNavigation.Panel';

/* -------------------------------------------------------------------------------------------------
 * SideNavigation.SubLink
 * -----------------------------------------------------------------------------------------------*/

/**
 * Link to a page inside a group, indented under its trigger. Set `current` on the link for the page the user is on. Renders an `<a>` element.
 */
export const SideNavigationSubLink = forwardRef<HTMLAnchorElement, SideNavigationSubLink.Props>(
    (props, ref) => {
        const {
            render,
            current = false,
            href,
            disabled: disabledProp,
            className,
            ...componentProps
        } = resolveStyles(props);
        const { disabled: contextDisabled } = useSideNavigationContext();

        const disabled = disabledProp ?? contextDisabled ?? false;
        const state: SideNavigationSubLink.State = useMemo(
            () => ({ current, disabled }),
            [current, disabled],
        );

        return useRenderElement({
            ref,
            render,
            state,
            defaultTagName: 'a',
            props: {
                href: disabled ? undefined : href,
                'aria-current': current ? 'page' : undefined,
                'aria-disabled': disabled ? 'true' : undefined,
                className: cn(styles.subLink({ current: current && !disabled }), className),
                ...componentProps,
            },
        });
    },
);
SideNavigationSubLink.displayName = 'SideNavigation.SubLink';

/* -----------------------------------------------------------------------------------------------*/

export namespace SideNavigationRoot {
    export type State = {};
    export type Props = SideNavigationSharedProps & VaporUIComponentProps<'nav', State>;
}

export namespace SideNavigationList {
    export type State = {};
    export type Props = VaporUIComponentProps<'ul', State>;
}

export namespace SideNavigationItem {
    export type State = {};
    export type Props = VaporUIComponentProps<'li', State>;
}

export interface SideNavigationLinkState {
    [key: string]: unknown;
    /**
     * Whether the link is the current page.
     */
    current: boolean;
    /**
     * Whether the link ignores user interaction.
     */
    disabled: boolean;
}

export interface SideNavigationLinkProps extends VaporUIComponentProps<
    'a',
    SideNavigationLinkState
> {
    /**
     * Marks the link as the current page, applying the current style and setting `aria-current="page"`.
     */
    current?: boolean;
    /**
     * Disables the link, blocking all interactions. Removes `href` and sets `aria-disabled` on the `<a>` element. Takes precedence over `disabled` on `SideNavigation.Root`, and over `current` in how the link looks.
     */
    disabled?: boolean;
}

export namespace SideNavigationLink {
    export type State = SideNavigationLinkState;
    export type Props = SideNavigationLinkProps;
}

export namespace SideNavigationGroup {
    export type State = BaseCollapsible.Root.State;
    export type Props = VaporUIComponentProps<typeof BaseCollapsible.Root, State>;
    export type ChangeEventDetails = BaseCollapsible.Root.ChangeEventDetails;
}

export namespace SideNavigationTriggerPrimitive {
    export type State = BaseCollapsible.Trigger.State;
    export type Props = VaporUIComponentProps<typeof BaseCollapsible.Trigger, State>;
}

export namespace SideNavigationTriggerIndicatorPrimitive {
    export type State = {};
    export interface Props extends VaporUIComponentProps<'span', State> {
        /**
         * Icon shown as the indicator. Replaces the default chevron down icon.
         */
        children?: VaporUIComponentProps<'span', State>['children'];
    }
}

export namespace SideNavigationTrigger {
    export type State = SideNavigationTriggerPrimitive.State;
    export type Props = SideNavigationTriggerPrimitive.Props;
}

export namespace SideNavigationPanel {
    export type State = BaseCollapsible.Panel.State;
    export type Props = VaporUIComponentProps<typeof BaseCollapsible.Panel, State>;
}

export interface SideNavigationSubLinkState {
    [key: string]: unknown;
    /**
     * Whether the sub link is the current page.
     */
    current: boolean;
    /**
     * Whether the sub link ignores user interaction.
     */
    disabled: boolean;
}

export interface SideNavigationSubLinkProps extends VaporUIComponentProps<
    'a',
    SideNavigationSubLinkState
> {
    /**
     * Marks the sub link as the current page, applying the current style and setting `aria-current="page"`.
     */
    current?: boolean;
    /**
     * Disables the sub link, blocking all interactions. Removes `href` and sets `aria-disabled` on the `<a>` element. Takes precedence over `disabled` on `SideNavigation.Root`, and over `current` in how the sub link looks.
     */
    disabled?: boolean;
}

export namespace SideNavigationSubLink {
    export type State = SideNavigationSubLinkState;
    export type Props = SideNavigationSubLinkProps;
}
