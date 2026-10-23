import { Button, Toast } from '@vapor-ui/core';

const toastManager = Toast.createToastManager();

export default function Default() {
    return (
        <Toast.Provider toastManager={toastManager}>
            <App />
        </Toast.Provider>
    );
}

const App = () => {
    const addToast = () => {
        toastManager.add({
            title: 'This is a toast message!',
            description: 'Here is a description for the toast message.',
        });
    };

    return <Button onClick={addToast}>Add Toast</Button>;
};
