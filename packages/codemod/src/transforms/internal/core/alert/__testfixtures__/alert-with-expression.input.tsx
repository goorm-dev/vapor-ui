// @ts-nocheck
import { Alert } from '@goorm-dev/vapor-core';

const color = 'success';

export const Component = () => <Alert color={color as any}>Dynamic color</Alert>;
