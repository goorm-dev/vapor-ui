import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    CloseOutlineIcon,
    FilterOutlineIcon,
    LockOutlineIcon,
    MailOutlineIcon,
    SearchOutlineIcon,
    ViewOffOutlineIcon,
    ViewOnOutlineIcon,
} from '@vapor-ui/icons';

import { InputGroup } from '.';
import { Field } from '../field';
import { IconButton } from '../icon-button';
import { Select } from '../select';
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
                <IconButton aria-label="clear" size={args.size} variant="ghost">
                    <CloseOutlineIcon />
                </IconButton>
            </InputGroup.TrailingAddon>
        </InputGroup.Root>
    ),
};

/**
 * Addon 에 어떤 요소가 들어오는지에 따라 정렬과 크기가 달라진다.
 * icon·label 은 좌우 4px 인셋으로 콘텐츠 시작선(Root px + 4px)에 맞고,
 * IconButton·Select 는 그룹이 감지해 컴팩트 크기로 줄이고 좌우 패딩을 벗겨 같은 라인에 정렬한다.
 * (개발자는 자식에 size 를 넘길 필요 없이 그냥 넣으면 된다.)
 */
export const AddonTypes: Story = {
    args: { size: 'md' },
    render: (args) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
            <InputGroup.Root {...args}>
                <InputGroup.LeadingAddon>
                    <SearchOutlineIcon />
                </InputGroup.LeadingAddon>
                <TextInput placeholder="prefix: icon" />
            </InputGroup.Root>

            <InputGroup.Root {...args}>
                <InputGroup.LeadingAddon>https://</InputGroup.LeadingAddon>
                <TextInput placeholder="prefix: label" />
            </InputGroup.Root>

            <InputGroup.Root {...args}>
                <InputGroup.LeadingAddon>
                    <IconButton aria-label="clear" variant="ghost">
                        <CloseOutlineIcon />
                    </IconButton>
                </InputGroup.LeadingAddon>
                <TextInput placeholder="prefix: iconButton" />
            </InputGroup.Root>

            <InputGroup.Root {...args}>
                <InputGroup.LeadingAddon>
                    <Select.Root size={args.size} defaultValue="https" placeholder="protocol">
                        <Select.Trigger />
                        <Select.Popup>
                            <Select.Item value="https">https</Select.Item>
                            <Select.Item value="http">http</Select.Item>
                        </Select.Popup>
                    </Select.Root>
                </InputGroup.LeadingAddon>
                <TextInput placeholder="prefix: select" />
            </InputGroup.Root>

            <InputGroup.Root {...args}>
                <TextInput placeholder="suffix: iconButton" />
                <InputGroup.TrailingAddon>
                    <IconButton aria-label="search" variant="ghost">
                        <SearchOutlineIcon />
                    </IconButton>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            <InputGroup.Root {...args}>
                <InputGroup.LeadingAddon>
                    <SearchOutlineIcon />
                </InputGroup.LeadingAddon>
                <TextInput placeholder="both: icon + iconButton" />
                <InputGroup.TrailingAddon>
                    <IconButton aria-label="clear" variant="ghost">
                        <CloseOutlineIcon />
                    </IconButton>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* 한 addon 에 여러 요소: 검색어 입력 + 필터/검색 버튼. 요소 사이 간격(8px, xl 12px)이 유지된다. */}
            <InputGroup.Root {...args}>
                <TextInput placeholder="Search products" />
                <InputGroup.TrailingAddon>
                    <IconButton aria-label="Filter" variant="ghost">
                        <FilterOutlineIcon />
                    </IconButton>
                    <IconButton aria-label="Search" variant="ghost">
                        <SearchOutlineIcon />
                    </IconButton>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>
        </div>
    ),
};

/**
 * 한 addon 에 여러 요소가 올 때 요소 사이 간격을 size 별로 유지한다(Figma ElementGroup: sm/md/lg 8px, xl 12px).
 * 비밀번호 입력(자물쇠 prefix + 표시토글·지우기 suffix)을 각 size 로 나란히 두어 간격이 일관되게 커지는지 확인한다.
 */
export const MultipleAddonElements: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
            {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                <InputGroup.Root key={size} size={size}>
                    <InputGroup.LeadingAddon>
                        <LockOutlineIcon />
                    </InputGroup.LeadingAddon>
                    <TextInput type="password" placeholder={`Password (${size})`} />
                    <InputGroup.TrailingAddon>
                        <IconButton aria-label="Toggle visibility" variant="ghost">
                            {size === 'sm' ? <ViewOffOutlineIcon /> : <ViewOnOutlineIcon />}
                        </IconButton>
                        <IconButton aria-label="Clear" variant="ghost">
                            <CloseOutlineIcon />
                        </IconButton>
                    </InputGroup.TrailingAddon>
                </InputGroup.Root>
            ))}
        </div>
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
                <InputGroup.LeadingAddon>
                    <MailOutlineIcon />
                </InputGroup.LeadingAddon>
                <TextInput placeholder="you@example.com" />
            </InputGroup.Root>
            <Field.Error />
        </Field.Root>
    ),
};
