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
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {data.map((item) => (
                    <Table.Row key={item.id}>
                        <Table.Heading>{item.name}</Table.Heading>
                        <Table.Cell>{item.type}</Table.Cell>
                        <Table.Cell>
                            <time dateTime={item.updatedAt.toString()}>{item.updatedAt}</time>
                        </Table.Cell>
                    </Table.Row>
                ))}
            </Table.Body>
        </Table.Root>
    ),
};

const now = Date.now();
const Second = 1000;
const Minute = 60 * Second;
const Hour = 60 * Minute;
const Day = 24 * Hour;
const Week = 7 * Day;
const Month = 4 * Week;

type Data = {
    id: number;
    name: string;
    type: 'Public' | 'Internal';
    updatedAt: number;
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
        updatedAt: now,
        securityFeatures: {
            dependabot: 'Alerts',
            codeScanning: 'Report secrets',
        },
    },
    {
        id: 2,
        name: 'aegir',
        type: 'Public',
        updatedAt: now - 5 * Minute,
        securityFeatures: {
            dependabot: 'Alerts',
            codeScanning: 'Report secrets',
        },
    },
    {
        id: 3,
        name: 'strapi',
        type: 'Public',
        updatedAt: now - 1 * Hour,
        securityFeatures: {
            dependabot: '',
            codeScanning: '',
        },
    },
    {
        id: 4,
        name: 'codeql-ci-nightlies',
        type: 'Public',
        updatedAt: now - 6 * Hour,
        securityFeatures: {
            dependabot: 'Alerts',
            codeScanning: '',
        },
    },
    {
        id: 5,
        name: 'dependabot-updates',
        type: 'Public',
        updatedAt: now - 1 * Day,
        securityFeatures: {
            dependabot: '',
            codeScanning: '',
        },
    },
    {
        id: 6,
        name: 'tsx-create-react-app',
        type: 'Public',
        updatedAt: now - 1 * Week,
        securityFeatures: {
            dependabot: '',
            codeScanning: '',
        },
    },
    {
        id: 7,
        name: 'bootstrap',
        type: 'Public',
        updatedAt: now - 1 * Month,
        securityFeatures: { dependabot: 'Alerts', codeScanning: '' },
    },
    {
        id: 8,
        name: 'docker-templates',
        type: 'Public',
        updatedAt: now - 3 * Month,
        securityFeatures: {
            dependabot: 'Alerts',
            codeScanning: '',
        },
    },
];
