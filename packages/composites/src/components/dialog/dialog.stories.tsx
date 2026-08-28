import { useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, HStack, Text, TextInput, VStack } from '@vapor-ui/core';

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

export const ManualClose: Story = {
    args: {
        title: '반복 액션',
        ariaLabels: { close: '닫기' },
    },
    render: (args) => {
        const [count, setCount] = useState(0);

        return (
            <Dialog.Root
                trigger={<Button>Close On Click</Button>}
                assistive={
                    <Dialog.Assistive closeOnClick={false} onClick={() => setCount(0)}>
                        초기화
                    </Dialog.Assistive>
                }
                action={
                    <Dialog.Action closeOnClick={false} onClick={() => setCount((v) => v + 1)}>
                        누른 횟수: {count}
                    </Dialog.Action>
                }
                {...args}
            >
                <Text typography="body2">
                    closeOnClick 속성은 Action, Assistive 버튼의 기본 닫기 동작을 제거합니다.
                    <br />이 경우, Dialog의 닫기 동작을 직접 추가하려면 actionsRef 속성을
                    이용하세요.
                </Text>
            </Dialog.Root>
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
        const [saving, setSaving] = useState(false);
        const [failing, setFailing] = useState(false);
        const [error, setError] = useState<string | null>(null);

        const actionsRef = useRef<Dialog.Root.Actions>(null);

        const save = () =>
            new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    if (failing) {
                        reject(new Error('저장에 실패했다. 잠시 후 다시 시도해라.'));
                        return;
                    }
                    resolve();
                }, 1500);
            });

        const handleClick = async () => {
            setError(null);
            setSaving(true);
            try {
                await save();
                actionsRef.current?.close();
            } catch (e) {
                setError((e as Error).message);
            } finally {
                setSaving(false);
            }
        };

        return (
            <Dialog.Root
                actionsRef={actionsRef}
                trigger={<Button>Async Action</Button>}
                assistive={<Dialog.Assistive disabled={saving}>취소</Dialog.Assistive>}
                action={
                    <Dialog.Action disabled={saving} closeOnClick={false} onClick={handleClick}>
                        {saving ? '저장 중...' : '저장'}
                    </Dialog.Action>
                }
                {...args}
            >
                <VStack $css={{ gap: '$150', alignItems: 'flex-start' }}>
                    <Button
                        size="sm"
                        colorPalette={failing ? 'danger' : 'secondary'}
                        variant="outline"
                        onClick={() => setFailing((v) => !v)}
                    >
                        {failing ? '실패 모드 ON' : '실패 모드 OFF'}
                    </Button>
                    {error && (
                        <Text typography="body2" foreground="danger">
                            {error}
                        </Text>
                    )}
                </VStack>
            </Dialog.Root>
        );
    },
};
