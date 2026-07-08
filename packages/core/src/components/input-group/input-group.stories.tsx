import type { Meta, StoryObj } from '@storybook/react-vite';

import { InputGroup } from '.';
import { Field } from '../field';
import { IconButton } from '../icon-button';
import { TextInput } from '../text-input';

const meta: Meta<typeof InputGroup.Root> = {
    title: 'InputGroup',
    component: InputGroup.Root,
    parameters: { layout: 'centered' },
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        disabled: { control: 'boolean' },
        invalid: { control: 'boolean' },
        readOnly: { control: 'boolean' },
    },
    tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const TestBed: Story = {
    args: { size: 'md' },
    render: (args) => (
        <InputGroup.Root {...args}>
            <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
            <TextInput placeholder="username" />
            <InputGroup.TrailingAddon>
                <IconButton aria-label="clear" size={args.size}>
                    ×
                </IconButton>
            </InputGroup.TrailingAddon>
        </InputGroup.Root>
    ),
};

/** disabled/invalid/readOnly 는 Root(시각) + 자식(기능) 양쪽에 명시적으로 지정한다. */
export const States: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 280 }}>
            <InputGroup.Root>
                <TextInput placeholder="default" />
            </InputGroup.Root>
            <InputGroup.Root invalid>
                <TextInput placeholder="invalid" invalid />
            </InputGroup.Root>
            <InputGroup.Root disabled>
                <TextInput placeholder="disabled" disabled />
            </InputGroup.Root>
            <InputGroup.Root readOnly>
                <TextInput placeholder="readOnly" readOnly value="read only" />
            </InputGroup.Root>
        </div>
    ),
};

/** Field 검증 실패 시 aria-invalid 가 자식에 붙고, Root 가 :has 로 잡아 테두리를 danger 로 만든다. */
export const WithField: Story = {
    render: () => (
        <Field.Root validate={(value) => (value ? null : '값을 입력하세요')} style={{ width: 280 }}>
            <Field.Label>Email</Field.Label>
            <InputGroup.Root>
                <InputGroup.LeadingAddon>✉</InputGroup.LeadingAddon>
                <TextInput placeholder="you@example.com" />
            </InputGroup.Root>
            <Field.Error />
        </Field.Root>
    ),
};
