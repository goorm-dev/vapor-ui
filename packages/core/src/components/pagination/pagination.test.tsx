import { useState } from 'react';

import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';

import { Pagination } from '.';

describe('<Pagination />', () => {
    afterEach(cleanup);

    it('should have no accessibility violations', async () => {
        const rendered = render(
            <Pagination.Root totalPages={10} defaultPage={1}>
                <Pagination.Previous />
                <Pagination.Items />
                <Pagination.Next />
            </Pagination.Root>,
        );

        const results = await axe(rendered.container);
        expect(results).toHaveNoViolations();
    });

    describe('keyboard navigation', () => {
        it('should focus the first page button when page is 1 and tabbing from outside the component', async () => {
            const rendered = render(
                <Pagination.Root totalPages={10} defaultPage={1}>
                    <Pagination.Previous />
                    <Pagination.Items />
                    <Pagination.Next />
                </Pagination.Root>,
            );

            const [previous, page1] = rendered.getAllByRole('button');

            await userEvent.tab();

            expect(previous).toBeDisabled();
            expect(page1).toHaveFocus();
        });

        it('should focus the previous button when page is not 1 and tabbing from outside the component', async () => {
            const rendered = render(
                <Pagination.Root totalPages={10} defaultPage={2}>
                    <Pagination.Previous />
                    <Pagination.Items />
                    <Pagination.Next />
                </Pagination.Root>,
            );

            const [previous] = rendered.getAllByRole('button');

            await userEvent.tab();

            expect(previous).toHaveFocus();
        });

        it('should change page when pressed Enter on a page number', async () => {
            const rendered = render(
                <Pagination.Root totalPages={10} defaultPage={1}>
                    <Pagination.Items />
                </Pagination.Root>,
            );

            const page5 = rendered.getByText('5');

            page5.focus();
            expect(page5).toHaveFocus();

            await userEvent.keyboard('[Enter]');

            expect(page5).toHaveAttribute('aria-current', 'page');
        });

        it('should change page when pressed Space on a page number', async () => {
            const rendered = render(
                <Pagination.Root totalPages={10} defaultPage={1}>
                    <Pagination.Items />
                </Pagination.Root>,
            );

            const page5 = rendered.getByText('5');

            page5.focus();
            expect(page5).toHaveFocus();

            await userEvent.keyboard('[Space]');

            expect(page5).toHaveAttribute('aria-current', 'page');
        });

        it('should change page when pressed previous button', async () => {
            let currentItem;

            const rendered = render(
                <Pagination.Root totalPages={3} defaultPage={3}>
                    <Pagination.Previous data-testid="Previous" />
                    <Pagination.Items />
                </Pagination.Root>,
            );

            const previous = rendered.getByTestId('Previous');
            previous.focus();

            await userEvent.keyboard('[Enter]');

            currentItem = rendered.getByText(2);
            expect(currentItem).toHaveAttribute('aria-current', 'page');

            await userEvent.keyboard('[Enter]');

            currentItem = rendered.getByText(1);
            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });

        it('should not change page when page is 1 and pressed previous button', async () => {
            const rendered = render(
                <Pagination.Root totalPages={3} defaultPage={2}>
                    <Pagination.Previous data-testid="Previous" />
                    <Pagination.Items />
                </Pagination.Root>,
            );

            const previous = rendered.getByTestId('Previous');
            previous.focus();

            await userEvent.keyboard('[Enter]');

            const currentItem = rendered.getByText(1);
            expect(currentItem).toHaveAttribute('aria-current', 'page');

            await userEvent.keyboard('[Enter]');

            expect(previous).toBeDisabled();
            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });

        it('should change page when pressed next button', async () => {
            const rendered = render(
                <Pagination.Root totalPages={3} defaultPage={2}>
                    <Pagination.Items />
                    <Pagination.Next data-testid="Next" />
                </Pagination.Root>,
            );

            const next = rendered.getByTestId('Next');
            next.focus();

            await userEvent.keyboard('[Enter]');

            const currentItem = rendered.getByText(3);
            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });

        it('should not change page when page is 1 and pressed next button', async () => {
            const rendered = render(
                <Pagination.Root totalPages={3} defaultPage={2}>
                    <Pagination.Items />
                    <Pagination.Next data-testid="Next" />
                </Pagination.Root>,
            );

            const next = rendered.getByTestId('Next');
            next.focus();

            await userEvent.keyboard('[Enter]');

            const currentItem = rendered.getByText(3);
            expect(currentItem).toHaveAttribute('aria-current', 'page');

            await userEvent.keyboard('[Enter]');

            expect(next).toBeDisabled();
            expect(currentItem).toHaveAttribute('aria-current', 'page');
        });
    });

    describe('prop: page', () => {
        it('should set the page when controlled', async () => {
            const onPageChange = vi.fn();
            const rendered = render(
                <ControlledPaginationTest totalPages={5} onPageChange={onPageChange} />,
            );

            const previous = rendered.getByTestId('Previous');
            const page3 = rendered.getByText('3');
            const next = rendered.getByTestId('Next');

            await userEvent.click(page3);
            expect(onPageChange).toHaveBeenLastCalledWith(3, expect.any(Object));

            await userEvent.click(previous);
            expect(onPageChange).toHaveBeenLastCalledWith(2, expect.any(Object));

            await userEvent.click(next);
            expect(onPageChange).toHaveBeenLastCalledWith(3, expect.any(Object));
        });
    });

    describe('prop: disabled', () => {
        it('should not respond to user interactions when disabled', async () => {
            const onPageChange = vi.fn();
            const rendered = render(
                <ControlledPaginationTest totalPages={5} disabled onPageChange={onPageChange} />,
            );

            const previous = rendered.getByTestId('Previous');
            const page3 = rendered.getByText('3');
            const next = rendered.getByTestId('Next');

            await userEvent.click(page3);
            expect(onPageChange).not.toHaveBeenCalled();

            await userEvent.click(previous);
            expect(onPageChange).not.toHaveBeenCalled();

            await userEvent.click(next);
            expect(onPageChange).not.toHaveBeenCalled();
        });
    });

    describe('prop: totalPages', () => {
        it('should render the correct number of pages', () => {
            const rendered = render(
                <Pagination.Root totalPages={20} defaultPage={1}>
                    <Pagination.Items />
                </Pagination.Root>,
            );

            const first = rendered.getAllByRole('button')[0];
            const last = rendered.getAllByRole('button').at(-1);

            expect(first).toHaveTextContent('1');
            expect(last).toHaveTextContent('20');
        });
    });

    describe('prop: siblingCount', () => {
        it('should render the correct number of sibling pages', () => {
            const rendered = render(
                <Pagination.Root totalPages={20} defaultPage={10} siblingCount={2}>
                    <Pagination.Items />
                </Pagination.Root>,
            );

            const buttons = rendered.getAllByRole('button');
            const pageNumbers = buttons.map((button) => button.textContent).filter(Boolean);

            expect(pageNumbers).toEqual(['1', '8', '9', '10', '11', '12', '20']);
        });
    });
});

const ControlledPaginationTest = ({ page: pageProp, ...props }: Pagination.Root.Props) => {
    const [page, setPage] = useState(pageProp);

    return (
        <Pagination.Root page={page} onPageChange={setPage} {...props}>
            <Pagination.Previous data-testid="Previous" />
            <Pagination.Items />
            <Pagination.Next data-testid="Next" />
        </Pagination.Root>
    );
};
