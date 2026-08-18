import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, HStack, TextInput, VStack } from '@vapor-ui/core';

import { Dialog } from './dialog';

export default {
    title: 'Composites/Dialog',
    component: Dialog,
    argTypes: {
        open: { control: 'boolean' },
        title: { control: 'text' },
        description: { control: 'text' },
        size: { control: 'inline-radio', options: ['md', 'lg', 'xl'] },
    },
} satisfies Meta<typeof Dialog>;

type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
    args: {
        title: '초대하기',
        description: 'description',
    },
    render: (args) => {
        return (
            <Dialog
                trigger={<Button>hi</Button>}
                footer={{
                    actionButton: <Button>확인</Button>,
                    assistiveButton: (
                        <Button colorPalette="secondary" variant="ghost">
                            보조
                        </Button>
                    ),
                }}
                {...args}
            >
                <InviteForms />
            </Dialog>
        );
    },
};

const InviteForms = () => {
    return (
        <VStack $css={{ gap: '$100' }}>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
            <HStack $css={{ gap: '$150' }}>
                <TextInput
                    placeholder="이메일 또는 이름을 입력하세요"
                    size="lg"
                    $css={{ width: '100%' }}
                />
                <Button size="lg" colorPalette="contrast">
                    초대하기
                </Button>
            </HStack>
            <HStack $css={{ gap: '$100' }}>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.kim
                </Button>
                <Button size="sm" colorPalette="secondary" variant="outline">
                    + goorm.lee
                </Button>
            </HStack>
        </VStack>
    );
};
