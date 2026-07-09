import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    CloseOutlineIcon,
    FilterOutlineIcon,
    LockOutlineIcon,
    MailOutlineIcon,
    SearchOutlineIcon,
    ViewOnOutlineIcon,
} from '@vapor-ui/icons';

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

export const Default: Story = {
    args: { size: 'md' },
    render: (args) => (
        <InputGroup.Root {...args}>
            <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
            <TextInput placeholder="username" />
            <InputGroup.TrailingAddon>
                <IconButton aria-label="clear" size={args.size} variant="ghost">
                    <CloseOutlineIcon />
                </IconButton>
            </InputGroup.TrailingAddon>
        </InputGroup.Root>
    ),
};

const SIZES = ['sm', 'md', 'lg', 'xl'] as const;

export const TestBed: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
            {/* sizes */}
            {SIZES.map((size) => (
                <InputGroup.Root key={size} size={size}>
                    <InputGroup.LeadingAddon>
                        <MailOutlineIcon />
                    </InputGroup.LeadingAddon>
                    <TextInput placeholder={size} />
                </InputGroup.Root>
            ))}

            {/* addon 조합: leading / trailing / both / label / iconButton */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>https://</InputGroup.LeadingAddon>
                <TextInput placeholder="leading label" />
            </InputGroup.Root>

            <InputGroup.Root>
                <TextInput placeholder="trailing iconButton" />
                <InputGroup.TrailingAddon>
                    <IconButton aria-label="search" variant="ghost">
                        <SearchOutlineIcon />
                    </IconButton>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            <InputGroup.Root>
                <InputGroup.LeadingAddon>
                    <SearchOutlineIcon />
                </InputGroup.LeadingAddon>
                <TextInput placeholder="icon + label" />
                <InputGroup.TrailingAddon>.com</InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* 한 addon 에 여러 요소 — 요소 사이 간격 유지(sm/md/lg 8px, xl 12px) */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>
                    <LockOutlineIcon />
                </InputGroup.LeadingAddon>
                <TextInput type="password" placeholder="multiple trailing elements" />
                <InputGroup.TrailingAddon>
                    <IconButton aria-label="Toggle visibility" variant="ghost">
                        <ViewOnOutlineIcon />
                    </IconButton>
                    <IconButton aria-label="Filter" variant="ghost">
                        <FilterOutlineIcon />
                    </IconButton>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* states */}
            <InputGroup.Root invalid>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <TextInput placeholder="invalid" invalid />
            </InputGroup.Root>

            <InputGroup.Root disabled>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <TextInput placeholder="disabled" disabled />
            </InputGroup.Root>

            <InputGroup.Root readOnly>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <TextInput readOnly value="read only" />
            </InputGroup.Root>

            {/* Field 검증 — aria-invalid 를 :has 로 잡아 테두리 danger */}
            <Field.Root validate={(value) => (value ? null : '값을 입력하세요')}>
                <Field.Label>Email</Field.Label>
                <InputGroup.Root>
                    <InputGroup.LeadingAddon>
                        <MailOutlineIcon />
                    </InputGroup.LeadingAddon>
                    <TextInput placeholder="you@example.com" />
                </InputGroup.Root>
                <Field.Error />
            </Field.Root>
        </div>
    ),
};
