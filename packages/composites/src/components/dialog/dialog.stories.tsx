import { useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, HStack, Text, TextInput, VStack } from '@vapor-ui/core';

import { Regression } from '~/utils/regressions';

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
                    open
                    trigger={<Button>Scrollable</Button>}
                    action={<Dialog.Action>확인</Dialog.Action>}
                    assistive={<Dialog.Assistive>보조</Dialog.Assistive>}
                    {...args}
                >
                    <VStack>
                        {Array.from({ length: 20 }, (_, index) => (
                            <Text key={index} typography="heading5">
                                {index + 1}. 내용물입니다.
                            </Text>
                        ))}
                    </VStack>
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

/* -----------------------------------------------------------------------------------------------
 * Test Bed
 * ---------------------------------------------------------------------------------------------- */

const props = {
    ariaLabels: { close: '닫기' },
    title: '제목은 여러 줄에 걸쳐 표시될 수가 있습니다. 제목은 여러 줄에 걸쳐 표시될 수가 있습니다. 제목은 여러 줄에 걸쳐 표시될 수가 있습니다.',
} as const;

const dialogOverlayStripStyles = `
.regression-cell [data-base-ui-portal] [data-parts="dialog-popup"] {
    top: unset;
    left: unset;
    transform: unset;
    max-width: 95%;
}
.regression-cell [data-parts="dialog-popup"] {
    max-height: 300px
}
`;

const TestBedRender = () => {
    return (
        <>
            <style>{dialogOverlayStripStyles}</style>
            <Regression.Table
                conditions={[
                    {
                        key: 'size',
                        label: 'size',
                        values: ['md', 'lg', 'xl'],
                        format: (v) => `size = ${v}`,
                    },
                    {
                        key: 'hasDescription',
                        label: 'description',
                        values: [
                            '유사도 검사 결과를 다운받으시겠어요? 결과는 현재 표에 적용된 필터 기준으로 다운로드 됩니다.',
                            null,
                        ],
                        format: (v) => `description = ${v ? 'O' : 'X'}`,
                    },
                    {
                        key: 'hasScroll',
                        label: 'scroll',
                        values: [true, false],
                        format: (v) => `scroll = ${v ? 'O' : 'X'}`,
                    },
                    {
                        key: 'footer',
                        label: 'footer',
                        values: ['none', 'action', 'action + assistive'] as const,
                        format: (v) => `footer = ${v}`,
                    },
                ]}
                render={(row, container) => (
                    <Dialog.Root
                        defaultOpen
                        container={container}
                        ariaLabels={props.ariaLabels}
                        title={props.title}
                        description={row.hasDescription}
                        action={row.footer === 'none' ? null : <Dialog.Action>확인</Dialog.Action>}
                        assistive={
                            row.footer !== 'action + assistive' ? null : (
                                <Dialog.Assistive>보조</Dialog.Assistive>
                            )
                        }
                        size={row.size}
                    >
                        <HStack $css={{ flexDirection: 'column' }}>
                            {Array.from({ length: row.hasScroll ? 10 : 2 }, (_, index) => (
                                <Text key={index} typography="heading5">
                                    {index + 1}. 내용물입니다.
                                </Text>
                            ))}
                        </HStack>
                    </Dialog.Root>
                )}
            />
        </>
    );
};

export const TestBed: Story = {
    render: () => <TestBedRender />,
};
