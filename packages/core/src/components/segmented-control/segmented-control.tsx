import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui/react/radio';
import { RadioGroup as BaseRadioGroup } from '@base-ui/react/radio-group';

import { useRenderElement } from '~/hooks/use-render-element';
import { cn } from '~/utils/cn';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import * as styles from './segmented-control.css';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Root
 * -----------------------------------------------------------------------------------------------*/

export const SegmentedControlRoot = forwardRef<HTMLDivElement, SegmentedControlRoot.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseRadioGroup ref={ref} className={cn(styles.root, className)} {...componentProps} />
        );
    },
);
SegmentedControlRoot.displayName = 'SegmentedControl.Root';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Item
 * -----------------------------------------------------------------------------------------------*/

export const SegmentedControlItem = forwardRef<HTMLDivElement, SegmentedControlItem.Props>(
    (props, ref) => {
        const { render, className, ...componentProps } = resolveStyles(props);

        return (
            <BaseRadio.Root
                ref={ref}
                render={render ?? <button />}
                nativeButton={true}
                className={cn(styles.item, className)}
                {...componentProps}
            />
        );
    },
);
SegmentedControlItem.displayName = 'SegmentedControl.Item';

/* -------------------------------------------------------------------------------------------------
 * SegmentedControl.Indicator
 * -----------------------------------------------------------------------------------------------*/

export const SegmentedControlIndicator = forwardRef<
    HTMLDivElement,
    SegmentedControlIndicator.Props
>((props, ref) => {
    const { render, className, ...componentProps } = resolveStyles(props);

    return useRenderElement({
        ref,
        render,
        defaultTagName: 'div',
        props: { className: cn(className), ...componentProps },
    });
});
SegmentedControlIndicator.displayName = 'SegmentedControl.Indicator';

export namespace SegmentedControlRoot {
    export type State = BaseRadioGroup.State;
    export type Props = VaporUIComponentProps<typeof BaseRadioGroup, State>;
}

export namespace SegmentedControlItem {
    export type State = BaseRadio.Root.State;
    export type Props = VaporUIComponentProps<typeof BaseRadio.Root, State>;
}

export namespace SegmentedControlIndicator {
    export type State = {};
    export type Props = VaporUIComponentProps<'div', State>;
}
