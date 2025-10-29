import { Badge, Card, Table } from '@vapor-ui/core';

const datas = [
    { name: 'Olivia Park', status: 'active', role: 'designer', 'last-active': '2 hours ago' },
    { name: 'Ethan Kim', status: 'active', role: 'developer', 'last-active': '3 days ago' },
    { name: 'Mia Choi', status: 'inactive', role: 'developer', 'last-active': '10 minutes ago' },
    { name: 'Noah Lee', status: 'active', role: 'designer', 'last-active': '1 day ago' },
    { name: 'Ava Jung', status: 'active', role: 'developer', 'last-active': '5 days ago' },
    { name: 'Liam Han', status: 'inactive', role: 'developer', 'last-active': '5 days ago' },
    { name: 'Emma Seo', status: 'active', role: 'designer', 'last-active': '7 days ago' },
    { name: 'Mason Yoo', status: 'active', role: 'designer', 'last-active': '30 minutes ago' },
    { name: 'Sophia Lim', status: 'inactive', role: 'designer', 'last-active': '4 hours ago' },
    { name: 'Lucas Park', status: 'active', role: 'developer', 'last-active': '1 hour ago' },
];

const activeness: Record<string, Badge.Props['color']> = {
    active: 'success',
    inactive: 'hint',
};

export default function Basic() {
    return (
        <Card.Root style={{ width: '100%' }}>
            <Card.Body style={{ padding: 0 }}>
                <Table.Root style={{ width: '100%' }}>
                    <Table.ColumnGroup>
                        <Table.Column width="20%" />
                        <Table.Column width="20%" />
                        <Table.Column width="30%" />
                        <Table.Column width="30%" />
                    </Table.ColumnGroup>
                    <Table.Header>
                        <Table.Row style={{ backgroundColor: 'var(--vapor-color-gray-050)' }}>
                            <Table.Heading>Name</Table.Heading>
                            <Table.Heading>Status</Table.Heading>
                            <Table.Heading>Role</Table.Heading>
                            <Table.Heading>Last Active</Table.Heading>
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>
                        {datas.map((data, index) => (
                            <Table.Row key={index}>
                                <Table.Cell>{data.name}</Table.Cell>
                                <Table.Cell>
                                    <Badge color={activeness[data.status]} shape="pill">
                                        {data.status.toUpperCase()}
                                    </Badge>
                                </Table.Cell>
                                <Table.Cell>{data.role}</Table.Cell>
                                <Table.Cell>{data['last-active']}</Table.Cell>
                            </Table.Row>
                        ))}
                    </Table.Body>
                </Table.Root>
            </Card.Body>
        </Card.Root>
    );
}
