import { HStack } from '@vapor-ui/core';

export default function HStackJustify() {
    return (
        <div className="space-y-4">
            <div>
                <h4 className="text-sm font-medium mb-2">Justify Start</h4>
                <HStack
                    gap="2"
                    justifyContent="flex-start"
                    className="w-full bg-gray-50 p-2 rounded"
                >
                    <div className="bg-red-100 p-2 rounded text-sm">A</div>
                    <div className="bg-red-200 p-2 rounded text-sm">B</div>
                    <div className="bg-red-300 p-2 rounded text-sm">C</div>
                </HStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Justify Center</h4>
                <HStack gap="2" justifyContent="center" className="w-full bg-gray-50 p-2 rounded">
                    <div className="bg-yellow-100 p-2 rounded text-sm">A</div>
                    <div className="bg-yellow-200 p-2 rounded text-sm">B</div>
                    <div className="bg-yellow-300 p-2 rounded text-sm">C</div>
                </HStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Space Between</h4>
                <HStack
                    gap="2"
                    justifyContent="space-between"
                    className="w-full bg-gray-50 p-2 rounded"
                >
                    <div className="bg-indigo-100 p-2 rounded text-sm">A</div>
                    <div className="bg-indigo-200 p-2 rounded text-sm">B</div>
                    <div className="bg-indigo-300 p-2 rounded text-sm">C</div>
                </HStack>
            </div>
        </div>
    );
}
