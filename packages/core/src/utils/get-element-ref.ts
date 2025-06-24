// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export const getElementRef = (element: React.ReactElement) => {
    // React <=18 in DEV
    let getter = Object.getOwnPropertyDescriptor(element.props, 'ref')?.get;
    let mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
    if (mayWarn) {
        return (element as Any).ref;
    }

    // React 19 in DEV
    getter = Object.getOwnPropertyDescriptor(element, 'ref')?.get;
    mayWarn = getter && 'isReactWarning' in getter && getter.isReactWarning;
    if (mayWarn) {
        return (element.props as { ref?: React.Ref<unknown> }).ref;
    }

    // Not DEV
    return (element.props as { ref?: React.Ref<unknown> }).ref || (element as Any).ref;
};
