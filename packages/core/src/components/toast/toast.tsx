import type { ReactElement } from 'react';
import { forwardRef } from 'react';

import { Toast as BaseToast, type ToastManager as BaseToastManager } from '@base-ui/react/toast';
import { useRender } from '@base-ui/react/use-render';
import { CheckCircleIcon, CloseOutlineIcon, WarningIcon } from '@vapor-ui/icons';
import clsx from 'clsx';

import { createContext } from '~/libs/create-context';
import { createRender } from '~/utils/create-renderer';
import { resolveStyles } from '~/utils/resolve-styles';
import type { AnyProp, VComponentProps } from '~/utils/types';

import { Box } from '../box';
import { Button } from '../button';
import type { ButtonVariants } from '../button/button.css';
import { HStack } from '../h-stack';
import { IconButton } from '../icon-button';
import { VStack } from '../v-stack';
import * as styles from './toast.css';
import type { RootVariants } from './toast.css';

export const createToastManager = BaseToast.createToastManager as () => ToastManager;
export const useToastManager = BaseToast.useToastManager as () => UseToastManager;

/* -------------------------------------------------------------------------------------------------
 * ToastProvider
 * -----------------------------------------------------------------------------------------------*/

/**
 * Provider component that manages toast notifications and displays them.
 */
export const ToastProvider = ({ toastManager, ...props }: ToastProvider.Props) => {
    const { timeout = 4000, children, ...componentProps } = props;

    return (
        <ToastProviderPrimitive timeout={timeout} toastManager={toastManager} {...componentProps}>
            {children}
            <ToastList />
        </ToastProviderPrimitive>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Toast.List
 * -----------------------------------------------------------------------------------------------*/

const ToastList = () => {
    const { toasts } = useToastManager();

    return (
        <ToastPortalPrimitive>
            <ToastViewportPrimitive>
                {toasts.map((toast) => (
                    <ToastRootPrimitive key={toast.id} toast={toast}>
                        <ToastContentPrimitive>
                            <HStack gap="$075">
                                <Box marginY="3px">
                                    <ToastIconPrimitive />
                                </Box>
                                <VStack>
                                    <ToastTitlePrimitive />
                                    <ToastDescriptionPrimitive />
                                </VStack>
                            </HStack>
                            <HStack gap="$100" alignItems="center">
                                <ToastActionPrimitive />
                                <ToastClosePrimitive />
                            </HStack>
                        </ToastContentPrimitive>
                    </ToastRootPrimitive>
                ))}
            </ToastViewportPrimitive>
        </ToastPortalPrimitive>
    );
};

/* -------------------------------------------------------------------------------------------------
 * Toast.ProviderPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Primitive provider for toast notifications with custom toast manager support.
 */
export const ToastProviderPrimitive = ({
    toastManager,
    ...props
}: ToastProviderPrimitive.Props) => {
    return (
        <BaseToast.Provider toastManager={toastManager as unknown as BaseToastManager} {...props} />
    );
};

/* -------------------------------------------------------------------------------------------------
 * Toast.PortalPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Portal component for rendering toasts outside the main DOM hierarchy.
 */
export const ToastPortalPrimitive = (props: ToastPortalPrimitive.Props) => {
    return <BaseToast.Portal {...props} />;
};
ToastPortalPrimitive.displayName = 'Toast.PortalPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.ViewportPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Viewport container that positions and displays toast notifications. Renders a `<div>` element.
 */
export const ToastViewportPrimitive = forwardRef<HTMLDivElement, ToastViewportPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseToast.Viewport
                ref={ref}
                className={clsx(styles.viewport, className)}
                {...componentProps}
            />
        );
    },
);
ToastViewportPrimitive.displayName = 'Toast.ViewportPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.RootPrimitive
 * -----------------------------------------------------------------------------------------------*/

const [ToastContextProvider, useToastContext] = createContext<ToastProps>({
    name: 'Toast',
    providerName: 'ToastProvider',
    hookName: 'useToastContext',
});

/**
 * Root component for an individual toast notification. Renders a `<div>` element.
 */
export const ToastRootPrimitive = forwardRef<HTMLDivElement, ToastRootPrimitive.Props>(
    (props, ref) => {
        const {
            toast,
            swipeDirection = ['up', 'right'],
            className,
            ...componentProps
        } = resolveStyles(props);

        const { colorPalette, icon, close, actionProps } = toast;

        return (
            <ToastContextProvider value={{ icon, close, colorPalette, actionProps }}>
                <BaseToast.Root
                    ref={ref}
                    toast={toast as BaseToast.Root.ToastObject}
                    swipeDirection={swipeDirection}
                    className={clsx(styles.root({ colorPalette }), className)}
                    {...componentProps}
                />
            </ToastContextProvider>
        );
    },
);
ToastRootPrimitive.displayName = 'Toast.RootPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.ContentPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Container for toast content including title, description, and actions. Renders a `<div>` element.
 */
