import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, HStack, TextInput } from '@vapor-ui/core';

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
        title: '초대하기초대하기초대하기초대하기초대하기초대하기초대하기',
        description: 'description',
    },
    render: (args) => {
        return (
            <>
                <Dialog
                    trigger={<Button>Default</Button>}
                    action={<Button size="lg">확인</Button>}
                    assistive={
                        <Button size="lg" colorPalette="secondary" variant="outline">
                            보조
                        </Button>
                    }
                    {...args}
                >
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
                </Dialog>

                <Dialog
                    trigger={<Button>Scrollable</Button>}
                    action={<Button size="lg">확인</Button>}
                    assistive={
                        <Button size="lg" colorPalette="secondary" variant="outline">
                            보조
                        </Button>
                    }
                    {...args}
                >
                    <HStack $css={{ gap: '$150', height: '800px', backgroundColor: 'Beige' }}>
                        <TextInput
                            placeholder="이메일 또는 이름을 입력하세요"
                            size="lg"
                            $css={{ width: '100%' }}
                        />
                        <Button size="lg" colorPalette="contrast">
                            초대하기
                        </Button>
                    </HStack>
                </Dialog>

                <Dialog trigger={<Button>Non-Footer</Button>} {...args}>
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
                </Dialog>
            </>
        );
    },
};
