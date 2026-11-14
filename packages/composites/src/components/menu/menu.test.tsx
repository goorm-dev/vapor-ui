import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { testConformance } from '~/utils/test-utils';

import { Menu } from '.';

describe('Menu.Root', () => {
    afterEach(cleanup);

    testConformance<HTMLDivElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <Menu.Root
                    ref={ref}
                    id={id}
                    trigger={<button type="button">열기</button>}
                    className={className}
                >
                    <Menu.Item label="사본" onClick={() => {}} />
                </Menu.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByRole('menu') };
        },
        { refInstanceof: HTMLDivElement },
    );
});

describe('Menu.Item', () => {
    afterEach(cleanup);

    testConformance<HTMLDivElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <Menu.Root trigger={<button type="button">열기</button>}>
                    <Menu.Item
                        ref={ref}
                        id={id}
                        className={className}
                        label="사본"
                        onClick={() => {}}
                    />
                </Menu.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByRole('menuitem') };
        },
        { refInstanceof: HTMLDivElement },
    );
});

describe('Menu.Group', () => {
    afterEach(cleanup);

    testConformance<HTMLDivElement>(
        async ({ ref, id, className }) => {
            const rendered = render(
                <Menu.Root trigger={<button type="button">열기</button>}>
                    <Menu.Group ref={ref} id={id} className={className} label="그룹">
                        <Menu.Item label="A" onClick={() => {}} />
                    </Menu.Group>
                </Menu.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByRole('group') };
        },
        { refInstanceof: HTMLDivElement },
    );
});
