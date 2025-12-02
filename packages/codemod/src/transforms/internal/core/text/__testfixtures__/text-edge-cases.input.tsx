// @ts-nocheck
import { Text } from '@goorm-dev/vapor-core';

const colorVar = 'text-primary';

export const Component = () => (
    <>
        <Text color={colorVar}>Dynamic Color</Text>
        <Text as={true ? <a /> : <span />}>Dynamic As</Text>
        <Text asChild>
            <>Fragment Child</>
        </Text>
        <Text asChild>No JSX Child</Text>
        <Text color="unmapped-color">Unmapped Color</Text>
    </>
);
