import type { CSSProperties, ReactElement, Ref } from 'react';
import { Fragment, cloneElement, createRef, useCallback, useState } from 'react';

import { render } from '@testing-library/react';

import { adaptRenderElement } from './adapt-render-element';

interface TargetState {
    disabled: boolean;
}

interface TargetProps {
    ref?: Ref<HTMLButtonElement>;
    className?: string | ((state: TargetState) => string);
    style?: CSSProperties | ((state: TargetState) => CSSProperties);
    disabled?: boolean;
    type?: 'button' | 'submit';
    onClick?: () => void;
}

/** Resolves its own stateful callbacks, like a Vapor component does. */
const Target = ({ ref, className, style, disabled = false, ...props }: TargetProps) => {
    const state: TargetState = { disabled };

    return (
        <button
            ref={ref}
            className={typeof className === 'function' ? className(state) : className}
            style={typeof style === 'function' ? style(state) : style}
            {...props}
        />
    );
};

type HostProps = Record<string, unknown> & { ref?: Ref<HTMLButtonElement> };
type RenderCallback = (props: HostProps, state: object) => ReactElement<HostProps>;

/** Calls a render callback with host props, like a Base UI part does. */
const Host = ({ render, hostProps = {} }: { render: unknown; hostProps?: HostProps }) => {
    expect(typeof render).toBe('function');

    return (render as RenderCallback)(hostProps, {});
};

