import { forwardRef } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui-components/react';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './collapsible.css';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Root
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleRootProps extends VComponentProps<typeof BaseCollapsible.Root> {}

const Root = forwardRef<HTMLDivElement, CollapsibleRootProps>((props, ref) => {
    return <BaseCollapsible.Root ref={ref} {...props} />;
});
Root.displayName = 'Collapsible.Root';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleTriggerProps extends VComponentProps<typeof BaseCollapsible.Trigger> {}

const Trigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>((props, ref) => {
    return <BaseCollapsible.Trigger ref={ref} {...props} />;
});
Trigger.displayName = 'Collapsible.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Panel
 * -----------------------------------------------------------------------------------------------*/

interface CollapsiblePanelProps extends VComponentProps<typeof BaseCollapsible.Panel> {}

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
