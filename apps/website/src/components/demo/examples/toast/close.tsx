import './styles.css';

import { Button, Toast } from '@vapor-ui/core';

const toastManager = Toast.createToastManager();

export default function Close() {
    const addToast = () => {
        toastManager.add({
            title: 'This is a toast message without close button!',
            description: 'Here is a description for the toast message without close button.',
            close: false,
        });
    };

    return (
        <Toast.Provider toastManager={toastManager}>
            <Button onClick={addToast}>Wihtout Close Button</Button>
        </Toast.Provider>
    );
}
