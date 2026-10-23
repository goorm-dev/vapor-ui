'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui/react/radio';

import { cn } from '~/utils/cn';
import { createSplitProps } from '~/utils/create-split-props';
import { createDataAttributes } from '~/utils/data-attributes';
import { resolveStyles } from '~/utils/resolve-styles';
import type { VaporUIComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RadioCardVariants } from './radio-card.css';
import * as styles from './radio-card.css';

/**
 * Card-style radio button with room for a label or longer text, for picking one option from a set. Use inside `RadioGroup.Root`. Renders a `<span>` element and a hidden `<input>` beside it.
 */
export const RadioCard = forwardRef<HTMLElement, RadioCard.Props>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);
    const { invalid: contextInvalid } = useRadioGroupContext();

    const [variantProps, otherProps] = createSplitProps<RadioCardVariants>()(componentProps, [
        'invalid',
    ]);

    const { invalid: invalidProp } = variantProps;
    const invalid = invalidProp || contextInvalid;

    const dataAttrs = createDataAttributes({ invalid });

    return (
        <BaseRadio.Root
            ref={ref}
            aria-invalid={invalid}
            className={cn(styles.root({ invalid }), className)}
            {...dataAttrs}
            {...otherProps}
        />
    );
});
RadioCard.displayName = 'RadioCard';

export namespace RadioCard {
    export type State = BaseRadio.Root.State;
    export interface Props
        extends VaporUIComponentProps<typeof BaseRadio.Root, State>, RadioCardVariants {
        /**
         * Content shown inside the card, such as a label or a short description of the option.
         */
        children?: BaseRadio.Root.Props['children'];
    }
}
