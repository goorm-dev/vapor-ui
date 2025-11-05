import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Pagination } from '.';

describe('<Pagination />', () => {
    afterEach(cleanup);

    it('should have no accessibility violations', async () => {
        const rendered = render(
            <Pagination.Root totalPages={10} defaultPage={1}>
                <Pagination.List>
                    <Pagination.Item>
                        <Pagination.Previous />
                    </Pagination.Item>
                    <Pagination.Items />
                    <Pagination.Item>
                        <Pagination.Next />
                    </Pagination.Item>
                </Pagination.List>
            </Pagination.Root>,
        );

        const results = await axe(rendered.container);
        expect(results).toHaveNoViolations();
    });

    describe('keyboard navigation', () => {
        it('should focus the Previous button when tabbing from outside the component', async () => {
            const rendered = render(
                <Pagination.Root totalPages={10} defaultPage={1}>
                    <Pagination.List>
                        <Pagination.Item>
                            <Pagination.Previous />
                        </Pagination.Item>
                        <Pagination.Items />
                        <Pagination.Item>
                            <Pagination.Next />
                        </Pagination.Item>
                    </Pagination.List>
                </Pagination.Root>,
            );

            const [previous] = rendered.getAllByRole('button');

            await userEvent.tab();

            expect(previous).toHaveFocus();
        });
    });
});
