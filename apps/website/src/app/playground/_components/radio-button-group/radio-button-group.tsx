import type { ComponentProps, ElementRef } from 'react';
import { createContext, forwardRef, useContext } from 'react';

import type { RadioGroupItemProps, RadioGroupProps } from '@radix-ui/react-radio-group';
import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group';
import { Button } from '@vapor-ui/core';
import cx from 'clsx';

import styles from './radio-button-group.module.scss';

type RadioButtonGroupContextType = {
    direction: 'horizontal' | 'vertical';
    checked: string;
    setChecked: (checked: string) => void;
};

const RadioButtonGroupContext = createContext<RadioButtonGroupContextType>({
    direction: 'horizontal',
    checked: '',
    setChecked: () => {},
});

export const useRadioButtonGroupContext = () => {
    const context = useContext(RadioButtonGroupContext);
    if (context === null) {
        throw new Error('useRadioButtonGroupContext must be used within a RadioGroupProvider');
    }
    return context;
};

type RadioButtonGroupProps = RadioGroupProps & ComponentProps<'div'>;

const Root = forwardRef<HTMLDivElement, RadioButtonGroupProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <RadioGroup ref={ref} className={cx(styles.radioButtonGroup, className)} {...props}>
                {children}
            </RadioGroup>
        );
    },
);
Root.displayName = 'RadioButtonGroup';

type ButtonRef = ElementRef<typeof Button>;
type ButtonProps = ComponentProps<typeof Button> & RadioGroupItemProps;

const RadioButton = forwardRef<ButtonRef, ButtonProps>(({ value, children, ...props }, ref) => {
    return (
        <RadioGroupItem asChild ref={ref} value={value} {...props}>
            <Button variant="outline" stretch>
                {children}
            </Button>
        </RadioGroupItem>
    );
});
RadioButton.displayName = 'ButtonGroup.Button';

const RadioButtonGroup = Object.assign(Root, { Button: RadioButton });
export default RadioButtonGroup;
