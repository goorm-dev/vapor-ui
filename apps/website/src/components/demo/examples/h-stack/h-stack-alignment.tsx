import { HStack } from '@vapor-ui/core';

export default function HStackAlignment() {
    return (
        <div className="flex flex-wrap gap-2">
            <div>
                <h4 className="text-sm font-medium mb-2">Align Start</h4>
                <HStack gap="2" alignItems="start" className="h-20 bg-gray-50 p-2 rounded">
                    <div className="bg-blue-100 p-2 rounded text-sm">Short</div>
                    <div className="bg-blue-200 p-4 rounded text-sm">Medium Height</div>
                    <div className="bg-blue-300 p-1 rounded text-sm">Tiny</div>
                </HStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Align Center</h4>
                <HStack gap="2" alignItems="center" className="h-20 bg-gray-50 p-2 rounded">
                    <div className="bg-green-100 p-2 rounded text-sm">Short</div>
                    <div className="bg-green-200 p-4 rounded text-sm">Medium Height</div>
                    <div className="bg-green-300 p-1 rounded text-sm">Tiny</div>
                </HStack>
            </div>

            <div>
                <h4 className="text-sm font-medium mb-2">Align End</h4>
                <HStack gap="2" alignItems="end" className="h-20 bg-gray-50 p-2 rounded">
                    <div className="bg-purple-100 p-2 rounded text-sm">Short</div>
                    <div className="bg-purple-200 p-4 rounded text-sm">Medium Height</div>
                    <div className="bg-purple-300 p-1 rounded text-sm">Tiny</div>
                </HStack>
            </div>
        </div>
    );
}
