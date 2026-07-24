import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    CloseOutlineIcon,
    CopyOutlineIcon,
    FilterOutlineIcon,
    InfoCircleOutlineIcon,
    LinkOutlineIcon,
    LockOutlineIcon,
    MailOutlineIcon,
    MoreCommonOutlineIcon,
    SearchOutlineIcon,
    ViewOnOutlineIcon,
} from '@vapor-ui/icons';

import { InputGroup } from '.';
import { Button } from '../button';
import { Checkbox } from '../checkbox';
import { Field } from '../field';
import { IconButton } from '../icon-button';
import { Menu } from '../menu';
import { Select } from '../select';
import { Tooltip } from '../tooltip';

const meta: Meta<typeof InputGroup.Root> = {
    title: 'InputGroup',
    component: InputGroup.Root,
    parameters: { layout: 'centered' },
    argTypes: {
        size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
        disabled: { control: 'boolean' },
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
            <InputGroup.Input placeholder="username" />
            <InputGroup.TrailingAddon>
                <InputGroup.Button
                    aria-label="close"
                    render={<IconButton variant="ghost" colorPalette="contrast" />}
                >
                    <CloseOutlineIcon />
                </InputGroup.Button>
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
                    <InputGroup.Input placeholder={size} />
                </InputGroup.Root>
            ))}

            {/* addon 조합: leading / trailing / both / label / iconButton */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>https://</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="leading label" />
            </InputGroup.Root>

            <InputGroup.Root>
                <InputGroup.Input placeholder="trailing iconButton" />
                <InputGroup.TrailingAddon>
                    <InputGroup.Button
                        aria-label="search"
                        render={<IconButton variant="ghost" colorPalette="contrast" />}
                    >
                        <SearchOutlineIcon />
                    </InputGroup.Button>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            <InputGroup.Root>
                <InputGroup.LeadingAddon>
                    <SearchOutlineIcon />
                </InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="icon + label" />
                <InputGroup.TrailingAddon>.com</InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* 한 addon 에 여러 요소 — 요소 사이 간격 유지(sm/md/lg 8px, xl 12px) */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>
                    <LockOutlineIcon />
                </InputGroup.LeadingAddon>
                <InputGroup.Input type="password" placeholder="multiple trailing elements" />
                <InputGroup.TrailingAddon>
                    <InputGroup.Button
                        aria-label="Toggle visibility"
                        render={<IconButton variant="ghost" colorPalette="contrast" />}
                    >
                        <ViewOnOutlineIcon />
                    </InputGroup.Button>
                    <InputGroup.Button
                        aria-label="Filter"
                        render={<IconButton variant="ghost" colorPalette="contrast" />}
                    >
                        <FilterOutlineIcon />
                    </InputGroup.Button>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* Select addon — InputGroup.Button render 로 편입, 그룹 높이/gap 정렬 */}
            <InputGroup.Root>
                <Select.Root placeholder="Currency">
                    <InputGroup.Input placeholder="amount" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button render={<Select.Trigger />} />
                    </InputGroup.TrailingAddon>
                    <Select.Popup>
                        <Select.Item value="usd">USD</Select.Item>
                        <Select.Item value="krw">KRW</Select.Item>
                    </Select.Popup>
                </Select.Root>
            </InputGroup.Root>

            {/* invalid 정석 — 값 담는 컨트롤에 invalid, :has([aria-invalid]) 로 테두리 danger */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="invalid" invalid />
            </InputGroup.Root>

            {/* disabled — Root 에만 주면 Input/Button 이 전파받아 실제 비활성 */}
            <InputGroup.Root disabled>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="disabled" />
                <InputGroup.TrailingAddon>
                    <InputGroup.Button
                        aria-label="clear"
                        render={<IconButton variant="ghost" colorPalette="contrast" />}
                    >
                        <CloseOutlineIcon />
                    </InputGroup.Button>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* readOnly — Input 만 읽기전용, 버튼은 생존 */}
            <InputGroup.Root readOnly>
                <InputGroup.LeadingAddon>@</InputGroup.LeadingAddon>
                <InputGroup.Input value="read only" />
            </InputGroup.Root>

            {/* Field 검증 — aria-invalid 를 :has 로 잡아 테두리 danger */}
            <Field.Root validate={(value) => (value ? null : '값을 입력하세요')}>
                <Field.Label>Email</Field.Label>
                <InputGroup.Root>
                    <InputGroup.LeadingAddon>
                        <MailOutlineIcon />
                    </InputGroup.LeadingAddon>
                    <InputGroup.Input placeholder="you@example.com" />
                </InputGroup.Root>
                <Field.Error />
            </Field.Root>
        </div>
    ),
};

