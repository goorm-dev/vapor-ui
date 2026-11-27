import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { testConformance } from '~/utils/test-utils';

import { Menu } from '.';

describe('Menu.Root', () => {
    afterEach(cleanup);

    testConformance<HTMLDivElement>(
        async ({ ref, id, className, style }) => {
            const rendered = render(
                <Menu.Root
                    ref={ref}
                    id={id}
                    trigger={<button type="button">열기</button>}
                    className={className}
                    style={style}
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
        async ({ ref, id, className, style }) => {
            const rendered = render(
                <Menu.Root trigger={<button type="button">열기</button>}>
                    <Menu.Item
                        ref={ref}
                        id={id}
                        className={className}
                        style={style}
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
        async ({ ref, id, className, style }) => {
            const rendered = render(
                <Menu.Root trigger={<button type="button">열기</button>}>
                    <Menu.Group ref={ref} id={id} className={className} style={style} label="그룹">
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

describe('Menu.SubmenuItem', () => {
    afterEach(cleanup);

    testConformance<HTMLDivElement>(
        async ({ ref, id, className, style }) => {
            const rendered = render(
                <Menu.Root trigger={<button type="button">열기</button>}>
                    <Menu.Root
                        trigger={
                            <Menu.SubmenuItem
                                ref={ref}
                                id={id}
                                className={className}
                                style={style}
                                label="더보기"
                            />
                        }
                    >
                        <Menu.Item label="A" onClick={() => {}} />
                    </Menu.Root>
                </Menu.Root>,
            );
            await userEvent.click(rendered.getByText('열기'));

            return { node: rendered.getByRole('menuitem', { name: /더보기/ }) };
        },
        { refInstanceof: HTMLDivElement },
    );
});

describe('Menu.CheckGroup', () => {
    afterEach(cleanup);

    describe.each(['single', 'multiple'] as const)('%s', (mode) => {
        testConformance<HTMLDivElement>(
            async ({ ref, id, className, style }) => {
                const rendered = render(
                    <Menu.Root trigger={<button type="button">열기</button>}>
                        <Menu.CheckGroup
                            mode={mode}
                            ref={ref}
                            id={id}
                            className={className}
                            style={style}
                            label="그룹"
                        >
                            <Menu.CheckItem value="a" label="A" />
                        </Menu.CheckGroup>
                    </Menu.Root>,
                );
                await userEvent.click(rendered.getByText('열기'));

                return { node: rendered.getByRole('group') };
            },
            { refInstanceof: HTMLDivElement },
        );
    });
});

describe('Menu.CheckItem', () => {
    afterEach(cleanup);

    describe.each([
        { mode: 'single', role: 'menuitemradio' },
        { mode: 'multiple', role: 'menuitemcheckbox' },
    ] as const)('$mode', ({ mode, role }) => {
        testConformance<HTMLDivElement>(
            async ({ ref, id, className, style }) => {
                const rendered = render(
                    <Menu.Root trigger={<button type="button">열기</button>}>
                        <Menu.CheckGroup mode={mode} label="그룹">
                            <Menu.CheckItem
                                ref={ref}
                                id={id}
                                className={className}
                                style={style}
                                value="a"
                                label="A"
                            />
                        </Menu.CheckGroup>
                    </Menu.Root>,
                );
                await userEvent.click(rendered.getByText('열기'));

                return { node: rendered.getByRole(role) };
            },
            { refInstanceof: HTMLDivElement },
        );
    });
});
