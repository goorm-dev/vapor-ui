import { forwardRef } from 'react';

import { Collapsible as BaseCollapsible } from '@base-ui-components/react';
import clsx from 'clsx';

import type { VComponentProps } from '~/utils/types';

import * as styles from './collapsible.css';

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Root
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleRootProps extends VComponentProps<typeof BaseCollapsible.Root> {}

const Root = (props: CollapsibleRootProps) => {
    return <BaseCollapsible.Root {...props} />;
};

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Trigger
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleTriggerProps extends VComponentProps<typeof BaseCollapsible.Trigger> {}

const Trigger = forwardRef<HTMLButtonElement, CollapsibleTriggerProps>((props, ref) => {
    return <BaseCollapsible.Trigger ref={ref} {...props} />;
});

/* -------------------------------------------------------------------------------------------------
 * Collapsible.Content
 * -----------------------------------------------------------------------------------------------*/

interface CollapsibleContentProps extends VComponentProps<typeof BaseCollapsible.Panel> {}

const Content = forwardRef<HTMLDivElement, CollapsibleContentProps>(
    ({ className, ...props }, ref) => {
        return (
            <BaseCollapsible.Panel
                ref={ref}
                className={clsx(styles.content, className)}
                {...props}
            />
        );
    },
);

/* -----------------------------------------------------------------------------------------------*/

export { Root as CollapsibleRoot, Trigger as CollapsibleTrigger, Content as CollapsibleContent };

export type { CollapsibleRootProps, CollapsibleTriggerProps, CollapsibleContentProps };

export const Collapsible = {
    Root,
    Trigger,
    Content,
};
