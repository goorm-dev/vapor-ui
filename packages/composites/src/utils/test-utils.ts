import type { Ref } from 'react';
import { createRef } from 'react';

type ConformanceElement<T extends HTMLElement> = (props: {
    ref: Ref<T>;
    id: string;
    className: string;
}) => Promise<{ node: HTMLElement }>;

interface ConformanceOptions<T extends HTMLElement> {
    refInstanceof: abstract new (...args: unknown[]) => T;
}

const TEST_ID = 'composite-test-id';
const TEST_CLASS = 'composite-test-class';

/**
 * Composites 컴포넌트가 `ref` / `id` / `className` 세 가지 DOM API를 올바르게 노출하는지 검증한다.
 * 유틸 자체는 `it` 세 개를 `describe('DOM API conformance')` 아래 등록한다.
 * 상위 `describe` 블록과 `afterEach(cleanup)`은 소비자가 래핑한다.
 *
 * @example
 * describe('Dialog.Root', () => {
 *     afterEach(cleanup);
 *     testConformance<HTMLDivElement>(
 *         async ({ ref, id, className }) => {
 *             const rendered = render(
 *                 <Dialog.Root ... ref={ref} id={id} className={className}>바디</Dialog.Root>,
 *             );
 *             await userEvent.click(rendered.getByText('열기'));
 *             return { node: rendered.getByRole('dialog') };
 *         },
 *         { refInstanceof: HTMLDivElement },
 *     );
 * });
 */
export const testConformance = <T extends HTMLElement>(
    render: ConformanceElement<T>,
    options: ConformanceOptions<T>,
) => {
    describe('DOM API conformance', () => {
        it('forwards ref to the DOM node', async () => {
            const ref = createRef<T>();
            const { node } = await render({ ref, id: TEST_ID, className: TEST_CLASS });

            expect(ref.current).toBe(node);
            expect(ref.current).toBeInstanceOf(options.refInstanceof);
        });

        it('applies id to the DOM node', async () => {
            const ref = createRef<T>();
            const { node } = await render({ ref, id: TEST_ID, className: TEST_CLASS });

            expect(node.id).toBe(TEST_ID);
        });

        it('applies className to the DOM node', async () => {
            const ref = createRef<T>();
            const { node } = await render({ ref, id: TEST_ID, className: TEST_CLASS });

            expect(node).toHaveClass(TEST_CLASS);
        });
    });
};
