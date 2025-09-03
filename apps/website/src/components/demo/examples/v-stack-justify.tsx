import { VStack } from '@vapor-ui/core';

export default function VStackJustify() {
    return (
        <div className="flex gap-8">
            <div>
                <h4 className="text-sm font-medium mb-2">Justify Start</h4>
                <VStack gap="2" justifyContent="flex-start" className="h-40 bg-gray-50 p-2 rounded">
                    <div className="bg-red-100 p-2 rounded text-sm">A</div>
                    <div className="bg-red-200 p-2 rounded text-sm">B</div>
                    <div className="bg-red-300 p-2 rounded text-sm">C</div>
                </VStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Justify Center</h4>
                <VStack gap="2" justifyContent="center" className="h-40 bg-gray-50 p-2 rounded">
                    <div className="bg-yellow-100 p-2 rounded text-sm">A</div>
                    <div className="bg-yellow-200 p-2 rounded text-sm">B</div>
                    <div className="bg-yellow-300 p-2 rounded text-sm">C</div>
                </VStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Space Between</h4>
                <VStack
                    gap="2"
                    justifyContent="space-between"
                    className="h-40 bg-gray-50 p-2 rounded"
                >
                    <div className="bg-indigo-100 p-2 rounded text-sm">A</div>
                    <div className="bg-indigo-200 p-2 rounded text-sm">B</div>
                    <div className="bg-indigo-300 p-2 rounded text-sm">C</div>
                </VStack>
            </div>
        </div>
    );
}