export const ToastContentPrimitive = forwardRef<HTMLDivElement, ToastContentPrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseToast.Content
                ref={ref}
                className={clsx(styles.content, className)}
                {...componentProps}
            />
        );
    },
);
ToastContentPrimitive.displayName = 'Toast.ContentPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.TitlePrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Title element for the toast notification. Renders an `<h3>` element.
 */
export const ToastTitlePrimitive = forwardRef<HTMLHeadingElement, ToastTitlePrimitive.Props>(
    (props, ref) => {
        const { className, ...componentProps } = resolveStyles(props);

        return (
            <BaseToast.Title
                ref={ref}
                className={clsx(styles.title, className)}
                {...componentProps}
            />
        );
    },
);
ToastTitlePrimitive.displayName = 'Toast.TitlePrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.DescriptionPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Description element for additional toast details. Renders a `<p>` element.
 */
export const ToastDescriptionPrimitive = forwardRef<
    HTMLParagraphElement,
    ToastDescriptionPrimitive.Props
>((props, ref) => {
    const { className, ...componentProps } = resolveStyles(props);

    return (
        <BaseToast.Description
            ref={ref}
            className={clsx(styles.description, className)}
            {...componentProps}
        />
    );
});
ToastDescriptionPrimitive.displayName = 'Toast.DescriptionPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.IconPrimitive
 * -----------------------------------------------------------------------------------------------*/

type IconMapper = { [key: string]: ReactElement };
const TOAST_ICONS: IconMapper = {
    success: <CheckCircleIcon color="white" size="16" />,
    danger: <WarningIcon color="white" size="16" />,
};

/**
 * Icon element that displays status-based icons for toasts. Renders an `<svg>` element.
 */
export const ToastIconPrimitive = forwardRef<SVGSVGElement, ToastIconPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);
        const { icon, colorPalette } = useToastContext();

        return useRender({
            ref,
            render: icon ?? TOAST_ICONS[colorPalette || ''],
            props: { ...componentProps },
        });
    },
);
ToastIconPrimitive.displayName = 'Toast.IconPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.ActionPrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Action button for toast interactions. Renders a `<button>` element.
 */
export const ToastActionPrimitive = forwardRef<HTMLButtonElement, ToastActionPrimitive.Props>(
    (props, ref) => {
        const componentProps = resolveStyles(props);
        const { actionProps } = useToastContext();

        const { colorPalette = 'secondary', size, variant } = actionProps ?? {};

        return (
            <BaseToast.Action
                ref={ref}
                render={<Button colorPalette={colorPalette} size={size} variant={variant} />}
                {...componentProps}
            />
        );
    },
);
ToastActionPrimitive.displayName = 'Toast.ActionPrimitive';

/* -------------------------------------------------------------------------------------------------
 * Toast.ClosePrimitive
 * -----------------------------------------------------------------------------------------------*/

/**
 * Close button for dismissing toast notifications. Renders a `<button>` element.
 */
export const ToastClosePrimitive = forwardRef<HTMLButtonElement, ToastClosePrimitive.Props>(
    (props, ref) => {
        const {
            render: renderProp,
            children: childrenProp,
            ...componentProps
        } = resolveStyles(props);
        const { close = true } = useToastContext();

        const children = useRender({
            render: createRender(childrenProp, <CloseOutlineIcon />),
        });

        if (!close) return null;

        const render = renderProp ?? (
            <IconButton
                aria-label="Close Toast"
                color="$inverse"
                colorPalette="secondary"
                variant="ghost"
            />
        );

        return (
            <BaseToast.Close ref={ref} render={render} {...componentProps}>
                {children}
            </BaseToast.Close>
        );
    },
);
ToastClosePrimitive.displayName = 'Toast.ClosePrimitive';

/* -----------------------------------------------------------------------------------------------*/

interface UseToastManager {
    toasts: ToastObjectType<AnyProp>[];
    add: <Data extends object>(options: ToastManagerAddOptions<Data>) => string;
    update: <Data extends object>(id: string, options: ToastManagerUpdateOptions<Data>) => void;
    close: (id: string) => void;
    promise: <Value, Data extends object>(
        promise: Promise<Value>,
        options: ToastManagerPromiseOptions<Value, Data>,
    ) => Promise<Value>;
}

