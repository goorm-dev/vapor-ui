// @ts-nocheck
import { Dialog } from '@vapor-ui/core';

export const Component = () => (
    <Dialog.Root>
        <Dialog.Trigger
            render={
                <button className="btn" type="button" aria-label="Open">
                    Open Dialog
                </button>
            }
        />
        <Dialog.Content>
            <Dialog.Header>
                <div className="custom-header">
                    <Dialog.Title>Title</Dialog.Title>
                </div>
            </Dialog.Header>
        </Dialog.Content>
    </Dialog.Root>
);
