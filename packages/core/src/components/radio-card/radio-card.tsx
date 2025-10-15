'use client';

import { forwardRef } from 'react';

import { Radio as BaseRadio } from '@base-ui-components/react';
import clsx from 'clsx';

import { createSplitProps } from '~/utils/create-split-props';
import type { VComponentProps } from '~/utils/types';

import { useRadioGroupContext } from '../radio-group';
import type { RadioCardVariants } from './radio-card.css';
import * as styles from './radio-card.css';

type RootPrimitiveProps = VComponentProps<typeof BaseRadio.Root>;
interface RadioCardProps extends RootPrimitiveProps, RadioCardVariants {}

const RadioCard = forwardRef<HTMLButtonElement, RadioCardProps>(
    ({ className, children, ...props }, ref) => {
        const { size: contextSize, invalid: contextInvalid } = useRadioGroupContext();

        const [variantProps, otherProps] = createSplitProps<RadioCardVariants>()(props, [
            'invalid',
            'size',
        ]);
        const { size: sizeProp, invalid: invalidProp } = variantProps;

        const invalid = invalidProp || contextInvalid;
        const size = sizeProp || contextSize;

        return (
            <label>
                <BaseRadio.Root
                    ref={ref}
                    aria-invalid={invalid}
                    className={clsx(styles.root({ size, invalid }), className)}
                    {...otherProps}
                >
                    {children}
                </BaseRadio.Root>
            </label>
        );
    },
);
RadioCard.displayName = 'RadioCard';

export { RadioCard };
export type { RadioCardProps };
