import { Button, HStack, Toast } from '@vapor-ui/core';

const toastManager = Toast.createToastManager();

export default function ColorPalette() {
    const addToast = (colorPalette: 'info' | 'danger' | 'success') => {
        toastManager.add({
            title: 'This is a color palette toast message!',
            description: 'Here is a description for the color palette toast message.',
            colorPalette,
        });
    };

    return (
        <Toast.Provider toastManager={toastManager}>
            <HStack $css={{ gap: '$400', alignItems: 'center' }}>
                <Button colorPalette="secondary" onClick={() => addToast('info')}>
                    Info Toast
                </Button>
                <Button colorPalette="danger" onClick={() => addToast('danger')}>
                    Danger Toast
                </Button>
                <Button colorPalette="success" onClick={() => addToast('success')}>
                    Success Toast
                </Button>
            </HStack>
        </Toast.Provider>
    );
}
