import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Mock } from 'vitest';
import { axe } from 'vitest-axe';

import { Toolbar } from '.';
import { Toggle } from '../toggle';

const INPUT_PLACEHOLDER = 'Search';

const ToolbarTest = (props: Toolbar.Root.Props) => (
    <Toolbar.Root {...props}>
        <Toolbar.Button>Bold</Toolbar.Button>
        <Toolbar.Button>Italic</Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Group>
            <Toolbar.Button>Left</Toolbar.Button>
            <Toolbar.Button>Right</Toolbar.Button>
        </Toolbar.Group>
        <Toolbar.Separator />
        <Toolbar.Input placeholder={INPUT_PLACEHOLDER} />
    </Toolbar.Root>
);

describe('<Toolbar.Root />', () => {
    it('should have no a11y violations', async () => {
        const rendered = render(<ToolbarTest />);
        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });

    it('should force `aria-orientation="horizontal"`', () => {
        const rendered = render(<ToolbarTest />);
        const root = rendered.getByRole('toolbar');

        expect(root).toHaveAttribute('aria-orientation', 'horizontal');
    });

    it('should forward `aria-label` to the root', () => {
        const ARIA_LABEL = 'Formatting toolbar';
        const rendered = render(<ToolbarTest aria-label={ARIA_LABEL} />);
        const root = rendered.getByRole('toolbar');

        expect(root).toHaveAttribute('aria-label', ARIA_LABEL);
    });

    describe('keyboard navigation', () => {
        it('should move focus between buttons via ArrowRight/ArrowLeft', async () => {
            const rendered = render(
                <Toolbar.Root>
                    <Toolbar.Button>One</Toolbar.Button>
                    <Toolbar.Button>Two</Toolbar.Button>
                    <Toolbar.Button>Three</Toolbar.Button>
                </Toolbar.Root>,
            );
            const first = rendered.getByRole('button', { name: 'One' });
            const second = rendered.getByRole('button', { name: 'Two' });
            const third = rendered.getByRole('button', { name: 'Three' });

            await userEvent.tab();
            expect(first).toHaveFocus();

            await userEvent.keyboard('{ArrowRight}');
            expect(second).toHaveFocus();

            await userEvent.keyboard('{ArrowRight}');
            expect(third).toHaveFocus();

            await userEvent.keyboard('{ArrowLeft}');
            expect(second).toHaveFocus();
        });

        it('should wrap focus from last to first on ArrowRight', async () => {
            const rendered = render(
                <Toolbar.Root>
                    <Toolbar.Button>One</Toolbar.Button>
                    <Toolbar.Button>Two</Toolbar.Button>
                </Toolbar.Root>,
            );
            const first = rendered.getByRole('button', { name: 'One' });
            const second = rendered.getByRole('button', { name: 'Two' });

            await userEvent.tab();
            expect(first).toHaveFocus();

            await userEvent.keyboard('{ArrowRight}');
            expect(second).toHaveFocus();

            await userEvent.keyboard('{ArrowRight}');
            expect(first).toHaveFocus();
        });
    });
});

describe('<Toolbar.Button />', () => {
    it('should invoke the `onClick` handler when clicked', async () => {
        const onClick: Mock = vi.fn();
        const rendered = render(
            <Toolbar.Root>
                <Toolbar.Button onClick={onClick}>Bold</Toolbar.Button>
            </Toolbar.Root>,
        );
        const button = rendered.getByRole('button', { name: 'Bold' });

        await userEvent.click(button);

        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('should not invoke the `onClick` handler when disabled', async () => {
        const onClick: Mock = vi.fn();
        const rendered = render(
            <Toolbar.Root>
                <Toolbar.Button disabled onClick={onClick}>
                    Bold
                </Toolbar.Button>
            </Toolbar.Root>,
        );
        const button = rendered.getByRole('button', { name: 'Bold' });

        await userEvent.click(button);

        expect(onClick).not.toHaveBeenCalled();
        expect(button).toHaveAttribute('aria-disabled', 'true');
        expect(button).toHaveAttribute('data-disabled', '');
    });

    it('should use the `render` prop to swap the underlying element', async () => {
        const onPressedChange: Mock = vi.fn();
        const rendered = render(
            <Toolbar.Root>
                <Toolbar.Button render={<Toggle onPressedChange={onPressedChange} />}>
                    Bold
                </Toolbar.Button>
            </Toolbar.Root>,
        );
        const toggle = rendered.getByRole('button', { name: 'Bold' });

        expect(toggle).toHaveAttribute('aria-pressed', 'false');

        await userEvent.click(toggle);

        expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything());
        expect(toggle).toHaveAttribute('aria-pressed', 'true');
    });
});

describe('<Toolbar.Input />', () => {
    it('should accept typing', async () => {
        const rendered = render(
            <Toolbar.Root>
                <Toolbar.Input placeholder={INPUT_PLACEHOLDER} />
            </Toolbar.Root>,
        );
        const input = rendered.getByPlaceholderText(INPUT_PLACEHOLDER) as HTMLInputElement;

        await userEvent.click(input);
        await userEvent.keyboard('hello');

        expect(input.value).toBe('hello');
    });

    it('should receive focus via roving tabindex from the toolbar', async () => {
        const rendered = render(
            <Toolbar.Root>
                <Toolbar.Button>Bold</Toolbar.Button>
                <Toolbar.Input placeholder={INPUT_PLACEHOLDER} />
            </Toolbar.Root>,
        );
        const button = rendered.getByRole('button', { name: 'Bold' });
        const input = rendered.getByPlaceholderText(INPUT_PLACEHOLDER);

        await userEvent.tab();
        expect(button).toHaveFocus();

        await userEvent.keyboard('{ArrowRight}');
        expect(input).toHaveFocus();
    });
});

describe('<Toolbar.Separator />', () => {
    it('should force `aria-orientation="vertical"`', () => {
        const rendered = render(
            <Toolbar.Root>
                <Toolbar.Button>A</Toolbar.Button>
                <Toolbar.Separator />
                <Toolbar.Button>B</Toolbar.Button>
            </Toolbar.Root>,
        );
        const separator = rendered.getByRole('separator');

        expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    });
});
