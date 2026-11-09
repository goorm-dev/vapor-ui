import type { Meta, StoryObj } from '@storybook/react-vite';

import { Dialog } from '.';
import { AlertDialog } from '../alert-dialog';
import { Button } from '../button';
import { TextInput } from '../text-input';
import { VStack } from '../v-stack';

interface CaseArgs {
    kind: 'Dialog' | 'AlertDialog';
    header: boolean;
    body: boolean;
    footer: boolean;
    scroll: boolean;
    size: 'md' | 'lg' | 'xl';
}

export default {
    title: 'Dialog Combinations',
    argTypes: {
        kind: { control: 'inline-radio', options: ['Dialog', 'AlertDialog'] },
        size: {
            control: 'inline-radio',
            options: ['md', 'lg', 'xl'],
            description: 'Dialog에만 적용됩니다.',
        },
    },
    args: { kind: 'Dialog', header: true, body: true, footer: true, scroll: false, size: 'md' },
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

const DialogCase = ({ header, body, footer, scroll, size }: CaseArgs) => (
    <Dialog.Root defaultOpen size={size}>
        <Dialog.Trigger>열기</Dialog.Trigger>
        <Dialog.Popup>
            {header && (
                <Dialog.Header>
                    <Dialog.Title>다이얼로그 제목</Dialog.Title>
                </Dialog.Header>
            )}
            {body && (
                <Dialog.Body>
                    <BodyContent scroll={scroll} />
                </Dialog.Body>
            )}
            {footer && (
                <Dialog.Footer $css={{ justifyContent: 'flex-end', gap: '$100' }}>
                    <Dialog.Close render={<Button colorPalette="secondary" variant="outline" />}>
                        닫기
                    </Dialog.Close>
                    <Button>확인</Button>
                </Dialog.Footer>
            )}
        </Dialog.Popup>
    </Dialog.Root>
);

const AlertDialogCase = ({ header, body, footer, scroll }: CaseArgs) => (
    <AlertDialog.Root defaultOpen>
        <AlertDialog.Trigger>열기</AlertDialog.Trigger>
        <AlertDialog.Popup>
            {header && (
                <AlertDialog.Header>
                    <AlertDialog.Title>알림 다이얼로그 제목</AlertDialog.Title>
                </AlertDialog.Header>
            )}
            {body && (
                <AlertDialog.Body>
                    <BodyContent scroll={scroll} />
                </AlertDialog.Body>
            )}
            {footer && (
                <AlertDialog.Footer $css={{ justifyContent: 'flex-end' }}>
                    <AlertDialog.Close
                        render={<Button colorPalette="secondary" variant="outline" />}
                    >
                        취소
                    </AlertDialog.Close>
                    <Button colorPalette="danger">삭제</Button>
                </AlertDialog.Footer>
            )}
        </AlertDialog.Popup>
    </AlertDialog.Root>
);

export const HeaderFooter: Story = { args: { body: false } };
export const BodyFooter: Story = { args: { header: false } };
export const HeaderBody: Story = { args: { footer: false } };
