import type {
    ComponentPropsWithRef,
    ComponentPropsWithoutRef,
    ElementType,
    ForwardRefExoticComponent,
    ReactNode,
} from 'react';
import { Children, cloneElement, createElement, forwardRef, isValidElement, memo } from 'react';

import { type Sprinkles, customPropertyMap, sprinkles } from '~/styles/sprinkles.css';
import { createSplitProps } from '~/utils/create-split-props';
import { getElementRef } from '~/utils/get-element-ref';

import { composeRefs } from '../utils/compose-refs';
import { mergeProps } from '../utils/merge-props';

export interface PolymorphicProps {
    /**
     * Use the provided child element as the default rendered element, combining their props and behavior.
     */
    asChild?: boolean;
}

type VaporPropsWithRef<E extends ElementType> = ComponentPropsWithRef<E> &
    PolymorphicProps &
    Sprinkles; // add sprinkles type

type VaporForwardRefComponent<E extends ElementType> = ForwardRefExoticComponent<
    VaporPropsWithRef<E>
>;
type JsxElements = {
    [E in keyof JSX.IntrinsicElements]: VaporForwardRefComponent<E>;
};

export const splitLayoutProps = <T extends Sprinkles>(props: T) => {
    return createSplitProps<Sprinkles>()(props, [
        'position',
        'display',
        'alignItems',
        'justifyContent',
        'flexDirection',
        'gap',
        'paddingTop',
        'paddingBottom',
        'paddingLeft',
        'paddingRight',
        'marginTop',
        'marginBottom',
        'marginLeft',
        'marginRight',
        'pointerEvents',
        'overflow',
        'opacity',
        'textAlign',
        'padding',
        'paddingX',
        'paddingY',
        'margin',
        'marginX',
        'marginY',
        'border',
        'borderRadius',
        'width',
        'height',
        'minWidth',
        'minHeight',
        'maxWidth',
        'maxHeight',
        'foreground',
        'background',
    ]);
};

/**
 * Maps custom prop names to their corresponding sprinkles properties
 * Uses customPropertyMap configuration for dynamic mapping
 */
const mapSprinkleProps = (props: Partial<Sprinkles>) => {
    const mapped: Record<string, unknown> = {};

    for (const [customProp, sprinkleProp] of Object.entries(customPropertyMap)) {
        if (customProp in props) {
            mapped[sprinkleProp] = props[customProp as keyof typeof props];
        }
    }

    return mapped;
};

const withAsChild = (Component: ElementType) => {
    const Comp = memo(
        forwardRef<unknown, VaporPropsWithRef<typeof Component>>((_props, ref) => {
            const { asChild, children, ...props } = _props;

            const [layoutProps, otherProps] = splitLayoutProps(props);

            const mappedProps = mapSprinkleProps(layoutProps);
            const { className, style } = sprinkles({ ...layoutProps, ...mappedProps });

            const mergedProps = mergeProps({ className, style }, otherProps);

            if (!asChild) {
                return createElement(Component, { ...mergedProps, ref }, children);
            }

            const onlyChild: ReactNode = Children.only(children);

            if (!isValidElement(onlyChild)) {
                return null;
            }

            const childRef = getElementRef(onlyChild);

            return cloneElement(onlyChild, {
                ...mergeProps(mergedProps, onlyChild.props),
                ref: ref ? composeRefs(ref, childRef) : childRef,
            });
        }),
    );

    // @ts-expect-error - it exists
    Comp.displayName = Component.displayName || Component.name;

    return Comp;
};

export type HTMLProps<T extends keyof JSX.IntrinsicElements> = ComponentPropsWithoutRef<T>;
export type HTMLVaporProps<T extends keyof JSX.IntrinsicElements> = HTMLProps<T> & PolymorphicProps;

export const jsxFactory = () => {
    const cache = new Map();

    return new Proxy(withAsChild, {
        apply(_target, _thisArg, argArray) {
            return withAsChild(argArray[0]);
        },
        get(_, element) {
            const asElement = element as ElementType;
            if (!cache.has(asElement)) {
                cache.set(asElement, withAsChild(asElement));
            }
            return cache.get(asElement);
        },
    }) as unknown as JsxElements;
};

export const vapor = jsxFactory();
export type VaporComponentProps<T extends keyof JSX.IntrinsicElements> =
    ComponentPropsWithoutRef<T> & PolymorphicProps & Sprinkles;
