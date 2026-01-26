// Test fixture for props extraction

type VComponentProps<T> = { ref?: React.Ref<T> };
type Assign<T, U> = Omit<T, keyof U> & U;

interface ButtonVariants {
    variant?: 'primary' | 'secondary';
    size?: 'sm' | 'md' | 'lg';
}

// Pattern 1: Simple - no extends
export namespace Simple {
    export interface Props {
        label: string;
    }
}

// Pattern 2: Single extends
export namespace Button {
    type ButtonPrimitiveProps = VComponentProps<'button'>;
    export interface Props extends ButtonPrimitiveProps, ButtonVariants {}
}

// Pattern 3: With direct properties
export namespace Dialog {
    type DialogPrimitiveProps = VComponentProps<'div'>;
    export interface Props extends DialogPrimitiveProps {
        open?: boolean;
        onClose?: () => void;
    }
    export type ChangeEventDetails = { open: boolean };
}

// Pattern 4: Assign utility type
type TabsContext = { variant: string };
export namespace TabsList {
    type BaseProps = VComponentProps<'div'>;
    export interface Props extends Assign<BaseProps, TabsContext> {}
}
