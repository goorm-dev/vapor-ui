import { Button, HStack, Toast } from '@vapor-ui/core';
import { CertificateIcon, HeartIcon, WarningIcon } from '@vapor-ui/icons';

const toastManager = Toast.createToastManager();

export default function Icon() {
    const addToast = (
        colorPalette: Toast.RootPrimitive.ToastObject['colorPalette'],
        icon: Toast.RootPrimitive.ToastObject['icon'],
    ) => {
        toastManager.add({
            title: 'This is a color palette toast message!',
            description: 'Here is a description for the color palette toast message.',
            colorPalette,
            icon,
        });
    };

    return (
        <Toast.Provider toastManager={toastManager}>
            <HStack $styles={{ gap: '$400', alignItems: 'center' }}>
                <Button
                    colorPalette="secondary"
                    onClick={() => addToast('info', <HeartIcon color="white" />)}
                >
                    Info Toast
                </Button>
                <Button
                    colorPalette="danger"
                    onClick={() => addToast('danger', <WarningIcon color="white" />)}
                >
                    Danger Toast
                </Button>
                <Button
                    colorPalette="success"
                    onClick={() => addToast('success', <CertificateIcon color="white" />)}
                >
                    Success Toast
                </Button>
            </HStack>
        </Toast.Provider>
    );
}
