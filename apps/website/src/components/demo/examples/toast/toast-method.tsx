import { Button, HStack, Toast } from '@vapor-ui/core';

const toastManager = Toast.createToastManager();

export default function Method() {
    return (
        <Toast.Provider toastManager={toastManager}>
            <App />
        </Toast.Provider>
    );
}

const App = () => {
    const toastManager = Toast.useToastManager();

    const addToast = () => {
        toastManager.add({
            title: 'This is a toast message added by method!',
            description: 'Here is a description for the toast message added by method.',
        });
    };

    const updateToast = () => {
        const id = toastManager.add({
            title: 'This is a toast message to be updated!',
            description: 'Here is a description for the toast message to be updated.',

            actionProps: {
                children: 'Update',
                onClick: () => {
                    toastManager.update(id, {
                        title: 'Updated!',
                        colorPalette: 'success',
                    });
                },
            },
        });
    };

    const removeToast = () => {
        const id = toastManager.add({
            title: 'This is a toast message to be removed!',
            description: 'Here is a description for the toast message to be removed.',

            actionProps: {
                children: 'Remove',
                onClick: () => {
                    toastManager.close(id);
                    toastManager.add({
                        title: 'Toast removed!',
                        colorPalette: 'danger',
                    });
                },
            },
        });
    };

    const promiseToast = () => {
        const fakePromise = new Promise<string>((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.5) resolve('Data loaded successfully!');
                else reject(new Error('Failed to load data'));
            }, 3000);
        });

        toastManager.promise(fakePromise, {
            loading: {
                title: 'Loading...',
                description: 'Please wait while we load the data.',
                colorPalette: 'info',
            },
            success: {
                title: 'Success!',
                description: 'The data has been loaded successfully.',
                colorPalette: 'success',
            },
            error: {
                title: 'Error!',
                description: 'There was an error loading the data.',
                colorPalette: 'danger',
            },
        });
    };

    return (
        <HStack gap="$400" alignItems="center">
            <Button onClick={addToast}>Add Toast</Button>

            <Button onClick={updateToast}>Update Toast</Button>

            <Button onClick={removeToast}>Remove Toast</Button>

            <Button onClick={promiseToast}>Promise Toast</Button>
        </HStack>
    );
};
