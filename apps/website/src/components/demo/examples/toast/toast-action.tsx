import './styles.css';

import { Button, Toast } from '@vapor-ui/core';

const toastManager = Toast.createToastManager();

export default function Action() {
    const handleActionToast = () => {
        toastManager.add({
            title: 'This is an action toast message!',
            description: 'Here is a description for the action toast message.',
            actionProps: {
                children: 'action',
                onClick: () => {
                    alert('Action button clicked!');
                },
            },
        });
    };

    return (
        <Toast.Provider toastManager={toastManager}>
            <Button onClick={handleActionToast}>Action Toast</Button>
        </Toast.Provider>
    );
}