export const SearchWithCategory: Story = {
    render: () => (
        <Select.Root placeholder="Category" size="xl">
            {/* pill 검색바 + 카테고리 Select. borderRadius 는 데모용 인라인 오버라이드. */}
            <InputGroup.Root style={{ borderRadius: 9999, width: 420 }} size="xl">
                <InputGroup.Input placeholder="Search products" />
                <InputGroup.TrailingAddon>
                    <InputGroup.Button render={<Select.Trigger />} />
                </InputGroup.TrailingAddon>
            </InputGroup.Root>
            <Select.Popup>
                <Select.Item value="all">All</Select.Item>
                <Select.Item value="books">Books</Select.Item>
                <Select.Item value="electronics">Electronics</Select.Item>
            </Select.Popup>
        </Select.Root>
    ),
};

const CONTACT_STATUSES = [
    { key: 'active', label: 'Active', count: 12 },
    { key: 'lead', label: 'Lead', count: 7 },
    { key: 'prospect', label: 'Prospect', count: 5 },
] as const;

// 박스형 체크박스 필터. Menu.CheckboxItem 은 체크마크(✓)가 기본이라, children 만 렌더하는
// CheckboxItemPrimitive 로 바꿔 Checkbox.Root(네모 박스)를 직접 배치한다.
// Checkbox 는 시각 표시용(pointer-events:none) — 토글은 menuitemcheckbox 가 담당한다.
const ContactsSearch = () => {
    const [checked, setChecked] = useState<Record<string, boolean>>({ active: true });

    return (
        <InputGroup.Root>
            <InputGroup.LeadingAddon>
                <SearchOutlineIcon />
            </InputGroup.LeadingAddon>
            <InputGroup.Input placeholder="Search contacts..." />
            <InputGroup.TrailingAddon>
                <Menu.Root>
                    <InputGroup.Button
                        render={
                            <Menu.Trigger
                                render={<Button variant="ghost" colorPalette="contrast" />}
                            />
                        }
                    >
                        <FilterOutlineIcon />
                        Status
                    </InputGroup.Button>
                    <Menu.Popup>
                        {CONTACT_STATUSES.map(({ key, label, count }) => (
                            <Menu.CheckboxItemPrimitive
                                key={key}
                                checked={!!checked[key]}
                                onCheckedChange={(value) =>
                                    setChecked((prev) => ({ ...prev, [key]: value }))
                                }
                            >
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Checkbox.Root
                                        checked={!!checked[key]}
                                        tabIndex={-1}
                                        style={{ pointerEvents: 'none' }}
                                    />
                                    {label}
                                </span>
                                <span>{count}</span>
                            </Menu.CheckboxItemPrimitive>
                        ))}
                    </Menu.Popup>
                </Menu.Root>
                <Menu.Root>
                    <InputGroup.Button
                        aria-label="More actions"
                        render={
                            <Menu.Trigger
                                render={<IconButton variant="ghost" colorPalette="contrast" />}
                            />
                        }
                    >
                        <MoreCommonOutlineIcon />
                    </InputGroup.Button>
                    <Menu.Popup>
                        <Menu.Item>Bulk email</Menu.Item>
                        <Menu.Item>Export CSV</Menu.Item>
                        <Menu.Item>Add contact</Menu.Item>
                    </Menu.Popup>
                </Menu.Root>
            </InputGroup.TrailingAddon>
        </InputGroup.Root>
    );
};