describe('adaptRenderElement', () => {
    describe('given a render element without stateful callbacks', () => {
        it('returns the element as-is', () => {
            const element = <Target className="static" />;

            expect(adaptRenderElement(element)).toBe(element);
        });
    });

    describe('given a non-element render', () => {
        it('returns a render function as-is', () => {
            const callback = () => <div />;

            expect(adaptRenderElement(callback)).toBe(callback);
        });

        it('returns undefined as-is', () => {
            expect(adaptRenderElement(undefined)).toBeUndefined();
        });

        it('returns a Fragment as-is', () => {
            const fragment = (
                <Fragment>
                    <Target className={() => 'on'} />
                </Fragment>
            );

            expect(adaptRenderElement(fragment)).toBe(fragment);
        });
    });

    describe('given a render element with a function className', () => {
        const className = (state: TargetState) => (state.disabled ? 'off' : 'on');

        it('keeps the className a function and appends the host className', () => {
            const rendered = render(
                <Host
                    render={adaptRenderElement(<Target className={className} />)}
                    hostProps={{ className: 'host' }}
                />,
            );

            expect(rendered.getByRole('button')).toHaveAttribute('class', 'host on');

            rendered.rerender(
                <Host
                    render={adaptRenderElement(<Target className={className} disabled />)}
                    hostProps={{ className: 'host' }}
                />,
            );

            expect(rendered.getByRole('button')).toHaveAttribute('class', 'host off');
        });

        it('passes the function through when the host has no className', () => {
            const rendered = render(
                <Host render={adaptRenderElement(<Target className={className} disabled />)} />,
            );

            expect(rendered.getByRole('button')).toHaveAttribute('class', 'off');
        });
    });

    describe('given a render element with a function style', () => {
        it('keeps the style a function and lays it over the host style', () => {
            const style = (state: TargetState) => ({ opacity: state.disabled ? 0.4 : 1 });
            const rendered = render(
                <Host
                    render={adaptRenderElement(<Target style={style} disabled />)}
                    hostProps={{ style: { color: 'red', opacity: 0 } }}
                />,
            );

            expect(rendered.getByRole('button')).toHaveStyle({ color: 'red', opacity: '0.4' });
        });
    });

    describe('merging the other props', () => {
        it('calls both the host and element event handlers', () => {
            const hostClick = vi.fn();
            const elementClick = vi.fn();
            const rendered = render(
                <Host
                    render={adaptRenderElement(
                        <Target className={() => 'on'} onClick={elementClick} />,
                    )}
                    hostProps={{ onClick: hostClick }}
                />,
            );

            rendered.getByRole('button').click();

            expect(hostClick).toHaveBeenCalledTimes(1);
            expect(elementClick).toHaveBeenCalledTimes(1);
        });

        it('lets element props override host props', () => {
            const rendered = render(
                <Host
                    render={adaptRenderElement(<Target className={() => 'on'} type="submit" />)}
                    hostProps={{ type: 'button', 'data-host': '' }}
                />,
            );
            const button = rendered.getByRole('button');

            expect(button).toHaveAttribute('type', 'submit');
            expect(button).toHaveAttribute('data-host', '');
        });

        it('merges the props a host clones onto the adapted element', () => {
            const hostClick = vi.fn();
            const clonedClick = vi.fn();
            const clonedRef = createRef<HTMLButtonElement>();

            /** Renders the adapted element, then clones it with more props, like Toolbar does. */
            const CloningHost = ({ render }: { render: unknown }) =>
                cloneElement((render as RenderCallback)({ onClick: hostClick }, {}), {
                    className: 'cloned',
                    'data-cloned': '',
                    onClick: clonedClick,
                    ref: clonedRef,
                    children: 'label',
                });

            const rendered = render(
                <CloningHost render={adaptRenderElement(<Target className={() => 'on'} />)} />,
            );
            const button = rendered.getByRole('button', { name: 'label' });

            button.click();

            expect(button).toHaveAttribute('class', 'cloned on');
            expect(button).toHaveAttribute('data-cloned', '');
            expect(clonedRef.current).toBe(button);
            expect(hostClick).toHaveBeenCalledTimes(1);
            expect(clonedClick).toHaveBeenCalledTimes(1);
        });

        it('assigns the node to both the host ref and the element ref', () => {
            const hostRef = createRef<HTMLButtonElement>();
            const elementRef = createRef<HTMLButtonElement>();
            const rendered = render(
                <Host
                    render={adaptRenderElement(<Target ref={elementRef} className={() => 'on'} />)}
                    hostProps={{ ref: hostRef }}
                />,
            );
            const button = rendered.getByRole('button');

            expect(hostRef.current).toBe(button);
            expect(elementRef.current).toBe(button);
        });
    });

    describe('keeping the composed ref stable', () => {
        it('does not loop when the element ref sets state on attach', () => {
            const Measured = () => {
                const [, setSize] = useState({ width: -1 });
                const measure = useCallback((node: HTMLButtonElement | null) => {
                    if (node) setSize({ width: node.offsetWidth });
                }, []);

                return (
                    <Host
                        render={adaptRenderElement(<Target ref={measure} className={() => 'on'} />)}
                    />
                );
            };

            expect(() => render(<Measured />)).not.toThrow();
        });

        it('attaches the refs once across host renders with the same refs', () => {
            const hostRef = vi.fn();
            const elementRef = vi.fn();
            const ui = () => (
                <Host
                    render={adaptRenderElement(<Target ref={elementRef} className={() => 'on'} />)}
                    hostProps={{ ref: hostRef }}
                />
            );
            const rendered = render(ui());

            rendered.rerender(ui());
            rendered.rerender(ui());

            const button = rendered.getByRole('button');

            expect(hostRef.mock.calls).toEqual([[button]]);
            expect(elementRef.mock.calls).toEqual([[button]]);
        });

        it('moves the node to a new host ref', () => {
            const firstHostRef = vi.fn();
            const nextHostRef = vi.fn();
            const ui = (hostRef: Ref<HTMLButtonElement>) => (
                <Host
                    render={adaptRenderElement(<Target className={() => 'on'} />)}
                    hostProps={{ ref: hostRef }}
                />
            );
            const rendered = render(ui(firstHostRef));

            rendered.rerender(ui(nextHostRef));

            const button = rendered.getByRole('button');

            expect(firstHostRef.mock.calls).toEqual([[button], [null]]);
            expect(nextHostRef.mock.calls).toEqual([[button]]);
        });

        it('detaches both refs on unmount', () => {
            const hostRef = createRef<HTMLButtonElement>();
            const elementRef = createRef<HTMLButtonElement>();
            const rendered = render(
                <Host
                    render={adaptRenderElement(<Target ref={elementRef} className={() => 'on'} />)}
                    hostProps={{ ref: hostRef }}
                />,
            );

            rendered.unmount();

            expect(hostRef.current).toBeNull();
            expect(elementRef.current).toBeNull();
        });
    });
});
