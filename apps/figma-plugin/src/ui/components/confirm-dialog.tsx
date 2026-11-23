import { AlertDialog, Button } from '@vapor-ui/core';

interface ConfirmDialogProps {
    /** Open while set. */
    message: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/** In-page confirm. The plugin iframe blocks `window.confirm`. */
export const ConfirmDialog = ({ message, onConfirm, onCancel }: ConfirmDialogProps) => (
    <AlertDialog.Root open={message !== null} onOpenChange={(open) => !open && onCancel()}>
        <AlertDialog.Popup>
            <AlertDialog.Header>
                <AlertDialog.Title>계속할까요?</AlertDialog.Title>
            </AlertDialog.Header>
            <AlertDialog.Body>
                <AlertDialog.Description>{message}</AlertDialog.Description>
            </AlertDialog.Body>
            <AlertDialog.Footer>
                <AlertDialog.Close render={<Button colorPalette="secondary" variant="outline" />}>
                    취소
                </AlertDialog.Close>
                <Button colorPalette="danger" onClick={onConfirm}>
                    계속
                </Button>
            </AlertDialog.Footer>
        </AlertDialog.Popup>
    </AlertDialog.Root>
);
