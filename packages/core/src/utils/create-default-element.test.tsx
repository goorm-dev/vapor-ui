import type { ComponentProps, HTMLAttributes } from 'react';
import { createRef, forwardRef } from 'react';

import { cleanup, render } from '@testing-library/react';

import { createDefaultElement } from './create-default-element';

describe('createDefaultElement', () => {
    afterEach(cleanup);

    it('returns as is if not a ReactElement', () => {
        expect(createDefaultElement('text')).toBe('text');
        expect(createDefaultElement(123)).toBe(123);
        expect(createDefaultElement(null)).toBe(null);
        expect(createDefaultElement(undefined)).toBe(undefined);
        expect(createDefaultElement(true)).toBe(true);
    });

    it('clones using cloneElement if ReactElement', () => {
        const original = <div data-testid="test" />;
        const result = createDefaultElement(original);

        expect(result).not.toBe(original);
        const { getByTestId } = render(<>{result}</>);
        expect(getByTestId('test')).toBeInTheDocument();
    });

    describe('props', () => {
        it('applies defaultProps', () => {
            const original = <div data-testid="test" />;
            const result = createDefaultElement(original, {
                'aria-hidden': true,
                className: 'default-class',
            } as HTMLAttributes<HTMLDivElement>);

            const { getByTestId } = render(<>{result}</>);
            const element = getByTestId('test');

            expect(element).toHaveAttribute('aria-hidden', 'true');
            expect(element).toHaveClass('default-class');
        });

        it('mergeProps merges className and defaultProps take precedence', () => {
            const original = (
                <div data-testid="test" className="child-class" aria-label="child-label" />
            );
            const result = createDefaultElement(original, {
                className: 'default-class',
                'aria-label': 'default-label',
            } as HTMLAttributes<HTMLDivElement>);

            const rendered = render(<>{result}</>);
            const element = rendered.getByTestId('test');

            expect(element).toHaveClass('child-class');
            expect(element).toHaveClass('default-class');
            expect(element).toHaveAttribute('aria-label', 'child-label');
        });

        it('only props not in children are added from defaultProps', () => {
            const original = <div data-testid="test" className="child-class" />;
            const result = createDefaultElement(original, {
                'aria-hidden': true,
                'aria-label': 'default-label',
            } as HTMLAttributes<HTMLDivElement>);

            const { getByTestId } = render(<>{result}</>);
            const element = getByTestId('test');

            expect(element).toHaveClass('child-class');
            expect(element).toHaveAttribute('aria-hidden', 'true');
            expect(element).toHaveAttribute('aria-label', 'default-label');
        });
    });

    describe('ref', () => {
        it('keeps ref of children', () => {
            const ref = createRef<HTMLButtonElement>();
            const original = <button ref={ref} data-testid="test" />;
            const result = createDefaultElement(original);

            render(<>{result}</>);

            expect(ref.current).toBeInstanceOf(HTMLButtonElement);
            expect(ref.current).toHaveAttribute('data-testid', 'test');
        });

        it('keeps ref of forwardRef component', () => {
            const TestComponent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
                (props, ref) => <div ref={ref} {...props} />,
            );

            const ref = createRef<HTMLDivElement>();
            const original = <TestComponent ref={ref} data-testid="test" />;
            const result = createDefaultElement(original);

            render(<>{result}</>);

            expect(ref.current).toBeInstanceOf(HTMLDivElement);
        });
    });

    describe('event handler', () => {
        it('both event handlers in defaultProps and children are called', async () => {
            const defaultOnClick = vi.fn();
            const childOnClick = vi.fn();

            const original = (
                <button data-testid="btn" onClick={childOnClick}>
                    Click
                </button>
            );
            const result = createDefaultElement(original, {
                onClick: defaultOnClick,
            } as HTMLAttributes<HTMLButtonElement>);

            const { getByTestId } = render(<>{result}</>);
            const button = getByTestId('btn');

            button.click();

            // mergeProps는 두 핸들러를 모두 호출
            expect(childOnClick).toHaveBeenCalledTimes(1);
            expect(defaultOnClick).toHaveBeenCalledTimes(1);
        });
    });

    describe('type', () => {
        it('generic type is applied correctly', () => {
            interface CustomProps {
                customProp?: string;
                'data-testid'?: string;
            }

            const CustomComponent = (props: CustomProps) => (
                <div data-testid={props['data-testid']}>{props.customProp}</div>
            );

            const original = <CustomComponent data-testid="custom" />;
            const result = createDefaultElement<CustomProps>(original, {
                customProp: 'default-value',
            });

            const { getByTestId } = render(<>{result}</>);
            expect(getByTestId('custom')).toHaveTextContent('default-value');
        });

        it('applies defaultProps to SVG element', () => {
            const original = <TestIcon data-testid="icon" />;
            const result = createDefaultElement<ComponentProps<'svg'>>(original, {
                'aria-hidden': true,
                width: 24,
                height: 24,
            });

            const { getByTestId } = render(<>{result}</>);
            const svg = getByTestId('icon');

            expect(svg).toHaveAttribute('aria-hidden', 'true');
            expect(svg).toHaveAttribute('width', '24');
            expect(svg).toHaveAttribute('height', '24');
        });

        it('defaultProps take precedence over children props', () => {
            const original = <TestIcon data-testid="icon" width={16} height={16} />;
            const result = createDefaultElement(original, {
                width: 24,
                height: 24,
            } as ComponentProps<'svg'>);

            const { getByTestId } = render(<>{result}</>);
            const svg = getByTestId('icon');

            // mergeProps의 두번째 인자(defaultProps)가 우선
            expect(svg).toHaveAttribute('width', '16');
            expect(svg).toHaveAttribute('height', '16');
        });
    });
});

const TestIcon = (props: ComponentProps<'svg'>) => (
    <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" {...props}>
        <circle cx="8" cy="8" r="8" />
    </svg>
);
