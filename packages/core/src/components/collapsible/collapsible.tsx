'use client';

import { forwardRef } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui-components/react';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './collapsible.css';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Root
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleRootProps extends VComponentProps<typeof BaseCollapsible.Root> {}

/**
 * Provides a collapsible container that can show or hide content. Renders a <div> element.
 *
 * Documentation: [Collapsible Documentation](https://vapor-ui.goorm.io/docs/components/collapsible)
 */
const Root = forwardRef<HTMLDivElement, CollapsibleRootProps>((props, ref) => {
    return <BaseCollapsible.Root ref={ref} {...props} />;
});
Root.displayName = 'Collapsible.Root';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleTriggerProps extends VComponentProps<typeof BaseCollapsible.Trigger> {}

/**
 * Toggles the collapsible panel's open/closed state when activated. Renders a <button> element.
 */
const Trigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>((props, ref) => {
    return <BaseCollapsible.Trigger ref={ref} {...props} />;
});
Trigger.displayName = 'Collapsible.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Panel
 * -----------------------------------------------------------------------------------------------*/

interface CollapsiblePanelProps extends VComponentProps<typeof BaseCollapsible.Panel> {}

/**
 * Contains the collapsible content that can be shown or hidden. Renders a <div> element.
 */
const Panel = forwardRef<HTMLDivElement, CollapsiblePanelProps>(({ className, ...props }, ref) => {
    return <BaseCollapsible.Panel ref={ref} className={clsx(styles.panel, className)} {...props} />;
});
Panel.displayName = 'Collapsible.Panel';

/* -----------------------------------------------------------------------------------------------*/

export { Root as CollapsibleRoot, Trigger as CollapsibleTrigger, Panel as CollapsiblePanel };

export type { CollapsibleRootProps, CollapsibleTriggerProps, CollapsiblePanelProps };

export const Collapsible = {
    Root,
    Trigger,
    Panel,
};
