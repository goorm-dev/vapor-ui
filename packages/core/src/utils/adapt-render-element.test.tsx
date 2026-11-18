import type { CSSProperties, ReactElement, Ref } from 'react';
import { Fragment, createRef } from 'react';

import { adaptRenderElement } from './adapt-render-element';

interface TargetState {
    disabled?: boolean;
}

interface TargetProps {
    ref?: Ref<HTMLButtonElement>;
    className?: string | ((state: TargetState) => string);
    style?: CSSProperties | ((state: TargetState) => CSSProperties);
    type?: 'button' | 'submit';
    onClick?: () => void;
}

const Target = (props: TargetProps) => {
    void props;

    return null;
};

type OutputProps = TargetProps & {
    ref: (node: HTMLButtonElement | null) => void;
    'data-host'?: string;
};
type RenderCallback = (props: Record<string, unknown>, state: object) => ReactElement<OutputProps>;

const callRender = (render: unknown, hostProps: Record<string, unknown>) => {
    expect(typeof render).toBe('function');

    return (render as RenderCallback)(hostProps, {}).props;
};

const asClassName = (value: OutputProps['className']) => value as (state: TargetState) => string;
const asStyle = (value: OutputProps['style']) => value as (state: TargetState) => CSSProperties;

describe('adaptRenderElement', () => {
    describe('given a render element without stateful callbacks', () => {
        it('returns the element as-is', () => {
            const element = <Target className="static" style={{ opacity: 1 }} />;

            expect(adaptRenderElement(element)).toBe(element);
        });
    });

    describe('given a non-element render', () => {
        it('returns undefined as-is', () => {
            expect(adaptRenderElement(undefined)).toBeUndefined();
        });

        it('returns a render function as-is', () => {
            const render = () => <Target />;

            expect(adaptRenderElement(render)).toBe(render);
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
            const render = adaptRenderElement(<Target className={className} />);
            const output = callRender(render, { className: 'host' });
            const merged = asClassName(output.className);

            expect(typeof merged).toBe('function');
            expect(merged({ disabled: false })).toBe('host on');
            expect(merged({ disabled: true })).toBe('host off');
        });

        it('passes the function through when the host has no className', () => {
            const render = adaptRenderElement(<Target className={className} />);
            const output = callRender(render, {});
            const merged = asClassName(output.className);

            expect(merged({ disabled: true })).toBe('off');
        });
    });

    describe('given a render element with a function style', () => {
        it('keeps the style a function and lays it over the host style', () => {
            const style = (state: TargetState) => ({ opacity: state.disabled ? 0.4 : 1 });
            const render = adaptRenderElement(<Target style={style} />);
            const output = callRender(render, { style: { color: 'red', opacity: 0 } });
            const merged = asStyle(output.style);

            expect(typeof merged).toBe('function');
            expect(merged({ disabled: true })).toEqual({ color: 'red', opacity: 0.4 });
        });
    });

    describe('merging the other props', () => {
        it('calls both the host and element event handlers', () => {
            const hostClick = vi.fn();
            const elementClick = vi.fn();
            const render = adaptRenderElement(
                <Target className={() => 'on'} onClick={elementClick} />,
            );
            const output = callRender(render, { onClick: hostClick });

            output.onClick?.();

            expect(hostClick).toHaveBeenCalledTimes(1);
            expect(elementClick).toHaveBeenCalledTimes(1);
        });

        it('lets element props override host props', () => {
            const render = adaptRenderElement(<Target className={() => 'on'} type="submit" />);
            const output = callRender(render, { type: 'button', 'data-host': '' });

            expect(output.type).toBe('submit');
            expect(output['data-host']).toBe('');
        });

        it('assigns the node to both the host ref and the element ref', () => {
            const hostRef = createRef<HTMLButtonElement>();
            const elementRef = createRef<HTMLButtonElement>();
            const node = document.createElement('button');
            const render = adaptRenderElement(<Target ref={elementRef} className={() => 'on'} />);
            const output = callRender(render, { ref: hostRef });

            output.ref(node);

            expect(hostRef.current).toBe(node);
            expect(elementRef.current).toBe(node);
        });
    });
});
