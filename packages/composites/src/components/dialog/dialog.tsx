import { Dialog as DialogPrimitives } from '@vapor-ui/core';

export const Dialog = () => {
    return (
        <DialogPrimitives.Root>
            <DialogPrimitives.Trigger>trigger</DialogPrimitives.Trigger>

            <DialogPrimitives.Popup>
                <DialogPrimitives.Header>
                    <DialogPrimitives.Title>title</DialogPrimitives.Title>
                </DialogPrimitives.Header>

                <DialogPrimitives.Body>body</DialogPrimitives.Body>

                <DialogPrimitives.Footer></DialogPrimitives.Footer>
            </DialogPrimitives.Popup>
        </DialogPrimitives.Root>
    );
};
