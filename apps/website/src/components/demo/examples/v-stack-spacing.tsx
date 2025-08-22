import { VStack } from '@vapor-ui/core';

export default function VStackSpacing() {
    return (
        <div className="flex gap-8">
            <div>
                <h4 className="text-sm font-medium mb-2">Gap $100</h4>
                <VStack gap="$100">
                    <div className="bg-red-100 p-2 rounded text-sm">A</div>
                    <div className="bg-red-100 p-2 rounded text-sm">B</div>
                    <div className="bg-red-100 p-2 rounded text-sm">C</div>
                </VStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Gap $400</h4>
                <VStack gap="$400">
                    <div className="bg-orange-100 p-2 rounded text-sm">A</div>
                    <div className="bg-orange-100 p-2 rounded text-sm">B</div>
                    <div className="bg-orange-100 p-2 rounded text-sm">C</div>
                </VStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Gap $800</h4>
                <VStack gap="$800">
                    <div className="bg-teal-100 p-2 rounded text-sm">A</div>
                    <div className="bg-teal-100 p-2 rounded text-sm">B</div>
                    <div className="bg-teal-100 p-2 rounded text-sm">C</div>
                </VStack>
            </div>
        </div>
    );
}
