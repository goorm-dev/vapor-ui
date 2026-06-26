import { Toast } from '@vapor-ui/core';

export const toastManager = Toast.createToastManager();
export const ToastProvider = (props: Toast.Provider.Props) => {
    return <Toast.Provider {...props} toastManager={toastManager} timeout={3000} />;
};
