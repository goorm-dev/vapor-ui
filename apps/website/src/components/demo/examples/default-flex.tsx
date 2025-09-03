import { Flex } from '@vapor-ui/core';

export default function DefaultFlex() {
    return (
        <Flex gap="$200" padding="$300" backgroundColor="gray-100" borderRadius="$200">
            <div
                style={{
                    padding: '8px',
                    backgroundColor: '#3b82f6',
                    borderRadius: '4px',
                    color: 'white',
                }}
            >
                Item 1
            </div>
            <div
                style={{
                    padding: '8px',
                    backgroundColor: '#10b981',
                    borderRadius: '4px',
                    color: 'white',
                }}
            >
                Item 2
            </div>
            <div
                style={{
                    padding: '8px',
                    backgroundColor: '#f59e0b',
                    borderRadius: '4px',
                    color: 'white',
                }}
            >
                Item 3
            </div>
        </Flex>
    );
}