// REUI addon 레시피 모음(md 한 사이즈). leading/trailing 텍스트·아이콘, 텍스트/아이콘 버튼,
// Select·Tooltip 편입, native Kbd 까지 실전 조합을 한눈에.
export const Examples: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 360 }}>
            {/* prefix icon */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>
                    <SearchOutlineIcon />
                </InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="Search..." />
            </InputGroup.Root>

            {/* suffix icon */}
            <InputGroup.Root>
                <InputGroup.Input placeholder="you@example.com" />
                <InputGroup.TrailingAddon>
                    <MailOutlineIcon />
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* prefix text addon */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>https://</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="example.com" />
            </InputGroup.Root>

            {/* suffix text addon */}
            <InputGroup.Root>
                <InputGroup.Input placeholder="username" />
                <InputGroup.TrailingAddon>@gmail.com</InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* both text addons */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>$</InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="0.00" />
                <InputGroup.TrailingAddon>USD</InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* action button addon — 텍스트 버튼은 render 로 Button 편입(IconButton 정사각 대상 아님) */}
            <InputGroup.Root>
                <InputGroup.Input placeholder="Query..." />
                <InputGroup.TrailingAddon>
                    <InputGroup.Button
                        render={
                            <Button variant="ghost" colorPalette="contrast">
                                Search
                            </Button>
                        }
                    />
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* icon button action */}
            <InputGroup.Root>
                <InputGroup.Input defaultValue="https://reui.com/share" />
                <InputGroup.TrailingAddon>
                    <InputGroup.Button
                        aria-label="Copy link"
                        render={<IconButton variant="ghost" colorPalette="contrast" />}
                    >
                        <CopyOutlineIcon />
                    </InputGroup.Button>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* dropdown menu selection */}
            <InputGroup.Root>
                <Select.Root placeholder="+1">
                    <InputGroup.LeadingAddon>
                        <InputGroup.Button render={<Select.Trigger />} />
                    </InputGroup.LeadingAddon>
                    <InputGroup.Input placeholder="123 456 7890" />
                    <Select.Popup>
                        <Select.Item value="+1">+1</Select.Item>
                        <Select.Item value="+82">+82</Select.Item>
                    </Select.Popup>
                </Select.Root>
            </InputGroup.Root>

            {/* keyboard shortcut — vapor 에 Kbd 미제공 → native <kbd> */}
            <InputGroup.Root>
                <InputGroup.Input placeholder="Search documentation..." />
                <InputGroup.TrailingAddon>
                    <kbd>⌘K</kbd>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* tooltip action */}
            <InputGroup.Root>
                <Tooltip.Root>
                    <InputGroup.Input defaultValue="5000" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button
                            aria-label="Balance info"
                            render={
                                <Tooltip.Trigger
                                    render={<IconButton variant="ghost" colorPalette="contrast" />}
                                />
                            }
                        >
                            <InfoCircleOutlineIcon />
                        </InputGroup.Button>
                    </InputGroup.TrailingAddon>
                    <Tooltip.Popup positionerElement={<Tooltip.PositionerPrimitive side="top" />}>
                        Your available credit balance
                    </Tooltip.Popup>
                </Tooltip.Root>
            </InputGroup.Root>

            {/* search + filter 텍스트 버튼 */}
            <InputGroup.Root>
                <InputGroup.LeadingAddon>
                    <SearchOutlineIcon />
                </InputGroup.LeadingAddon>
                <InputGroup.Input placeholder="Search orders..." />
                <InputGroup.TrailingAddon>
                    <InputGroup.Button render={<Button variant="ghost" colorPalette="contrast" />}>
                        <FilterOutlineIcon />
                        Status
                    </InputGroup.Button>
                </InputGroup.TrailingAddon>
            </InputGroup.Root>

            {/* search + region Select (globe 아이콘은 vapor Select.Trigger 가 value/chevron 을 자체 렌더해 생략) */}
            <InputGroup.Root>
                <Select.Root placeholder="Global">
                    <InputGroup.LeadingAddon>
                        <SearchOutlineIcon />
                    </InputGroup.LeadingAddon>
                    <InputGroup.Input placeholder="Search companies..." />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button render={<Select.Trigger />} />
                    </InputGroup.TrailingAddon>
                    <Select.Popup>
                        <Select.Item value="global">Global</Select.Item>
                        <Select.Item value="us">US</Select.Item>
                        <Select.Item value="eu">EU</Select.Item>
                    </Select.Popup>
                </Select.Root>
            </InputGroup.Root>

            {/* search + Status 체크박스 필터 메뉴 + more 액션 메뉴 */}
            <ContactsSearch />

            {/* link + visibility Select + copy 버튼 */}
            <InputGroup.Root>
                <Select.Root placeholder="Private">
                    <InputGroup.LeadingAddon>
                        <LinkOutlineIcon />
                    </InputGroup.LeadingAddon>
                    <InputGroup.Input defaultValue="agentflow.ai/runbooks/q2-review" />
                    <InputGroup.TrailingAddon>
                        <InputGroup.Button render={<Select.Trigger />} />
                        <InputGroup.Button
                            aria-label="Copy link"
                            render={<IconButton variant="ghost" colorPalette="contrast" />}
                        >
                            <CopyOutlineIcon />
                        </InputGroup.Button>
                    </InputGroup.TrailingAddon>
                    <Select.Popup>
                        <Select.Item value="private">Private</Select.Item>
                        <Select.Item value="public">Public</Select.Item>
                    </Select.Popup>
                </Select.Root>
            </InputGroup.Root>
        </div>
    ),
};

// size 별로 IconButton·Select.Trigger 가 그룹 높이/아이콘에 함께 compact 되는지 검증.
export const SizedSelects: Story = {
    render: () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: 360 }}>
            {SIZES.map((size) => (
                <InputGroup.Root size={size} key={size}>
                    <Select.Root key={size} placeholder="Category" size={size}>
                        <InputGroup.LeadingAddon>
                            <SearchOutlineIcon />
                        </InputGroup.LeadingAddon>
                        <InputGroup.Input placeholder={size} />
                        <InputGroup.TrailingAddon>
                            <InputGroup.Button
                                aria-label="clear"
                                render={<IconButton variant="ghost" colorPalette="contrast" />}
                            >
                                <CloseOutlineIcon />
                            </InputGroup.Button>
                            <InputGroup.Button render={<Select.Trigger />} />
                        </InputGroup.TrailingAddon>
                        <Select.Popup>
                            <Select.Item value="all">All</Select.Item>
                            <Select.Item value="books">Books</Select.Item>
                        </Select.Popup>
                    </Select.Root>
                </InputGroup.Root>
            ))}
        </div>
    ),
};
