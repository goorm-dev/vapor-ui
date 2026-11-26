import { AlertDialog } from '@vapor-ui/composites';

interface ConfirmDialogProps {
    /** Open while set. */
    message: string | null;
    onConfirm: () => void;
    onCancel: () => void;
}

/** In-page confirm. The plugin iframe blocks `window.confirm`. */
export const ConfirmDialog = ({ message, onConfirm, onCancel }: ConfirmDialogProps) => (
    <AlertDialog.Root
        type="critical"
        cancel={<AlertDialog.Cancel>취소</AlertDialog.Cancel>}
        action={<AlertDialog.Action onClick={onConfirm}>계속</AlertDialog.Action>}
        description={message}
        title="계속할까요?"
        open={message !== null}
        onOpenChange={(open) => !open && onCancel()}
    />
);
