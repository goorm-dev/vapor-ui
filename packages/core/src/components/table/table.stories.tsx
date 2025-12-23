import type { Meta, StoryObj } from '@storybook/react-vite';

import { Table } from '.';

export default {
    title: 'Table',
    component: Table.Root,
} satisfies Meta<typeof Table.Root>;

export const Default: StoryObj<typeof Table.Root> = {
    render: () => (
        <Table.Root>
            <Table.ColumnGroup>
                <Table.Column />
                <Table.Column />
                <Table.Column />
            </Table.ColumnGroup>

            <Table.Header>
                <Table.Row>
                    <Table.Heading>Header 1</Table.Heading>
                    <Table.Heading>Header 2</Table.Heading>
                    <Table.Heading>Header 3</Table.Heading>
                    <Table.Heading>Header 4</Table.Heading>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map((item) => (
                    <Table.Row key={item.id}>
                        <Table.Heading>{item.name}</Table.Heading>
                        <Table.Cell>{item.type}</Table.Cell>
                        <Table.Cell>{item.securityFeatures.dependabot || '-'}</Table.Cell>
                        <Table.Cell>{item.securityFeatures.codeScanning || '-'}</Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    ),
};

type Data = {
    id: number;
    name: string;
    type: 'Public' | 'Internal';
    securityFeatures: {
        dependabot: string;
        codeScanning: string;
    };
};

const data: Array<Data> = [
    {
        id: 1,
        name: 'codeql-dca-worker',
        type: 'Internal',
        securityFeatures: {
            dependabot: 'Alerts',
            codeScanning: 'Report secrets',
        },
    },
    {
        id: 2,
        name: 'aegir',
        type: 'Public',
        securityFeatures: {
            dependabot: 'Alerts',
            codeScanning: 'Report secrets',
        },
    },
    {
        id: 3,
        name: 'strapi',
        type: 'Public',
        securityFeatures: {
            dependabot: '',
            codeScanning: '',
        },
    },
    {
        id: 4,
        name: 'codeql-ci-nightlies',
        type: 'Public',
        securityFeatures: {
            dependabot: 'Alerts',
            codeScanning: '',
        },
    },
    {
        id: 5,
        name: 'dependabot-updates',
        type: 'Public',
        securityFeatures: {
            dependabot: '',
            codeScanning: '',
        },
    },
    {
        id: 6,
        name: 'tsx-create-react-app',
        type: 'Public',
        securityFeatures: {
            dependabot: '',
            codeScanning: '',
        },
    },
    {
        id: 7,
        name: 'bootstrap',
        type: 'Public',
        securityFeatures: { dependabot: 'Alerts', codeScanning: '' },
    },
    {
        id: 8,
        name: 'docker-templates',
        type: 'Public',
        securityFeatures: {
            dependabot: 'Alerts',
            codeScanning: '',
        },
    },
];

export const TestBed: StoryObj<typeof Table.Root> = Default;
