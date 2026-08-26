import { useRef, useState } from 'react';

import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, HStack, Text, TextInput, VStack } from '@vapor-ui/core';

import { Regression, cartesianRows } from '~/utils/regressions';

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

/* -----------------------------------------------------------------------------------------------
 * Test Bed
 * ---------------------------------------------------------------------------------------------- */

const SIZES = ['md', 'lg', 'xl'] as const;
const DESCRIPTION_PRESENCE = [
    '유사도 검사 결과를 다운받으시겠어요? 결과는 현재 표에 적용된 필터 기준으로 다운로드 됩니다.',
    null,
] as const;
const SCROLL = [6, 2] as const;

const props = {
    ariaLabels: { close: '닫기' },
    title: '제목은 여러 줄에 걸쳐 표시될 수가 있습니다. 제목은 여러 줄에 걸쳐 표시될 수가 있습니다. 제목은 여러 줄에 걸쳐 표시될 수가 있습니다.',
    action: <Dialog.Action>확인</Dialog.Action>,
    assistive: <Dialog.Assistive>보조</Dialog.Assistive>,
} as const;

const testBedRows = cartesianRows({
    size: SIZES,
    hasDescription: DESCRIPTION_PRESENCE,
    hasScroll: SCROLL,
});

const dialogOverlayStripStyles = `
.regression-cell [data-base-ui-portal] [role="dialog"] {
    top: unset;
    left: unset;
    transform: unset;
}
`;

const TestBedRender = () => {
    return (
        <>
            <style>{dialogOverlayStripStyles}</style>
            <Regression.Root>
                <Regression.ColumnGroup>
                    <Regression.ConditionColumn />
                    <Regression.ConditionColumn />
                    <Regression.ConditionColumn />
                    <Regression.RenderColumn />
                </Regression.ColumnGroup>
                <Regression.Header>
                    <Regression.Row>
                        <Regression.Heading>size</Regression.Heading>
                        <Regression.Heading>description</Regression.Heading>
                        <Regression.Heading>scroll</Regression.Heading>
                        <Regression.Heading>render</Regression.Heading>
                    </Regression.Row>
                </Regression.Header>
                <Regression.Body>
                    {testBedRows.map((row, idx) => (
                        <Regression.Row key={idx}>
                            <Regression.Condition>size = {row.size}</Regression.Condition>
                            <Regression.Condition>
                                description = {row.hasDescription ? 'O' : 'X'}
                            </Regression.Condition>
                            <Regression.Condition>
                                scroll = {row.hasScroll ? 'O' : 'X'}
                            </Regression.Condition>
                            <Regression.Render>
                                {(container) => (
                                    <Dialog.Root
                                        title={props.title}
                                        description={row.hasDescription}
                                        action={props.action}
                                        assistive={props.assistive}
                                        ariaLabels={props.ariaLabels}
                                        size={row.size}
                                        defaultOpen
                                        container={container ?? undefined}
                                    >
                                        <HStack $css={{ maxHeight: '80px' }}>
                                            <HStack $css={{ flexDirection: 'column', gap: '$150' }}>
                                                {Array.from(
                                                    { length: row.hasScroll },
                                                    (_, index) => (
                                                        <Text key={index} typography="heading5">
                                                            내용물입니다.
                                                        </Text>
                                                    ),
                                                )}
                                            </HStack>
                                        </HStack>
                                    </Dialog.Root>
                                )}
                            </Regression.Render>
                        </Regression.Row>
                    ))}
                </Regression.Body>
            </Regression.Root>
        </>
    );
};

export const TestBed: Story = {
    render: () => <TestBedRender />,
};
