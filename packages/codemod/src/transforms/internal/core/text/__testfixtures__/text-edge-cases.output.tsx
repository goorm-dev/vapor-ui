// @ts-nocheck
import { Text } from '@vapor-ui/core';

const colorVar = 'text-primary';

export const Component = () => (
    <>
        <Text foreground={colorVar}>Dynamic Color</Text>
        <Text render={true ? <a /> : <span />}>Dynamic As</Text>
        <Text>
            <>Fragment Child</>
        </Text>
        <Text>No JSX Child</Text>
        <Text foreground="unmapped-color">Unmapped Color</Text>
    </>
);
