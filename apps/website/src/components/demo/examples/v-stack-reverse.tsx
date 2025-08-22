import { VStack } from '@vapor-ui/core';

export default function VStackReverse() {
    return (
        <div className="flex gap-8">
            <div>
                <h4 className="text-sm font-medium mb-2">Normal Stack</h4>
                <VStack gap="3">
                    <div className="bg-green-100 p-3 rounded text-center">First</div>
                    <div className="bg-green-200 p-3 rounded text-center">Second</div>
                    <div className="bg-green-300 p-3 rounded text-center">Third</div>
                </VStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Reverse Stack</h4>
                <VStack reverse gap="3">
                    <div className="bg-purple-100 p-3 rounded text-center">First</div>
                    <div className="bg-purple-200 p-3 rounded text-center">Second</div>
                    <div className="bg-purple-300 p-3 rounded text-center">Third</div>
                </VStack>
            </div>
        </div>
    );
}