type ToastVariants = RootVariants;
type ActionProps = BaseToastObject<AnyProp>['actionProps'] & ButtonVariants;
type ToastOptions = { icon?: ReactElement<unknown>; close?: boolean; actionProps?: ActionProps };

type ToastProps = ToastVariants & ToastOptions;

type BaseToastObject<Data extends object> = Partial<BaseToast.Root.ToastObject<Data>>;
type ToastObject<Data extends object> = Omit<BaseToastObject<Data>, 'type' | 'actionProps'>;

type ToastObjectType<Data extends object> = ToastObject<Data> & ToastProps;

type BasePromiseOptions = Omit<BaseToastManager['promise'], 'loading' | 'success' | 'error'>;

/* -----------------------------------------------------------------------------------------------*/

export interface ToastManagerAddOptions<Data extends object>
    extends Omit<ToastObjectType<Data>, 'id' | 'animation' | 'height' | 'ref' | 'limited'> {
    id?: string;
}

export interface ToastManagerUpdateOptions<Data extends object>
    extends Partial<ToastManagerAddOptions<Data>> {}

export interface ToastManagerPromiseOptions<Value, Data extends object> extends BasePromiseOptions {
    loading: string | ToastManagerUpdateOptions<Data>;
    success:
        | string
        | ToastManagerUpdateOptions<Data>
        | ((result: Value) => string | ToastManagerUpdateOptions<Data>);
    error:
        | string
        | ToastManagerUpdateOptions<Data>
        | ((error: AnyProp) => string | ToastManagerUpdateOptions<Data>);
}

export interface ToastManager extends BaseToastManager {
    ' subscribe': (
        listener: (data: {
            action: 'add' | 'close' | 'update' | 'promise';
            options: unknown;
        }) => void,
    ) => () => void;
    add: <Data extends object>(options: ToastManagerAddOptions<Data>) => string;
    update: <Data extends object>(id: string, options: ToastManagerUpdateOptions<Data>) => void;
    close: (id: string) => void;
    promise: <Value, Data extends object>(
        promise: Promise<Value>,
        options: ToastManagerPromiseOptions<Value, Data>,
    ) => Promise<Value>;
}

/* -----------------------------------------------------------------------------------------------*/

export namespace useToastManager {
    export type ReturnValue = UseToastManager;
    export type AddOptions<Data extends object> = ToastManagerAddOptions<Data>;
    export type UpdateOptions<Data extends object> = ToastManagerUpdateOptions<Data>;
    export type PromiseOptions<Value, Data extends object> = ToastManagerPromiseOptions<
        Value,
        Data
    >;
}

export namespace ToastProviderPrimitive {
    export interface Props extends BaseToast.Provider.Props {
        toastManager?: ToastManager;
    }
}

export namespace ToastProvider {
    export interface Props extends Omit<BaseToast.Provider.Props, 'toastManager'> {
        toastManager?: ToastManager;
    }
}

export namespace ToastPortalPrimitive {
    type PortalPrimitiveProps = BaseToast.Portal.Props;
    export interface Props extends PortalPrimitiveProps {}
}

export namespace ToastViewportPrimitive {
    type ViewportPrimitiveProps = VComponentProps<typeof BaseToast.Viewport>;
    export interface Props extends ViewportPrimitiveProps {}
}

export namespace ToastRootPrimitive {
    type RootPrimitiveProps = VComponentProps<typeof BaseToast.Root>;
    export interface Props extends Omit<RootPrimitiveProps, 'toast'> {
        toast: ToastObjectType<AnyProp>;
    }

    export interface ToastObject<Data extends object = AnyProp> extends ToastObjectType<Data> {}
}

export namespace ToastContentPrimitive {
    type ContentPrimitiveProps = VComponentProps<typeof BaseToast.Content>;
    export interface Props extends ContentPrimitiveProps {}
}

export namespace ToastTitlePrimitive {
    type TitlePrimitiveProps = VComponentProps<typeof BaseToast.Title>;
    export interface Props extends TitlePrimitiveProps {}
}

export namespace ToastDescriptionPrimitive {
    type DescriptionPrimitiveProps = VComponentProps<typeof BaseToast.Description>;
    export interface Props extends DescriptionPrimitiveProps {}
}

export namespace ToastIconPrimitive {
    type IconPrimitiveProps = VComponentProps<'span'>;
    export interface Props extends IconPrimitiveProps {}
}

export namespace ToastActionPrimitive {
    type ActionPrimitiveProps = VComponentProps<typeof BaseToast.Action>;
    export interface Props extends ActionPrimitiveProps {}
}

export namespace ToastClosePrimitive {
    type ClosePrimitiveProps = VComponentProps<typeof BaseToast.Close>;
    export interface Props extends ClosePrimitiveProps {}
}
