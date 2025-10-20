import { Alert } from '@goorm-dev/vapor-core';
import { CloseOutlineIcon } from '@vapor-ui/icons';

export const Component = () => (
    <Alert color="danger">
        <CloseOutlineIcon />
        Error occurred
    </Alert>
);
