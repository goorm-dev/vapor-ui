import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { testConformance } from '~/utils/test-utils';

import { AlertDialog } from '.';

describe('AlertDialog.Root', () => {
    afterEach(cleanup);

    testConformance<HTMLDivElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <AlertDialog.Root
                    type="critical"
                    title="타이틀"
                    description="본문"
                    trigger={<button type="button">열기</button>}
                    cancel={<AlertDialog.Cancel>취소</AlertDialog.Cancel>}
                    action={<AlertDialog.Action>확인</AlertDialog.Action>}
                    ref={ref}
                    id={id}
                    className={className}
                >
                    바디
                </AlertDialog.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByRole('alertdialog') };
        },
        { refInstanceof: HTMLDivElement },
    );
});

describe('AlertDialog.Action', () => {
    afterEach(cleanup);

    testConformance<HTMLButtonElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <AlertDialog.Root
                    type="critical"
                    title="타이틀"
                    description="본문"
                    trigger={<button type="button">열기</button>}
                    cancel={<AlertDialog.Cancel>취소</AlertDialog.Cancel>}
                    action={
                        <AlertDialog.Action ref={ref} id={id} className={className}>
                            확인
                        </AlertDialog.Action>
                    }
                >
                    바디
                </AlertDialog.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByText('확인') };
        },
        { refInstanceof: HTMLButtonElement },
    );
});

describe('AlertDialog.Cancel', () => {
    afterEach(cleanup);

    testConformance<HTMLButtonElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <AlertDialog.Root
                    type="critical"
                    title="타이틀"
                    description="본문"
                    trigger={<button type="button">열기</button>}
                    action={<AlertDialog.Action>확인</AlertDialog.Action>}
                    cancel={
                        <AlertDialog.Cancel ref={ref} id={id} className={className}>
                            취소
                        </AlertDialog.Cancel>
                    }
                >
                    바디
                </AlertDialog.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByText('취소') };
        },
        { refInstanceof: HTMLButtonElement },
    );
});
