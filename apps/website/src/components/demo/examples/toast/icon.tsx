import './styles.css';

import type { ReactNode } from 'react';

import { Button, HStack, Toast } from '@vapor-ui/core';
import { CertificateIcon, HeartIcon, WarningIcon } from '@vapor-ui/icons';

const toastManager = Toast.createToastManager();

export default function Icon() {
    const addToast = (colorPalette: 'info' | 'danger' | 'success', icon: ReactNode) => {
        toastManager.add({
            title: 'This is a color palette toast message!',
            description: 'Here is a description for the color palette toast message.',
            colorPalette,
            icon,
        });
    };

    return (
        <Toast.Provider toastManager={toastManager}>
            <HStack gap="$400" alignItems="center">
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
