'use client';

import { forwardRef } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui-components/react';
import clsx from 'clsx';

import { resolveStyles } from '~/utils/resolve-styles';
import type { VComponentProps } from '~/utils/types';

import * as styles from './collapsible.css';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Root
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleRootProps extends VComponentProps<typeof BaseCollapsible.Root> {}

const Root = forwardRef<HTMLDivElement, CollapsibleRootProps>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseCollapsible.Root ref={ref} {...componentProps} />;
});
Root.displayName = 'Collapsible.Root';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleTriggerProps extends VComponentProps<typeof BaseCollapsible.Trigger> {}

const Trigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>((props, ref) => {
    const componentProps = resolveStyles(props);

    return <BaseCollapsible.Trigger ref={ref} {...componentProps} />;
});
Trigger.displayName = 'Collapsible.Trigger';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Panel
 * -----------------------------------------------------------------------------------------------*/

interface CollapsiblePanelProps extends VComponentProps<typeof BaseCollapsible.Panel> {}

const Panel = forwardRef<HTMLDivElement, CollapsiblePanelProps>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseCollapsible.Panel
            ref={ref}
            className={clsx(styles.panel, className)}
            {...componentProps}
        />
    );
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
