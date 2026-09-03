import type { StoryObj } from '@storybook/react-vite';

import { AlertDialog } from '.';
import { Button } from '../button';

export default {
    title: 'AlertDialog',
};

type Story = StoryObj<typeof AlertDialog.Root>;

export const Default: Story = {
    render: (args) => (
        <AlertDialog.Root {...args} onOpenChange={(open) => console.log(open)}>
            <AlertDialog.Trigger>hihi</AlertDialog.Trigger>
            <AlertDialog.Popup>
                <AlertDialog.Header>
                    <AlertDialog.Title>다이얼로그입니다.</AlertDialog.Title>
                    <AlertDialog.Description>기본 형태의 다이얼로그입니다.</AlertDialog.Description>
                </AlertDialog.Header>
                <AlertDialog.Body>내용물을 입력해주세요.</AlertDialog.Body>
                <AlertDialog.Footer>
                    <AlertDialog.Close render={<Button colorPalette="contrast">닫기</Button>} />
                </AlertDialog.Footer>
            </AlertDialog.Popup>
        </AlertDialog.Root>
    ),
};

export const TestBed: Story = {
    parameters: { docs: { disable: true } },
    render: (args) => (
        <>
            <AlertDialog.Root {...args} open>
                <AlertDialog.Trigger>hihi</AlertDialog.Trigger>
                <AlertDialog.PortalPrimitive>
                    <AlertDialog.OverlayPrimitive />
                    <AlertDialog.PopupPrimitive>
                        <AlertDialog.Body>
                            <AlertDialog.Title>다이얼로그입니다.</AlertDialog.Title>
                            <AlertDialog.Description>
                                기본 형태의 다이얼로그입니다.
                            </AlertDialog.Description>
                        </AlertDialog.Body>
                        <AlertDialog.Footer $css={{ flexDirection: 'column' }}>
                            <AlertDialog.Close
                                render={<Button $css={{ width: '100%' }} colorPalette="danger" />}
                            >
                                확인
                            </AlertDialog.Close>
                            <AlertDialog.Close
                                render={
                                    <Button $css={{ width: '100%' }} colorPalette="secondary" />
                                }
                            >
                                닫기
                            </AlertDialog.Close>
                        </AlertDialog.Footer>
                    </AlertDialog.PopupPrimitive>
                </AlertDialog.PortalPrimitive>
            </AlertDialog.Root>
        </>
    ),
};
