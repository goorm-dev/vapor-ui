import { Table, Text } from '@vapor-ui/core';

export default function AnatomyTable() {
    return (
        <Table.Root data-part="Root" width="100%">
            <Table.ColumnGroup data-part="ColumnGroup">
                <Table.Column data-part="Column" />
                <Table.Column />
            </Table.ColumnGroup>
            <Table.Header data-part="Header">
                <Table.Row data-part="Row">
                    <Table.Heading data-part="Heading">Name</Table.Heading>
                    <Table.Heading>Role</Table.Heading>
                </Table.Row>
            </Table.Header>
            <Table.Body data-part="Body">
                <Table.Row>
                    <Table.Cell data-part="Cell">Olivia Park</Table.Cell>
                    <Table.Cell>Designer</Table.Cell>
                </Table.Row>
                <Table.Row>
                    <Table.Cell>Ethan Kim</Table.Cell>
                    <Table.Cell>Developer</Table.Cell>
                </Table.Row>
            </Table.Body>
            <Table.Footer data-part="Footer">
                <Table.Row>
                    <Table.Cell colSpan={2}>
                        <Text typography="body3" foreground="hint-100">
                            2 members total
                        </Text>
                    </Table.Cell>
                </Table.Row>
            </Table.Footer>
        </Table.Root>
    );
}
