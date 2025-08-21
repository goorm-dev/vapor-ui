import { HStack } from '@vapor-ui/core';

export default function DefaultHStack() {
    return (
        <HStack gap="4">
            <div className="bg-blue-100 p-4 rounded">Item 1</div>
            <div className="bg-blue-100 p-4 rounded">Item 2</div>
            <div className="bg-blue-100 p-4 rounded">Item 3</div>
        </HStack>
    );
}