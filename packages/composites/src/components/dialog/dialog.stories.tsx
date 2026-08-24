import { useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, HStack, TextInput } from '@vapor-ui/core';

import { Dialog } from '.';

export default {
    title: 'Composites/Dialog',
    component: Dialog.Root,
    argTypes: {
        open: { control: 'boolean' },
        title: { control: 'text' },
        description: { control: 'text' },
        size: { control: 'inline-radio', options: ['md', 'lg', 'xl'] },
    },
} satisfies Meta<typeof Dialog.Root>;

type Story = StoryObj<typeof Dialog.Root>;

export const Default: Story = {
    args: {
        title: '초대하기초대하기초대하기초대하기초대하기초대하기초대하기',
        description: 'description',
        ariaLabels: { close: '닫기' },
    },
    render: (args) => {
        return (
            <>
                <Dialog.Root
                    trigger={<Button>Default</Button>}
                    action={<Dialog.Action>확인</Dialog.Action>}
                    assistive={<Dialog.Assistive>보조</Dialog.Assistive>}
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
                </Dialog.Root>

                <Dialog.Root
                    trigger={<Button>Scrollable</Button>}
                    action={<Dialog.Action>확인</Dialog.Action>}
                    assistive={<Dialog.Assistive>보조</Dialog.Assistive>}
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
                </Dialog.Root>

                <Dialog.Root trigger={<Button>Non-Footer</Button>} {...args}>
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
                </Dialog.Root>
            </>
        );
    },
};

export const AsyncAction: Story = {
    args: {
        title: '변경사항 저장',
        description: '저장이 완료되기 전까지 다이얼로그를 닫지 않는다.',
        ariaLabels: { close: '닫기' },
    },
    render: (args) => {
        const AsyncSaveDialog = () => {
            const [saving, setSaving] = useState(false);
            const [failing, setFailing] = useState(false);

            return (
                <Dialog.Root
                    trigger={<Button>Async Action</Button>}
                    assistive={(close) => (
                        <Dialog.Assistive disabled={saving} onClick={close}>
                            취소
                        </Dialog.Assistive>
                    )}
                    action={(close) => (
                        <Dialog.Action
                            disabled={saving}
                            onClick={async () => {
                                setSaving(true);
                                try {
                                    await new Promise((resolve) => setTimeout(resolve, 1500));
                                    if (failing) {
                                        throw new Error('save failed');
                                    }
                                    close();
                                } catch {
                                    // 에러 시 열림 유지 → close 미호출
                                } finally {
                                    setSaving(false);
                                }
                            }}
                        >
                            {saving ? '저장 중...' : '저장'}
                        </Dialog.Action>
                    )}
                    {...args}
                >
                    <HStack $css={{ gap: '$150' }}>
                        <Button
                            size="sm"
                            colorPalette={failing ? 'danger' : 'secondary'}
                            variant="outline"
                            onClick={() => setFailing((v) => !v)}
                        >
                            {failing ? '실패 모드 ON' : '실패 모드 OFF'}
                        </Button>
                    </HStack>
                </Dialog.Root>
            );
        };

        return <AsyncSaveDialog />;
    },
};
