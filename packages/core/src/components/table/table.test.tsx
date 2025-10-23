import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';

import { Table } from '.';

describe('<Table.Root />', () => {
    it('should have no accessibility violations', async () => {
        const rendered = render(
            <Table.Root>
                <Table.Caption>Accessible Table</Table.Caption>
                <Table.ColumnGroup>
                    <Table.Column width="50%" />
                    <Table.Column width="30%" />
                    <Table.Column width="20%" />
                </Table.ColumnGroup>
                <Table.Header>
                    <Table.Row>
                        <Table.Heading>Header 1</Table.Heading>
                        <Table.Heading>Header 2</Table.Heading>
                        <Table.Heading>Header 3</Table.Heading>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    <Table.Row>
                        <Table.Cell>Row 1</Table.Cell>
                        <Table.Cell>Row 2</Table.Cell>
                        <Table.Cell>Row 3</Table.Cell>
                    </Table.Row>
                </Table.Body>
            </Table.Root>,
        );

        const result = await axe(rendered.container);

        expect(result).toHaveNoViolations();
    });
});
