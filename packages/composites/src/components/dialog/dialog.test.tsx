import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { testConformance } from '~/utils/test-utils';

import { Dialog } from '.';

describe('Dialog.Root', () => {
    afterEach(cleanup);

    testConformance<HTMLDivElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <Dialog.Root
                    ref={ref}
                    id={id}
                    ariaLabels={{ close: '닫기' }}
                    title="타이틀"
                    description="본문"
                    trigger={<button type="button">열기</button>}
                    className={className}
                >
                    바디
                </Dialog.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByRole('dialog') };
        },
        { refInstanceof: HTMLDivElement },
    );
});

describe('Dialog.Action', () => {
    afterEach(cleanup);

    testConformance<HTMLButtonElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <Dialog.Root
                    title="타이틀"
                    description="본문"
                    trigger={<button type="button">열기</button>}
                    ariaLabels={{ close: '닫기' }}
                    action={
                        <Dialog.Action ref={ref} id={id} className={className}>
                            확인
                        </Dialog.Action>
                    }
                >
                    바디
                </Dialog.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByText('확인') };
        },
        { refInstanceof: HTMLButtonElement },
    );
});

describe('Dialog.Assistive', () => {
    afterEach(cleanup);

    testConformance<HTMLButtonElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <Dialog.Root
                    title="타이틀"
                    description="본문"
                    trigger={<button type="button">열기</button>}
                    ariaLabels={{ close: '닫기' }}
                    assistive={
                        <Dialog.Assistive ref={ref} id={id} className={className}>
                            취소
                        </Dialog.Assistive>
                    }
                >
                    바디
                </Dialog.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByText('취소') };
        },
        { refInstanceof: HTMLButtonElement },
    );
});
