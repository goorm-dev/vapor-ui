import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button, TextInput, VStack } from '@vapor-ui/core';

import { Dialog } from '.';
import { AlertDialog } from '../alert-dialog';

interface CaseArgs {
    kind: 'Dialog' | 'AlertDialog';
    body: boolean;
    footer: boolean;
    scroll: boolean;
    description: boolean;
    size: 'md' | 'lg' | 'xl';
}

export default {
    title: 'Composites/Dialog Combinations',
    argTypes: {
        kind: { control: 'inline-radio', options: ['Dialog', 'AlertDialog'] },
        footer: { description: 'Dialog에만 적용됩니다. AlertDialog는 cancel·action이 필수입니다.' },
        size: {
            control: 'inline-radio',
            options: ['md', 'lg', 'xl'],
            description: 'Dialog에만 적용됩니다.',
        },
    },
    args: {
        kind: 'Dialog',
        body: true,
        footer: true,
        scroll: false,
        description: true,
        size: 'md',
    },
    render: (args) =>
        args.kind === 'Dialog' ? <DialogCase {...args} /> : <AlertDialogCase {...args} />,
} satisfies Meta<CaseArgs>;

type Story = StoryObj<CaseArgs>;

// The first and last focusables sit at the Body edges, so their rings show whether the edges clip.
const BodyContent = ({ scroll }: Pick<CaseArgs, 'scroll'>) => (
    <VStack $css={{ gap: '$150', alignItems: 'stretch' }}>
        <TextInput placeholder="첫 요소 (전체 너비 입력)" $css={{ width: '100%' }} />
        {Array.from({ length: scroll ? 12 : 1 }, (_, index) => (
            <Button key={index} variant="outline" colorPalette="secondary">
                버튼 {index + 1}
            </Button>
        ))}
        <Button>마지막 요소</Button>
    </VStack>
);

const DialogCase = ({ body, footer, scroll, description, size }: CaseArgs) => (
    <Dialog.Root
        defaultOpen
        size={size}
        trigger={<Button>열기</Button>}
        ariaLabels={{ close: '닫기' }}
        title="다이얼로그 제목"
        description={description ? '설명 문장입니다.' : undefined}
        action={footer ? <Dialog.Action>확인</Dialog.Action> : undefined}
        assistive={footer ? <Dialog.Assistive>보조</Dialog.Assistive> : undefined}
    >
        {body && <BodyContent scroll={scroll} />}
    </Dialog.Root>
);

const AlertDialogCase = ({ body, scroll, description }: CaseArgs) => (
    <AlertDialog.Root
        defaultOpen
        type="critical"
        trigger={<Button>열기</Button>}
        title="이 항목을 삭제할까요?"
        description={description ? '삭제하면 되돌릴 수 없습니다.' : undefined}
        cancel={<AlertDialog.Cancel>취소</AlertDialog.Cancel>}
        action={<AlertDialog.Action>삭제</AlertDialog.Action>}
    >
        {body && <BodyContent scroll={scroll} />}
    </AlertDialog.Root>
);

// Body + Footer is impossible here: `title` is required, so the Header always renders.
export const HeaderFooter: Story = { args: { body: false } };
export const HeaderBody: Story = { args: { footer: false } };
