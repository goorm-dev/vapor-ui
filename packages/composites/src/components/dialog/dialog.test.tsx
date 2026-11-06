import { createRef } from 'react';
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Dialog } from '.';

describe('Dialog composite — DOM API', () => {
    afterEach(cleanup);

    const renderOpen = async (
        extraProps: Partial<React.ComponentProps<typeof Dialog.Root>> = {},
        action?: React.ReactNode,
    ) => {
        const rendered = render(
            <Dialog.Root
                title="타이틀"
                description="본문"
                trigger={<button type="button">열기</button>}
                ariaLabels={{ close: '닫기' }}
                action={action}
                {...extraProps}
            >
                바디
            </Dialog.Root>,
        );

        await userEvent.click(rendered.getByText('열기'));

        return rendered;
    };

    it('forwards ref to the Popup DOM node', async () => {
        const ref = createRef<HTMLDivElement>();
        const rendered = await renderOpen({ ref });

        const dialog = rendered.getByRole('dialog');
        expect(ref.current).toBe(dialog);
    });

    it('applies id to the Popup DOM node', async () => {
        const rendered = await renderOpen({ id: 'my-dialog' });
        expect(rendered.getByRole('dialog').id).toBe('my-dialog');
    });

    it('merges className onto the Popup DOM node without replacing core classes', async () => {
        const rendered = await renderOpen({ className: 'custom-popup' });
        const dialog = rendered.getByRole('dialog');

        expect(dialog).toHaveClass('custom-popup');
        expect(dialog.className.split(/\s+/).length).toBeGreaterThan(1);
    });

    it('forwards ref/id/className on Dialog.Action', async () => {
        const ref = createRef<HTMLButtonElement>();
        await renderOpen(
            {},
            <Dialog.Action
                ref={ref as unknown as React.Ref<HTMLElement>}
                id="action-btn"
                className="action-custom"
            >
                확인
            </Dialog.Action>,
        );

        const button = ref.current as unknown as HTMLButtonElement | null;
        expect(button).not.toBeNull();
        expect(button?.id).toBe('action-btn');
        expect(button?.className).toContain('action-custom');
    });
});
