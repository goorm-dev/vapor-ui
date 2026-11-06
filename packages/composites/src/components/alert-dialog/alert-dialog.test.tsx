import { createRef } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { AlertDialog } from '.';

describe('AlertDialog composite — DOM API', () => {
    afterEach(cleanup);

    const renderOpen = async (
        extraProps: Partial<React.ComponentProps<typeof AlertDialog.Root>> = {},
        cancel?: React.ReactNode,
    ) => {
        const rendered = render(
            <AlertDialog.Root
                type="critical"
                title="타이틀"
                description="본문"
                trigger={<button type="button">열기</button>}
                cancel={cancel ?? <AlertDialog.Cancel>취소</AlertDialog.Cancel>}
                action={<AlertDialog.Action>확인</AlertDialog.Action>}
                {...extraProps}
            >
                바디
            </AlertDialog.Root>,
        );

        await userEvent.click(rendered.getByText('열기'));

        return rendered;
    };

    it('forwards ref to the Popup DOM node', async () => {
        const ref = createRef<HTMLDivElement>();
        const rendered = await renderOpen({ ref });

        const dialog = rendered.getByRole('alertdialog');
        expect(ref.current).toBe(dialog);
    });

    it('applies id to the Popup DOM node', async () => {
        const rendered = await renderOpen({ id: 'confirm-dialog' });
        expect(rendered.getByRole('alertdialog').id).toBe('confirm-dialog');
    });

    it('merges className onto the Popup DOM node', async () => {
        const rendered = await renderOpen({ className: 'custom-alert' });
        const dialog = rendered.getByRole('alertdialog');

        expect(dialog).toHaveClass('custom-alert');
        expect(dialog.className.split(/\s+/).length).toBeGreaterThan(1);
    });

    it('forwards ref/id/className on AlertDialog.Cancel', async () => {
        const ref = createRef<HTMLButtonElement>();
        await renderOpen(
            {},
            <AlertDialog.Cancel
                ref={ref as unknown as React.Ref<HTMLElement>}
                id="cancel-btn"
                className="cancel-custom"
            >
                취소
            </AlertDialog.Cancel>,
        );

        const button = ref.current as unknown as HTMLButtonElement | null;
        expect(button).not.toBeNull();
        expect(button?.id).toBe('cancel-btn');
        expect(button?.className).toContain('cancel-custom');
    });
});
